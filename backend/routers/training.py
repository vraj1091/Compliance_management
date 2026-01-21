"""Training router."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import date, timedelta

from database import get_db
from models import TrainingMatrix, TrainingRecord, User
from schemas import (
    TrainingMatrixCreate, TrainingMatrixResponse,
    TrainingRecordCreate, TrainingRecordResponse
)
from utils.auth import get_current_user


router = APIRouter(prefix="/api", tags=["Training"])


# ==================== Training Matrix ====================

@router.get("/training-matrix", response_model=List[TrainingMatrixResponse])
async def get_training_matrix(
    role_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get training matrix."""
    query = select(TrainingMatrix)
    
    if role_id:
        query = query.where(TrainingMatrix.role_id == role_id)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/training-matrix", response_model=TrainingMatrixResponse, status_code=status.HTTP_201_CREATED)
async def create_training_matrix(
    training_data: TrainingMatrixCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create training matrix entry."""
    training = TrainingMatrix(**training_data.model_dump())
    db.add(training)
    await db.commit()
    await db.refresh(training)
    return training


# ==================== Training Records ====================

@router.get("/training-records", response_model=List[TrainingRecordResponse])
async def get_training_records(
    employee_id: Optional[str] = None,
    is_certified: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get training records."""
    query = select(TrainingRecord)
    
    if employee_id:
        query = query.where(TrainingRecord.employee_id == employee_id)
    if is_certified is not None:
        query = query.where(TrainingRecord.is_certified == is_certified)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/training-records", response_model=TrainingRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_training_record(
    record_data: TrainingRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create training record."""
    record = TrainingRecord(**record_data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/trainings/{employee_id}")
async def get_employee_trainings(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all trainings for an employee."""
    result = await db.execute(
        select(TrainingRecord)
        .where(TrainingRecord.employee_id == employee_id)
        .order_by(TrainingRecord.completion_date.desc())
    )
    return result.scalars().all()


@router.get("/certifications/expiring")
async def get_expiring_certifications(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get certifications expiring within specified days."""
    future_date = date.today() + timedelta(days=days)
    
    result = await db.execute(
        select(TrainingRecord)
        .where(
            and_(
                TrainingRecord.is_certified == True,
                TrainingRecord.expiry_date <= future_date,
                TrainingRecord.expiry_date >= date.today()
            )
        )
        .order_by(TrainingRecord.expiry_date)
    )
    return result.scalars().all()
