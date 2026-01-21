"""Store Department API Routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import date
import uuid

from database import get_db
from models.store import (
    MaterialInward, ReceivingMemo, IndentSlip, OutwardRegister, StockRegister
)
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/store", tags=["Store Department"])


# ==================== Material Inward Endpoints ====================

@router.get("/material-inward")
async def list_material_inward(
    qc_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(MaterialInward)
    if qc_status:
        query = query.where(MaterialInward.qc_status == qc_status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/material-inward", status_code=status.HTTP_201_CREATED)
async def create_material_inward(
    item_name: str, quantity: float, party_name: str, inward_date: date,
    po_no: Optional[str] = None, bill_no: Optional[str] = None,
    received_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(MaterialInward.id)))
    count = result.scalar() or 0
    grn_number = f"GRN-{date.today().year}-{count + 1:04d}"
    
    inward = MaterialInward(
        id=str(uuid.uuid4()), grn_number=grn_number, inward_date=inward_date,
        po_no=po_no, bill_no=bill_no, item_name=item_name,
        quantity=quantity, party_name=party_name, received_by=received_by
    )
    db.add(inward)
    await db.commit()
    await db.refresh(inward)
    return inward


@router.put("/material-inward/{grn_id}")
async def update_material_inward(
    grn_id: str, qc_status: Optional[str] = None, release_no: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(MaterialInward).where(MaterialInward.id == grn_id))
    inward = result.scalar_one_or_none()
    if not inward:
        raise HTTPException(status_code=404, detail="Material inward not found")
    
    if qc_status:
        inward.qc_status = qc_status
    if release_no:
        inward.release_no = release_no
    
    await db.commit()
    await db.refresh(inward)
    return inward


# ==================== Indent Slip Endpoints ====================

@router.get("/indent-slips")
async def list_indent_slips(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(IndentSlip)
    if status:
        query = query.where(IndentSlip.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/indent-slips", status_code=status.HTTP_201_CREATED)
async def create_indent_slip(
    item_name: str, qty_required: float, indent_date: date,
    requesting_department: Optional[str] = None, purpose: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(IndentSlip.id)))
    count = result.scalar() or 0
    indent_number = f"IND-{date.today().year}-{count + 1:04d}"
    
    indent = IndentSlip(
        id=str(uuid.uuid4()), indent_number=indent_number, indent_date=indent_date,
        item_name=item_name, qty_required=qty_required,
        requesting_department=requesting_department, purpose=purpose
    )
    db.add(indent)
    await db.commit()
    await db.refresh(indent)
    return indent


@router.put("/indent-slips/{indent_id}")
async def update_indent_slip(
    indent_id: str, qty_issued: Optional[float] = None,
    batch_number: Optional[str] = None, status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(IndentSlip).where(IndentSlip.id == indent_id))
    indent = result.scalar_one_or_none()
    if not indent:
        raise HTTPException(status_code=404, detail="Indent slip not found")
    
    if qty_issued is not None:
        indent.qty_issued = qty_issued
    if batch_number:
        indent.batch_number = batch_number
    if status:
        indent.status = status
    
    await db.commit()
    await db.refresh(indent)
    return indent


# ==================== Outward Register Endpoints ====================

@router.get("/outward")
async def list_outward(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(OutwardRegister))
    return result.scalars().all()


@router.post("/outward", status_code=status.HTTP_201_CREATED)
async def create_outward(
    item_name: str, customer_name: str, dispatch_qty: float, outward_date: date,
    batch_no: Optional[str] = None, bill_no: Optional[str] = None,
    transporter: Optional[str] = None, vehicle_no: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(OutwardRegister.id)))
    count = result.scalar() or 0
    outward_number = f"OUT-{date.today().year}-{count + 1:04d}"
    
    outward = OutwardRegister(
        id=str(uuid.uuid4()), outward_number=outward_number, outward_date=outward_date,
        item_name=item_name, customer_name=customer_name, dispatch_qty=dispatch_qty,
        batch_no=batch_no, bill_no=bill_no, transporter=transporter, vehicle_no=vehicle_no
    )
    db.add(outward)
    await db.commit()
    await db.refresh(outward)
    return outward


# ==================== Stock Register Endpoints ====================

@router.get("/stock")
async def list_stock(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(StockRegister))
    return result.scalars().all()


@router.post("/stock", status_code=status.HTTP_201_CREATED)
async def create_stock_entry(
    item_id: str, item_name: str, warehouse_location: str,
    opening_balance: float = 0, reorder_level: Optional[float] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    stock = StockRegister(
        id=str(uuid.uuid4()), item_id=item_id, item_name=item_name,
        warehouse_location=warehouse_location, opening_balance=opening_balance,
        closing_balance=opening_balance, reorder_level=reorder_level
    )
    db.add(stock)
    await db.commit()
    await db.refresh(stock)
    return stock


# ==================== Stats ====================

@router.get("/stats")
async def get_store_stats(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(MaterialInward.id)))
    total_grn = result.scalar() or 0
    
    result = await db.execute(select(func.count(MaterialInward.id)).where(MaterialInward.qc_status == "Pending"))
    pending_qc = result.scalar() or 0
    
    result = await db.execute(select(func.count(IndentSlip.id)).where(IndentSlip.status == "Pending"))
    pending_indents = result.scalar() or 0
    
    result = await db.execute(select(func.count(OutwardRegister.id)))
    total_dispatches = result.scalar() or 0
    
    return {
        "total_grn": total_grn,
        "pending_qc": pending_qc,
        "pending_indents": pending_indents,
        "total_dispatches": total_dispatches
    }
