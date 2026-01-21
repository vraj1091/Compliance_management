"""Work Orders router."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import WorkOrder, WorkOrderOperation, Item, Routing, User
from schemas import WorkOrderCreate, WorkOrderUpdate, WorkOrderResponse
from utils.auth import get_current_user


router = APIRouter(prefix="/api/work-orders", tags=["Work Orders"])


def generate_wo_number(count: int) -> str:
    year = datetime.now().year
    return f"WO-{year}-{count + 1:05d}"


@router.get("", response_model=List[WorkOrderResponse])
async def get_work_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(WorkOrder).order_by(WorkOrder.created_at.desc())
    if status:
        query = query.where(WorkOrder.status == status)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_work_order(
    wo_data: WorkOrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(WorkOrder.id)))
    count = result.scalar() or 0
    wo = WorkOrder(work_order_number=generate_wo_number(count), created_by=current_user.id, **wo_data.model_dump())
    db.add(wo)
    await db.commit()
    await db.refresh(wo)
    return wo


@router.get("/{wo_id}", response_model=WorkOrderResponse)
async def get_work_order(wo_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == wo_id))
    wo = result.scalar_one_or_none()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    return wo


@router.patch("/{wo_id}", response_model=WorkOrderResponse)
async def update_work_order(wo_id: str, wo_data: WorkOrderUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == wo_id))
    wo = result.scalar_one_or_none()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    for field, value in wo_data.model_dump(exclude_unset=True).items():
        setattr(wo, field, value)
    await db.commit()
    await db.refresh(wo)
    return wo


@router.post("/{wo_id}/release")
async def release_work_order(wo_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == wo_id))
    wo = result.scalar_one_or_none()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    wo.status = "Released"
    wo.start_date = datetime.utcnow()
    await db.commit()
    return {"message": "Work order released"}


@router.patch("/{wo_id}/complete")
async def complete_work_order(wo_id: str, quantity_completed: float, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == wo_id))
    wo = result.scalar_one_or_none()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    wo.quantity_completed = quantity_completed
    wo.status = "Completed"
    wo.actual_completion = datetime.utcnow()
    await db.commit()
    return {"message": "Work order completed"}
