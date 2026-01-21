"""Purchase Department API Routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import date
import uuid

from database import get_db
from models.purchase import (
    Vendor, VendorAudit, PurchaseRequisition,
    PurchaseOrder, PurchaseOrderItem, VendorEvaluation
)
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/purchase", tags=["Purchase Department"])


# ==================== Vendor Endpoints ====================

@router.get("/vendors")
async def list_vendors(
    skip: int = 0, limit: int = 100, status: Optional[str] = None,
    approval_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(Vendor)
    if status:
        query = query.where(Vendor.status == status)
    if approval_status:
        query = query.where(Vendor.approval_status == approval_status)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/vendors", status_code=status.HTTP_201_CREATED)
async def create_vendor(
    vendor_name: str, office_address: Optional[str] = None,
    email: Optional[str] = None, contact_person: Optional[str] = None,
    gst_no: Optional[str] = None, products_services: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(Vendor.id)))
    count = result.scalar() or 0
    vendor_code = f"VND-{count + 1:04d}"
    
    vendor = Vendor(
        id=str(uuid.uuid4()), vendor_code=vendor_code, vendor_name=vendor_name,
        office_address=office_address, email=email, contact_person=contact_person,
        gst_no=gst_no, products_services=products_services
    )
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.get("/vendors/{vendor_id}")
async def get_vendor(
    vendor_id: str, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Vendor).options(
            selectinload(Vendor.audits), selectinload(Vendor.evaluations),
            selectinload(Vendor.purchase_orders)
        ).where(Vendor.id == vendor_id)
    )
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.put("/vendors/{vendor_id}")
async def update_vendor(
    vendor_id: str, approval_status: Optional[str] = None,
    status: Optional[str] = None, is_critical_item_vendor: Optional[bool] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    if approval_status:
        vendor.approval_status = approval_status
        if approval_status == "Approved":
            vendor.approval_date = date.today()
    if status:
        vendor.status = status
    if is_critical_item_vendor is not None:
        vendor.is_critical_item_vendor = is_critical_item_vendor
    
    await db.commit()
    await db.refresh(vendor)
    return vendor


# ==================== Purchase Requisition Endpoints ====================

@router.get("/requisitions")
async def list_requisitions(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(PurchaseRequisition)
    if status:
        query = query.where(PurchaseRequisition.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/requisitions", status_code=status.HTTP_201_CREATED)
async def create_requisition(
    item: str, quantity: float, from_department: str,
    needed_by: Optional[date] = None, make_spec_size: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(PurchaseRequisition.id)))
    count = result.scalar() or 0
    pr_number = f"PR-{date.today().year}-{count + 1:04d}"
    
    pr = PurchaseRequisition(
        id=str(uuid.uuid4()), pr_number=pr_number, pr_date=date.today(),
        from_department=from_department, to_department="Purchase",
        item=item, quantity=quantity, make_spec_size=make_spec_size, needed_by=needed_by
    )
    db.add(pr)
    await db.commit()
    await db.refresh(pr)
    return pr


# ==================== Purchase Order Endpoints ====================

@router.get("/orders")
async def list_purchase_orders(
    status: Optional[str] = None, vendor_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(PurchaseOrder)
    if status:
        query = query.where(PurchaseOrder.status == status)
    if vendor_id:
        query = query.where(PurchaseOrder.vendor_id == vendor_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    vendor_id: str, po_date: date, total_amount: Optional[float] = None,
    delivery_period: Optional[str] = None, payment_terms: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(PurchaseOrder.id)))
    count = result.scalar() or 0
    po_number = f"PO-{date.today().year}-{count + 1:04d}"
    
    po = PurchaseOrder(
        id=str(uuid.uuid4()), po_number=po_number, po_date=po_date,
        vendor_id=vendor_id, total_amount=total_amount,
        delivery_period=delivery_period, payment_terms=payment_terms,
        created_by=current_user.username
    )
    db.add(po)
    await db.commit()
    await db.refresh(po)
    return po


@router.get("/orders/{po_id}")
async def get_purchase_order(
    po_id: str, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(PurchaseOrder).options(selectinload(PurchaseOrder.items))
        .where(PurchaseOrder.id == po_id)
    )
    po = result.scalar_one_or_none()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return po


# ==================== Vendor Evaluation Endpoints ====================

@router.get("/evaluations")
async def list_evaluations(
    vendor_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(VendorEvaluation)
    if vendor_id:
        query = query.where(VendorEvaluation.vendor_id == vendor_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/evaluations", status_code=status.HTTP_201_CREATED)
async def create_evaluation(
    vendor_id: str, po_reference: str, quality_score: int,
    delivery_score: int, quantity_score: int,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    total_score = quality_score + delivery_score + quantity_score
    
    evaluation = VendorEvaluation(
        id=str(uuid.uuid4()), vendor_id=vendor_id, po_reference=po_reference,
        quality_score=quality_score, delivery_score=delivery_score,
        quantity_score=quantity_score, total_score=total_score,
        evaluation_date=date.today(), evaluated_by=current_user.username
    )
    db.add(evaluation)
    await db.commit()
    await db.refresh(evaluation)
    return evaluation


# ==================== Stats ====================

@router.get("/stats")
async def get_purchase_stats(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(Vendor.id)))
    total_vendors = result.scalar() or 0
    
    result = await db.execute(select(func.count(Vendor.id)).where(Vendor.approval_status == "Approved"))
    approved_vendors = result.scalar() or 0
    
    result = await db.execute(select(func.count(PurchaseRequisition.id)).where(PurchaseRequisition.status == "Pending"))
    pending_pr = result.scalar() or 0
    
    result = await db.execute(select(func.count(PurchaseOrder.id)).where(PurchaseOrder.status == "Draft"))
    draft_po = result.scalar() or 0
    
    return {
        "total_vendors": total_vendors,
        "approved_vendors": approved_vendors,
        "pending_requisitions": pending_pr,
        "draft_orders": draft_po
    }
