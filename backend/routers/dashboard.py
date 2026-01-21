"""Dashboard router with KPIs and analytics."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta

from database import get_db
from models import (
    User, Nonconformance, CAPARecord, Audit, AuditFinding,
    WorkOrder, TrainingRecord, InspectionRecord
)
from schemas import DashboardResponse, KPIData, ChartData
from utils.auth import get_current_user


router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard KPIs and analytics data."""
    # Get open NCs
    nc_result = await db.execute(
        select(func.count(Nonconformance.id)).where(
            Nonconformance.status.in_(["Open", "Under Investigation", "Pending Disposition"])
        )
    )
    open_ncs = nc_result.scalar() or 0
    
    # Get open CAPAs
    capa_result = await db.execute(
        select(func.count(CAPARecord.id)).where(
            CAPARecord.status.in_(["Open", "In Progress", "Pending Verification"])
        )
    )
    open_capas = capa_result.scalar() or 0
    
    # Get open audit findings
    finding_result = await db.execute(
        select(func.count(AuditFinding.id)).where(
            AuditFinding.status.in_(["Open", "In Progress"])
        )
    )
    open_findings = finding_result.scalar() or 0
    
    # Get overdue trainings (simplified - records past expiry)
    training_result = await db.execute(
        select(func.count(TrainingRecord.id)).where(
            and_(
                TrainingRecord.expiry_date < datetime.utcnow().date(),
                TrainingRecord.is_certified == True
            )
        )
    )
    overdue_trainings = training_result.scalar() or 0
    
    # Get open work orders
    wo_result = await db.execute(
        select(func.count(WorkOrder.id)).where(
            WorkOrder.status.in_(["Planned", "Released", "In Progress"])
        )
    )
    open_work_orders = wo_result.scalar() or 0
    
    # Get pending inspections
    insp_result = await db.execute(
        select(func.count(InspectionRecord.id)).where(
            InspectionRecord.status == "Pending"
        )
    )
    pending_inspections = insp_result.scalar() or 0
    
    # NC Trend (last 6 months)
    nc_trend_labels = []
    nc_trend_data = []
    for i in range(5, -1, -1):
        month_start = datetime.utcnow().replace(day=1) - timedelta(days=30 * i)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        nc_trend_labels.append(month_start.strftime("%b %Y"))
        
        count_result = await db.execute(
            select(func.count(Nonconformance.id)).where(
                and_(
                    Nonconformance.created_at >= month_start,
                    Nonconformance.created_at < month_end
                )
            )
        )
        nc_trend_data.append(count_result.scalar() or 0)
    
    # CAPA Status distribution
    capa_status_result = await db.execute(
        select(CAPARecord.status, func.count(CAPARecord.id)).group_by(CAPARecord.status)
    )
    capa_status = dict(capa_status_result.all())
    
    # Recent Activity (last 10 items)
    recent_ncs = await db.execute(
        select(Nonconformance).order_by(Nonconformance.created_at.desc()).limit(5)
    )
    recent_capas = await db.execute(
        select(CAPARecord).order_by(CAPARecord.created_at.desc()).limit(5)
    )
    
    recent_activity = []
    for nc in recent_ncs.scalars().all():
        recent_activity.append({
            "type": "NC",
            "number": nc.nc_number,
            "title": nc.title,
            "status": nc.status,
            "date": nc.created_at.isoformat()
        })
    for capa in recent_capas.scalars().all():
        recent_activity.append({
            "type": "CAPA",
            "number": capa.capa_number,
            "title": capa.title,
            "status": capa.status,
            "date": capa.created_at.isoformat()
        })
    
    recent_activity.sort(key=lambda x: x["date"], reverse=True)
    
    return DashboardResponse(
        kpis=KPIData(
            open_ncs=open_ncs,
            open_capas=open_capas,
            open_findings=open_findings,
            overdue_trainings=overdue_trainings,
            open_work_orders=open_work_orders,
            pending_inspections=pending_inspections
        ),
        nc_trend=ChartData(
            labels=nc_trend_labels,
            datasets=[{"label": "Nonconformances", "data": nc_trend_data}]
        ),
        capa_status=capa_status,
        recent_activity=recent_activity[:10]
    )


@router.get("/kpis")
async def get_kpis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quick KPI summary."""
    # Open NCs
    nc_result = await db.execute(
        select(func.count(Nonconformance.id)).where(
            Nonconformance.status.in_(["Open", "Under Investigation"])
        )
    )
    open_ncs = nc_result.scalar() or 0
    
    # Open CAPAs
    capa_result = await db.execute(
        select(func.count(CAPARecord.id)).where(
            CAPARecord.status.in_(["Open", "In Progress"])
        )
    )
    open_capas = capa_result.scalar() or 0
    
    # Open Work Orders
    wo_result = await db.execute(
        select(func.count(WorkOrder.id)).where(
            WorkOrder.status.in_(["Planned", "Released", "In Progress"])
        )
    )
    open_work_orders = wo_result.scalar() or 0
    
    return {
        "open_ncs": open_ncs,
        "open_capas": open_capas,
        "open_work_orders": open_work_orders
    }
