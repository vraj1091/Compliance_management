"""Quality Control router for inspections and testing."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import (
    User, InspectionPlan, InspectionRecord, TestResult,
    TestSpecification, WorkOrder
)
from schemas import (
    InspectionPlanCreate, InspectionPlanResponse,
    InspectionRecordCreate, InspectionRecordResponse
)
from utils.auth import get_current_user


router = APIRouter(prefix="/api/qc", tags=["Quality Control"])


# ==================== Inspection Plans ====================

@router.get("/inspection-plans", response_model=List[InspectionPlanResponse])
async def get_inspection_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    item_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all inspection plans."""
    query = select(InspectionPlan).order_by(InspectionPlan.created_at.desc())
    if item_id:
        query = query.where(InspectionPlan.item_id == item_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/inspection-plans", response_model=InspectionPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection_plan(
    plan_data: InspectionPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new inspection plan."""
    plan = InspectionPlan(**plan_data.model_dump())
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


@router.get("/inspection-plans/{plan_id}", response_model=InspectionPlanResponse)
async def get_inspection_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific inspection plan."""
    result = await db.execute(select(InspectionPlan).where(InspectionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Inspection plan not found")
    return plan


# ==================== Inspection Records ====================

@router.get("/inspections", response_model=List[InspectionRecordResponse])
async def get_inspections(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    work_order_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all inspection records."""
    query = select(InspectionRecord).order_by(InspectionRecord.inspection_date.desc())
    if status:
        query = query.where(InspectionRecord.status == status)
    if work_order_id:
        query = query.where(InspectionRecord.work_order_id == work_order_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/inspections", response_model=InspectionRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    inspection_data: InspectionRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new inspection record."""
    inspection = InspectionRecord(
        inspector_id=current_user.id,
        inspection_date=datetime.utcnow(),
        **inspection_data.model_dump()
    )
    db.add(inspection)
    await db.commit()
    await db.refresh(inspection)
    return inspection


@router.get("/inspections/{inspection_id}", response_model=InspectionRecordResponse)
async def get_inspection(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific inspection record."""
    result = await db.execute(select(InspectionRecord).where(InspectionRecord.id == inspection_id))
    inspection = result.scalar_one_or_none()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection


@router.patch("/inspections/{inspection_id}/complete")
async def complete_inspection(
    inspection_id: str,
    disposition: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete an inspection with disposition."""
    result = await db.execute(select(InspectionRecord).where(InspectionRecord.id == inspection_id))
    inspection = result.scalar_one_or_none()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    inspection.status = "Completed"
    inspection.disposition = disposition
    await db.commit()
    
    return {"message": "Inspection completed", "disposition": disposition}


# ==================== Test Specifications ====================

@router.get("/test-specs")
async def get_test_specifications(
    item_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get test specifications."""
    query = select(TestSpecification)
    if item_id:
        query = query.where(TestSpecification.item_id == item_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/test-specs")
async def create_test_specification(
    item_id: str,
    test_name: str,
    test_type: str = "Attribute",
    specification: Optional[str] = None,
    lower_limit: Optional[float] = None,
    upper_limit: Optional[float] = None,
    unit_of_measure: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a test specification."""
    spec = TestSpecification(
        item_id=item_id,
        test_name=test_name,
        test_type=test_type,
        specification=specification,
        lower_limit=lower_limit,
        upper_limit=upper_limit,
        unit_of_measure=unit_of_measure
    )
    db.add(spec)
    await db.commit()
    await db.refresh(spec)
    return spec


# ==================== Test Results ====================

@router.get("/test-results")
async def get_test_results(
    inspection_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get test results."""
    query = select(TestResult)
    if inspection_id:
        query = query.where(TestResult.inspection_id == inspection_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/test-results")
async def record_test_result(
    inspection_id: str,
    test_spec_id: str,
    result_value: Optional[str] = None,
    numeric_value: Optional[float] = None,
    pass_fail: str = "Pass",
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a test result."""
    test_result = TestResult(
        inspection_id=inspection_id,
        test_spec_id=test_spec_id,
        result_value=result_value,
        numeric_value=numeric_value,
        pass_fail=pass_fail,
        notes=notes,
        tested_by=current_user.id,
        tested_at=datetime.utcnow()
    )
    db.add(test_result)
    await db.commit()
    await db.refresh(test_result)
    return test_result
