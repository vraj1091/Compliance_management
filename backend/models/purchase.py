"""Purchase Department Models"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Float, Numeric
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())


class Vendor(Base):
    """Vendor Registration (P10-P55)"""
    __tablename__ = "vendors"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    vendor_code = Column(String(50), unique=True, nullable=False)
    vendor_name = Column(String(255), nullable=False)  # P10
    
    # Office Address
    office_address = Column(Text)  # P11
    office_postal_code = Column(String(20))  # P12
    office_phone = Column(String(50))  # P13
    email = Column(String(255))  # P14
    contact_person = Column(String(255))  # P15
    contact_designation = Column(String(100))
    
    # Works Address
    works_address = Column(Text)  # P16
    works_postal_code = Column(String(20))  # P17
    works_phone = Column(String(50))  # P18
    gst_no = Column(String(50))  # P19
    works_contact_person = Column(String(255))  # P20
    
    # Nature of Business (P21-P26)
    is_trading = Column(Boolean, default=False)  # P21
    is_manufacturing = Column(Boolean, default=False)  # P22
    is_contract_manufacturing = Column(Boolean, default=False)  # P23
    is_service_provider = Column(Boolean, default=False)  # P24
    is_outsourced_service = Column(Boolean, default=False)  # P25
    is_labour_contractor = Column(Boolean, default=False)  # P26
    
    products_services = Column(Text)  # P27
    is_iso_certified = Column(String(20))  # P28-P30: Yes/No/Not Known
    iso_certificate_no = Column(String(100))
    
    # Approval Status (P31-P34)
    approval_status = Column(String(50), default="Pending")  # Approved/Re-approved/Pending/Rejected
    approval_date = Column(Date)  # P31
    reapproval_date = Column(Date)  # P32
    reassess_required = Column(Boolean, default=False)  # P33
    rejection_reason = Column(Text)  # P34
    
    # Approval signatures (P35-P39)
    approver_1 = Column(String(255))  # P35
    approver_2 = Column(String(255))  # P36
    top_management_decision = Column(Text)  # P39
    
    is_critical_item_vendor = Column(Boolean, default=False)  # P40
    rejection_count = Column(Integer, default=0)  # P41
    
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    audits = relationship("VendorAudit", back_populates="vendor")
    evaluations = relationship("VendorEvaluation", back_populates="vendor")
    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")


class VendorAudit(Base):
    """Vendor Audit Record (P42-P55)"""
    __tablename__ = "vendor_audits"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    audit_no = Column(String(50), unique=True, nullable=False)
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=False)
    
    audit_date = Column(Date, nullable=False)  # P42
    vendor_name = Column(String(255))  # P43
    contact_name = Column(String(255))  # P44
    auditor_name = Column(String(255))  # P45
    department = Column(String(100))  # P46
    auditee_name = Column(String(255))  # P47
    
    # Checklist items (P50-P55)
    has_qms_documentation = Column(Boolean)  # P50
    has_quality_policy = Column(Boolean)  # P51
    has_quality_manual = Column(Boolean)  # P52
    has_documented_procedures = Column(Boolean)
    willing_to_comply_retention = Column(Boolean)
    
    audit_score = Column(Float)
    audit_result = Column(String(50))  # Pass/Fail/Conditional
    remarks = Column(Text)  # P49
    signature = Column(String(255))  # P48
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    vendor = relationship("Vendor", back_populates="audits")


class PurchaseRequisition(Base):
    """Purchase Requisition (P1-P9)"""
    __tablename__ = "purchase_requisitions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    pr_number = Column(String(50), unique=True, nullable=False)
    pr_date = Column(Date, nullable=False)  # P3
    
    from_department = Column(String(100))  # P1
    to_department = Column(String(100))  # P2
    
    sr_no = Column(Integer)  # P3
    item = Column(String(255), nullable=False)  # P4
    quantity = Column(Numeric(10, 2))  # P5
    make_spec_size = Column(String(255))  # P6
    unit = Column(String(50))  # P7
    needed_by = Column(Date)  # P8
    
    requested_by = Column(String(255))  # P9
    approved_by = Column(String(255))
    status = Column(String(50), default="Pending")  # Pending/Approved/Rejected/Ordered
    
    created_at = Column(DateTime, default=datetime.utcnow)


class PurchaseOrder(Base):
    """Purchase Order (P63-P102)"""
    __tablename__ = "purchase_orders"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    po_number = Column(String(50), unique=True, nullable=False)  # P76
    po_date = Column(Date, nullable=False)  # P77
    modify_date = Column(Date)  # P78
    
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=False)
    vendor_address = Column(Text)  # P63-P65
    contact_person = Column(String(255))  # P66
    contact_no = Column(String(50))  # P67
    email_id = Column(String(255))  # P68
    supplier_gst = Column(String(50))  # P69
    
    our_ref = Column(String(100))  # P70
    consignee_address = Column(Text)  # P71
    offer_ref = Column(String(100))  # P72
    ref_po_number = Column(String(100))  # P74
    
    approval_status = Column(String(50))  # P64
    mode_of_dispatch = Column(String(100))  # P79
    created_by = Column(String(255))  # P80
    
    total_amount = Column(Numeric(12, 2))  # P90
    amount_in_words = Column(String(500))  # P91
    
    pan_no = Column(String(50))  # P93
    gst_no = Column(String(50))  # P94
    
    delivery_period = Column(String(255))
    payment_terms = Column(String(255))
    packing_forwarding = Column(Text)
    
    status = Column(String(50), default="Draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    vendor = relationship("Vendor", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")


class PurchaseOrderItem(Base):
    """Purchase Order Line Items (P81-P89)"""
    __tablename__ = "purchase_order_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    po_id = Column(String(36), ForeignKey("purchase_orders.id"), nullable=False)
    
    sr_no = Column(Integer)  # P81
    item_description = Column(Text, nullable=False)  # P82
    total_qty = Column(Numeric(10, 2))  # P83
    uom = Column(String(50))  # P84
    unit_rate = Column(Numeric(10, 2))  # P85
    discount_percent = Column(Numeric(5, 2))  # P86
    net_rate = Column(Numeric(10, 2))  # P87
    total_amount = Column(Numeric(12, 2))  # P88
    remarks = Column(Text)  # P89
    
    purchase_order = relationship("PurchaseOrder", back_populates="items")


class VendorEvaluation(Base):
    """Vendor Evaluation/Rating (P103-P111)"""
    __tablename__ = "vendor_evaluations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=False)
    vendor_name = Column(String(255))  # P103
    
    sr_no = Column(Integer)  # P104
    po_reference = Column(String(100))  # P105
    po_date = Column(Date)  # P106
    
    # Ratings (0-5 scale)
    quality_score = Column(Integer)  # P107 - 0=Not as per spec, 5=As per spec
    delivery_score = Column(Integer)  # P108 - 0=Not on time, 5=On time
    quantity_score = Column(Integer)  # P109 - 0=Not as per PO, 5=As per PO
    
    total_score = Column(Integer)  # P110 (max 15)
    remarks = Column(Text)  # P111
    
    evaluation_date = Column(Date, nullable=False)
    evaluated_by = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    vendor = relationship("Vendor", back_populates="evaluations")
