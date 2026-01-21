"""NC/CAPA router."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime, date

from database import get_db
from models import Nonconformance, CAPARecord, EffectivenessCheck, User
from schemas import (
    NonconformanceCreate, NonconformanceUpdate, NonconformanceResponse,
    CAPACreate, CAPAUpdate, CAPAResponse
)
from utils.auth import get_current_user


router = APIRouter(prefix="/api", tags=["NC/CAPA"])


def generate_nc_number(count: int) -> str:
    """Generate NC number."""
    year = datetime.now().year
    return f"NC-{year}-{count + 1:04d}"


def generate_capa_number(count: int) -> str:
    """Generate CAPA number."""
    year = datetime.now().year
    return f"CAPA-{year}-{count + 1:04d}"


# ==================== Nonconformances ====================

@router.get("/nonconformances", response_model=List[NonconformanceResponse])
async def get_nonconformances(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all nonconformances."""
    query = select(Nonconformance).order_by(Nonconformance.created_at.desc())
    
    if status:
        query = query.where(Nonconformance.status == status)
    if severity:
        query = query.where(Nonconformance.severity == severity)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/nonconformances", response_model=NonconformanceResponse, status_code=status.HTTP_201_CREATED)
async def create_nonconformance(
    nc_data: NonconformanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new nonconformance."""
    result = await db.execute(select(func.count(Nonconformance.id)))
    count = result.scalar() or 0
    
    nc = Nonconformance(
        nc_number=generate_nc_number(count),
        created_by=current_user.id,
        **nc_data.model_dump()
    )
    db.add(nc)
    await db.commit()
    await db.refresh(nc)
    
    return nc


@router.get("/nonconformances/{nc_id}", response_model=NonconformanceResponse)
async def get_nonconformance(
    nc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific nonconformance."""
    result = await db.execute(select(Nonconformance).where(Nonconformance.id == nc_id))
    nc = result.scalar_one_or_none()
    if not nc:
        raise HTTPException(status_code=404, detail="Nonconformance not found")
    return nc


@router.put("/nonconformances/{nc_id}", response_model=NonconformanceResponse)
async def update_nonconformance(
    nc_id: str,
    nc_data: NonconformanceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a nonconformance."""
    result = await db.execute(select(Nonconformance).where(Nonconformance.id == nc_id))
    nc = result.scalar_one_or_none()
    if not nc:
        raise HTTPException(status_code=404, detail="Nonconformance not found")
    
    update_data = nc_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(nc, field, value)
    
    if nc_data.status == "Closed":
        nc.closed_date = date.today()
    
    await db.commit()
    await db.refresh(nc)
    
    return nc


# ==================== CAPA ====================

@router.get("/caparecords", response_model=List[CAPAResponse])
async def get_capa_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all CAPA records."""
    query = select(CAPARecord).order_by(CAPARecord.created_at.desc())
    
    if status:
        query = query.where(CAPARecord.status == status)
    if priority:
        query = query.where(CAPARecord.priority == priority)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/caparecords", response_model=CAPAResponse, status_code=status.HTTP_201_CREATED)
async def create_capa(
    capa_data: CAPACreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new CAPA record."""
    result = await db.execute(select(func.count(CAPARecord.id)))
    count = result.scalar() or 0
    
    capa = CAPARecord(
        capa_number=generate_capa_number(count),
        **capa_data.model_dump()
    )
    db.add(capa)
    await db.commit()
    await db.refresh(capa)
    
    return capa


@router.get("/caparecords/{capa_id}", response_model=CAPAResponse)
async def get_capa(
    capa_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific CAPA record."""
    result = await db.execute(select(CAPARecord).where(CAPARecord.id == capa_id))
    capa = result.scalar_one_or_none()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA not found")
    return capa


@router.put("/caparecords/{capa_id}", response_model=CAPAResponse)
async def update_capa(
    capa_id: str,
    capa_data: CAPAUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a CAPA record."""
    result = await db.execute(select(CAPARecord).where(CAPARecord.id == capa_id))
    capa = result.scalar_one_or_none()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA not found")
    
    update_data = capa_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(capa, field, value)
    
    if capa_data.status == "Closed":
        capa.completion_date = date.today()
    
    await db.commit()
    await db.refresh(capa)
    
    return capa


@router.post("/caparecords/{capa_id}/effectiveness")
async def add_effectiveness_check(
    capa_id: str,
    result_status: str,
    comments: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add effectiveness check to CAPA."""
    result = await db.execute(select(CAPARecord).where(CAPARecord.id == capa_id))
    capa = result.scalar_one_or_none()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA not found")
    
    check = EffectivenessCheck(
        capa_id=capa_id,
        check_date=date.today(),
        result=result_status,
        approved_by=current_user.id,
        comments=comments
    )
    db.add(check)
    
    if result_status == "Effective":
        capa.status = "Closed"
        capa.completion_date = date.today()
    
    await db.commit()
    
    return {"message": "Effectiveness check added"}
