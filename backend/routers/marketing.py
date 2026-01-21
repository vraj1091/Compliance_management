"""Marketing Department API Routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import date
import uuid

from database import get_db
from models.marketing import (
    Customer, Inquiry, OrderConfirmation, OrderItem,
    InternalWorkOrder, CustomerFeedback, CustomerComplaint
)
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/marketing", tags=["Marketing Department"])


# ==================== Customer Endpoints ====================

@router.get("/customers")
async def list_customers(
    skip: int = 0, limit: int = 100, status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(Customer)
    if status:
        query = query.where(Customer.status == status)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/customers", status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_name: str, customer_type: Optional[str] = None,
    address: Optional[str] = None, city: Optional[str] = None,
    contact_person: Optional[str] = None, phone: Optional[str] = None,
    email: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(Customer.id)))
    count = result.scalar() or 0
    customer_code = f"CUST-{count + 1:04d}"
    
    customer = Customer(
        id=str(uuid.uuid4()), customer_code=customer_code, customer_name=customer_name,
        customer_type=customer_type, address=address, city=city,
        contact_person=contact_person, phone=phone, email=email
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


@router.get("/customers/{customer_id}")
async def get_customer(
    customer_id: str, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Customer).options(
            selectinload(Customer.inquiries), selectinload(Customer.orders),
            selectinload(Customer.complaints)
        ).where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


# ==================== Inquiry Endpoints ====================

@router.get("/inquiries")
async def list_inquiries(
    status: Optional[str] = None, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Inquiry)
    if status:
        query = query.where(Inquiry.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/inquiries", status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    customer_name: str, item_requirement: str, inquiry_date: date,
    customer_id: Optional[str] = None, mode_of_inquiry: Optional[str] = None,
    contact_person: Optional[str] = None, contact_number: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(Inquiry.id)))
    count = result.scalar() or 0
    inquiry_no = f"INQ-{date.today().year}-{count + 1:04d}"
    
    inquiry = Inquiry(
        id=str(uuid.uuid4()), inquiry_no=inquiry_no, inquiry_date=inquiry_date,
        customer_id=customer_id, customer_name=customer_name,
        mode_of_inquiry=mode_of_inquiry, contact_person=contact_person,
        contact_number=contact_number, item_requirement=item_requirement
    )
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    return inquiry


# ==================== Order Confirmation Endpoints ====================

@router.get("/orders")
async def list_orders(
    status: Optional[str] = None, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(OrderConfirmation)
    if status:
        query = query.where(OrderConfirmation.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(
    customer_id: str, oc_date: date, product_generic_name: Optional[str] = None,
    total_amount: Optional[float] = None, expected_dispatch: Optional[date] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(OrderConfirmation.id)))
    count = result.scalar() or 0
    oc_number = f"OC-{date.today().year}-{count + 1:04d}"
    
    order = OrderConfirmation(
        id=str(uuid.uuid4()), oc_number=oc_number, oc_date=oc_date,
        customer_id=customer_id, product_generic_name=product_generic_name,
        total_amount=total_amount, expected_dispatch=expected_dispatch
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.get("/orders/{order_id}")
async def get_order(
    order_id: str, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(OrderConfirmation).options(selectinload(OrderConfirmation.items))
        .where(OrderConfirmation.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ==================== Internal Work Order Endpoints ====================

@router.get("/work-orders")
async def list_internal_work_orders(
    status: Optional[str] = None, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(InternalWorkOrder)
    if status:
        query = query.where(InternalWorkOrder.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/work-orders", status_code=status.HTTP_201_CREATED)
async def create_internal_work_order(
    customer_name: str, iwo_date: date, item_name: str,
    required_quantity: float, order_id: Optional[str] = None,
    expected_dispatch: Optional[date] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(InternalWorkOrder.id)))
    count = result.scalar() or 0
    iwo_number = f"IWO-{date.today().year}-{count + 1:04d}"
    
    iwo = InternalWorkOrder(
        id=str(uuid.uuid4()), iwo_number=iwo_number, iwo_date=iwo_date,
        order_id=order_id, customer_name=customer_name, item_name=item_name,
        required_quantity=required_quantity, expected_dispatch=expected_dispatch
    )
    db.add(iwo)
    await db.commit()
    await db.refresh(iwo)
    return iwo


# ==================== Customer Complaint Endpoints ====================

@router.get("/complaints")
async def list_complaints(
    status: Optional[str] = None, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(CustomerComplaint)
    if status:
        query = query.where(CustomerComplaint.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/complaints", status_code=status.HTTP_201_CREATED)
async def create_complaint(
    customer_name: str, complaint_details: str, receipt_date: date,
    customer_id: Optional[str] = None, severity: Optional[str] = "Minor",
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(CustomerComplaint.id)))
    count = result.scalar() or 0
    complaint_no = f"COMP-{date.today().year}-{count + 1:04d}"
    
    complaint = CustomerComplaint(
        id=str(uuid.uuid4()), complaint_no=complaint_no, customer_id=customer_id,
        customer_name=customer_name, complaint_details=complaint_details,
        receipt_date=receipt_date, severity=severity
    )
    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)
    return complaint


@router.put("/complaints/{complaint_id}")
async def update_complaint(
    complaint_id: str, status: Optional[str] = None,
    corrective_action_no: Optional[str] = None, closed_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(CustomerComplaint).where(CustomerComplaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if status:
        complaint.status = status
    if corrective_action_no:
        complaint.corrective_action_no = corrective_action_no
    if closed_by:
        complaint.closed_by = closed_by
        complaint.closed_date = date.today()
    
    await db.commit()
    await db.refresh(complaint)
    return complaint


# ==================== Customer Feedback Endpoints ====================

@router.get("/feedbacks")
async def list_feedbacks(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(CustomerFeedback))
    return result.scalars().all()


@router.post("/feedbacks", status_code=status.HTTP_201_CREATED)
async def create_feedback(
    customer_name: str, feedback_date: date,
    product_satisfaction: int, quality_rating: int,
    customer_service_rating: int, overall_performance: int,
    customer_id: Optional[str] = None, comments: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(CustomerFeedback.id)))
    count = result.scalar() or 0
    feedback_no = f"FB-{date.today().year}-{count + 1:04d}"
    
    feedback = CustomerFeedback(
        id=str(uuid.uuid4()), feedback_no=feedback_no, feedback_date=feedback_date,
        customer_id=customer_id, customer_name=customer_name,
        product_satisfaction=product_satisfaction, quality_rating=quality_rating,
        customer_service_rating=customer_service_rating,
        overall_performance=overall_performance, comments=comments
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback


# ==================== Stats ====================

@router.get("/stats")
async def get_marketing_stats(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(Customer.id)))
    total_customers = result.scalar() or 0
    
    result = await db.execute(select(func.count(Inquiry.id)).where(Inquiry.status == "Open"))
    open_inquiries = result.scalar() or 0
    
    result = await db.execute(select(func.count(OrderConfirmation.id)).where(OrderConfirmation.status == "Pending"))
    pending_orders = result.scalar() or 0
    
    result = await db.execute(select(func.count(CustomerComplaint.id)).where(CustomerComplaint.status == "Open"))
    open_complaints = result.scalar() or 0
    
    return {
        "total_customers": total_customers,
        "open_inquiries": open_inquiries,
        "pending_orders": pending_orders,
        "open_complaints": open_complaints
    }
