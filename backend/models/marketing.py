"""Marketing Department Models"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Float, Numeric
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())


class Customer(Base):
    """Customer Master"""
    __tablename__ = "customers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_code = Column(String(50), unique=True, nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_type = Column(String(50))  # Dealer/Hospital/Distributor
    
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    postal_code = Column(String(20))
    
    contact_person = Column(String(255))
    phone = Column(String(50))
    email = Column(String(255))
    gstin = Column(String(50))
    
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    inquiries = relationship("Inquiry", back_populates="customer")
    orders = relationship("OrderConfirmation", back_populates="customer")
    complaints = relationship("CustomerComplaint", back_populates="customer")
    feedbacks = relationship("CustomerFeedback", back_populates="customer")


class Inquiry(Base):
    """Inquiry Register (M1-M12)"""
    __tablename__ = "inquiries"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    inquiry_no = Column(String(50), unique=True, nullable=False)
    sr_no = Column(Integer)  # M1
    inquiry_date = Column(Date, nullable=False)  # M2
    
    customer_id = Column(String(36), ForeignKey("customers.id"))
    customer_name = Column(String(255))  # M3
    mode_of_inquiry = Column(String(100))  # M4 - Phone/Email/Visit/Website
    contact_person = Column(String(255))  # M5
    contact_number = Column(String(50))  # M6
    
    item_requirement = Column(Text)  # M7
    required_quantity = Column(String(100))  # M8
    specific_remarks = Column(Text)  # M9
    
    reviewed_by = Column(String(255))  # M10
    status = Column(String(50), default="Open")  # M11 - Open/Quoted/Converted/Lost
    remarks = Column(Text)  # M12
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="inquiries")


class OrderConfirmation(Base):
    """Order Confirmation (M13-M31)"""
    __tablename__ = "order_confirmations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    oc_number = Column(String(50), unique=True, nullable=False)  # M13
    oc_date = Column(Date, nullable=False)  # M15
    
    product_generic_name = Column(String(255))  # M14
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    buyer_name_address = Column(Text)  # M16
    gstin = Column(String(50))  # M17
    kind_attn = Column(String(255))  # M18
    contact_no = Column(String(50))  # M19
    email_id = Column(String(255))  # M20
    
    # Order items stored as JSON or separate table
    total_amount = Column(Numeric(12, 2))  # M25
    gst_amount = Column(Numeric(12, 2))  # M26
    grand_total = Column(Numeric(12, 2))  # M27
    amount_in_words = Column(String(500))  # M28
    
    expected_dispatch = Column(Date)  # M29
    prepared_by = Column(String(255))  # M30
    approved_by = Column(String(255))  # M31
    
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    work_orders = relationship("InternalWorkOrder", back_populates="order")


class OrderItem(Base):
    """Order Line Items (M21-M25)"""
    __tablename__ = "order_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("order_confirmations.id"), nullable=False)
    sr_no = Column(Integer)  # M21
    item_details = Column(String(500))  # M22
    quantity = Column(Numeric(10, 2))  # M23
    rate = Column(Numeric(10, 2))  # M24
    amount = Column(Numeric(12, 2))  # M25
    
    order = relationship("OrderConfirmation", back_populates="items")


class InternalWorkOrder(Base):
    """Internal Work Order (M32-M48)"""
    __tablename__ = "internal_work_orders"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    iwo_number = Column(String(50), unique=True, nullable=False)  # M34
    iwo_date = Column(Date, nullable=False)  # M32
    
    customer_po_ref = Column(String(100))  # M33
    order_id = Column(String(36), ForeignKey("order_confirmations.id"))
    customer_name = Column(String(255))  # M35
    expected_dispatch = Column(Date)  # M36
    
    sr_no = Column(Integer)  # M37
    item_name = Column(String(255))  # M38
    required_quantity = Column(Numeric(10, 2))  # M39
    
    labelling_instruction = Column(Text)  # M40
    packing_instruction = Column(Text)  # M41
    other_instruction = Column(Text)  # M42
    
    material_available_fg = Column(Boolean)  # M43
    production_required = Column(Boolean)  # M44
    
    dispatched_date = Column(Date)  # M45
    transporter_details = Column(String(255))  # M46
    
    prepared_by = Column(String(255))  # M47
    approved_by = Column(String(255))  # M48
    
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    order = relationship("OrderConfirmation", back_populates="work_orders")


class CustomerFeedback(Base):
    """Customer Feedback Form (M49-M59)"""
    __tablename__ = "customer_feedbacks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    feedback_no = Column(String(50), unique=True, nullable=False)
    feedback_date = Column(Date, nullable=False)
    
    customer_id = Column(String(36), ForeignKey("customers.id"))
    customer_name = Column(String(255))  # M49
    contact_name = Column(String(255))  # M50
    
    # Ratings (1-5 scale)
    product_satisfaction = Column(Integer)  # Excellent=5, Good=4, Above Avg=3, Avg=2, Needs Improvement=1
    quality_rating = Column(Integer)  # M51-M55
    customer_service_rating = Column(Integer)
    problem_response_rating = Column(Integer)
    overall_performance = Column(Integer)
    
    comments = Column(Text)  # M56
    officer_name = Column(String(255))  # M57
    signature_date = Column(Date)  # M59
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="feedbacks")


class CustomerComplaint(Base):
    """Customer Complaint Register (M60-M69)"""
    __tablename__ = "customer_complaints"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_no = Column(String(50), unique=True, nullable=False)  # M60
    
    customer_id = Column(String(36), ForeignKey("customers.id"))
    customer_name = Column(String(255))  # M61
    complaint_details = Column(Text, nullable=False)  # M62
    receipt_date = Column(Date, nullable=False)  # M63
    
    assigned_to = Column(String(255))  # M64
    corrective_action_no = Column(String(50))  # M65 - Link to CAPA
    
    closed_date = Column(Date)  # M66
    closed_by = Column(String(255))  # M67
    mrm_discussion_points = Column(Text)  # M68
    closure_signature = Column(String(255))  # M69
    
    status = Column(String(50), default="Open")
    severity = Column(String(50))  # Critical/Major/Minor
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="complaints")
