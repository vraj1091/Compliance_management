"""Maintenance Department API Routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date, datetime
import uuid

from database import get_db
from models.maintenance import CleaningRecord, Equipment, PreventiveMaintenance, BreakdownRecord
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance Department"])


# ==================== Equipment Endpoints ====================

@router.get("/equipment")
async def list_equipment(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all equipment"""
    query = select(Equipment)
    if status:
        query = query.where(Equipment.status == status)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/equipment", status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_name: str,
    make: Optional[str] = None,
    model: Optional[str] = None,
    serial_number: Optional[str] = None,
    location: Optional[str] = None,
    source_of_maintenance: Optional[str] = "Internal",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new equipment"""
    # Generate equipment ID
    result = await db.execute(select(func.count(Equipment.id)))
    count = result.scalar() or 0
    equipment_id = f"EQP-{count + 1:04d}"
    
    equipment = Equipment(
        id=str(uuid.uuid4()),
        equipment_id=equipment_id,
        equipment_name=equipment_name,
        make=make,
        model=model,
        serial_number=serial_number,
        location=location,
        source_of_maintenance=source_of_maintenance
    )
    db.add(equipment)
    await db.commit()
    await db.refresh(equipment)
    return equipment


@router.get("/equipment/{equipment_id}")
async def get_equipment(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get equipment by ID with maintenance history"""
    result = await db.execute(
        select(Equipment)
        .options(selectinload(Equipment.maintenance_records), selectinload(Equipment.breakdowns))
        .where(Equipment.id == equipment_id)
    )
    equipment = result.scalar_one_or_none()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment


@router.put("/equipment/{equipment_id}")
async def update_equipment(
    equipment_id: str,
    equipment_name: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update equipment"""
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if equipment_name:
        equipment.equipment_name = equipment_name
    if location:
        equipment.location = location
    if status:
        equipment.status = status
    
    await db.commit()
    await db.refresh(equipment)
    return equipment


# ==================== Preventive Maintenance Endpoints ====================

@router.get("/preventive-maintenance")
async def list_preventive_maintenance(
    equipment_id: Optional[str] = None,
    month_year: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List preventive maintenance records"""
    query = select(PreventiveMaintenance)
    if equipment_id:
        query = query.where(PreventiveMaintenance.equipment_id == equipment_id)
    if month_year:
        query = query.where(PreventiveMaintenance.month_year == month_year)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/preventive-maintenance", status_code=status.HTTP_201_CREATED)
async def create_pm_record(
    equipment_id: str,
    month_year: str,
    check_points: Optional[str] = None,
    frequency: Optional[str] = "Monthly",
    checked_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create preventive maintenance record"""
    # Get equipment details
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    pm = PreventiveMaintenance(
        id=str(uuid.uuid4()),
        equipment_id=equipment_id,
        equipment_name=equipment.equipment_name,
        equipment_id_no=equipment.equipment_id,
        month_year=month_year,
        check_points=check_points,
        frequency=frequency,
        checked_by=checked_by
    )
    db.add(pm)
    await db.commit()
    await db.refresh(pm)
    return pm


# ==================== Breakdown Records Endpoints ====================

@router.get("/breakdowns")
async def list_breakdowns(
    status: Optional[str] = None,
    equipment_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List breakdown records"""
    query = select(BreakdownRecord)
    if status:
        query = query.where(BreakdownRecord.status == status)
    if equipment_id:
        query = query.where(BreakdownRecord.equipment_id == equipment_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/breakdowns", status_code=status.HTTP_201_CREATED)
async def create_breakdown(
    equipment_id: str,
    description: str,
    start_date: date,
    start_time: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create breakdown record"""
    # Get equipment details
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Generate breakdown number
    result = await db.execute(select(func.count(BreakdownRecord.id)))
    count = result.scalar() or 0
    breakdown_no = f"BD-{date.today().year}-{count + 1:04d}"
    
    breakdown = BreakdownRecord(
        id=str(uuid.uuid4()),
        breakdown_no=breakdown_no,
        equipment_id=equipment_id,
        machine_id_no=equipment.equipment_id,
        machine_name=equipment.equipment_name,
        description=description,
        start_date=start_date,
        start_time=start_time,
        year=date.today().year
    )
    db.add(breakdown)
    await db.commit()
    await db.refresh(breakdown)
    return breakdown


@router.put("/breakdowns/{breakdown_id}")
async def update_breakdown(
    breakdown_id: str,
    end_date: Optional[date] = None,
    end_time: Optional[str] = None,
    maintenance_details: Optional[str] = None,
    corrective_action_needed: Optional[bool] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update breakdown record"""
    result = await db.execute(select(BreakdownRecord).where(BreakdownRecord.id == breakdown_id))
    breakdown = result.scalar_one_or_none()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown record not found")
    
    if end_date:
        breakdown.end_date = end_date
    if end_time:
        breakdown.end_time = end_time
    if maintenance_details:
        breakdown.maintenance_details = maintenance_details
    if corrective_action_needed is not None:
        breakdown.corrective_action_needed = corrective_action_needed
    if status:
        breakdown.status = status
    
    await db.commit()
    await db.refresh(breakdown)
    return breakdown


# ==================== Cleaning Records Endpoints ====================

@router.get("/cleaning-records")
async def list_cleaning_records(
    month: Optional[str] = None,
    year: Optional[int] = None,
    area: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List cleaning records"""
    query = select(CleaningRecord)
    if month:
        query = query.where(CleaningRecord.month == month)
    if year:
        query = query.where(CleaningRecord.year == year)
    if area:
        query = query.where(CleaningRecord.area == area)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/cleaning-records", status_code=status.HTTP_201_CREATED)
async def create_cleaning_record(
    area: str,
    day: int,
    month: str,
    year: int,
    done_by: Optional[str] = None,
    time: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create cleaning record"""
    record = CleaningRecord(
        id=str(uuid.uuid4()),
        area=area,
        day=day,
        month=month,
        year=year,
        is_cleaned=True,
        done_by=done_by,
        time=time
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


# ==================== Dashboard/Stats ====================

@router.get("/stats")
async def get_maintenance_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get maintenance department statistics"""
    # Total equipment
    result = await db.execute(select(func.count(Equipment.id)))
    total_equipment = result.scalar() or 0
    
    # Active equipment
    result = await db.execute(select(func.count(Equipment.id)).where(Equipment.status == "Active"))
    active_equipment = result.scalar() or 0
    
    # Open breakdowns
    result = await db.execute(select(func.count(BreakdownRecord.id)).where(BreakdownRecord.status == "Open"))
    open_breakdowns = result.scalar() or 0
    
    # PM due this month
    current_month = f"{date.today().strftime('%B')}-{date.today().year}"
    result = await db.execute(
        select(func.count(PreventiveMaintenance.id))
        .where(PreventiveMaintenance.month_year == current_month)
    )
    pm_due = result.scalar() or 0
    
    return {
        "total_equipment": total_equipment,
        "active_equipment": active_equipment,
        "open_breakdowns": open_breakdowns,
        "pm_due_this_month": pm_due
    }
