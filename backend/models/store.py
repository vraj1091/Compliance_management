"""Store/Inventory Department Models"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Float, Numeric
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())


class MaterialInward(Base):
    """Material Inward Register (S1-S9)"""
    __tablename__ = "material_inward"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    grn_number = Column(String(50), unique=True, nullable=False)  # Goods Receipt Note
    sr_no = Column(Integer)  # S1
    
    po_no = Column(String(50))  # S2
    po_date = Column(Date)  # S3
    inward_date = Column(Date, nullable=False)  # S4
    bill_no = Column(String(100))  # S5
    
    item_id = Column(String(36), ForeignKey("items.id"))
    item_name = Column(String(255))  # S6
    quantity = Column(Numeric(10, 2))  # S7
    uom = Column(String(50))
    
    party_name = Column(String(255))  # S8
    vendor_id = Column(String(36), ForeignKey("vendors.id"))
    
    received_by = Column(String(255))  # S9
    qc_status = Column(String(50), default="Pending")  # Pending/Approved/Rejected
    release_no = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)


class ReceivingMemo(Base):
    """Receiving Memo (S10-S19)"""
    __tablename__ = "receiving_memos"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    memo_number = Column(String(50), unique=True, nullable=False)
    
    supplier_name = Column(String(255))  # S10
    bill_number = Column(String(100))  # S11
    memo_date = Column(Date, nullable=False)  # S12
    
    sr_no = Column(Integer)  # S13
    item_name = Column(String(255))  # S14
    received_qty = Column(Numeric(10, 2))  # S15
    released_qty = Column(Numeric(10, 2))  # S16
    release_no = Column(String(50))  # S17
    
    storekeeper_signature = Column(String(255))  # S18
    authorized_signature = Column(String(255))  # S19
    
    created_at = Column(DateTime, default=datetime.utcnow)


class IndentSlip(Base):
    """Indent/Issue Slip (S20-S28)"""
    __tablename__ = "indent_slips"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    indent_number = Column(String(50), unique=True, nullable=False)
    indent_date = Column(Date, nullable=False)  # S20
    
    sr_no = Column(Integer)  # S21
    item_id = Column(String(36), ForeignKey("items.id"))
    item_name = Column(String(255))  # S22
    size_specification = Column(String(255))  # S23
    
    qty_required = Column(Numeric(10, 2))  # S24
    qty_issued = Column(Numeric(10, 2))  # S25
    batch_number = Column(String(100))  # S26
    
    requested_by = Column(String(255))
    requesting_department = Column(String(100))
    receiver_signature = Column(String(255))  # S27
    store_incharge_signature = Column(String(255))  # S28
    
    purpose = Column(String(255))  # Production/R&D/Maintenance
    status = Column(String(50), default="Pending")
    
    created_at = Column(DateTime, default=datetime.utcnow)


class OutwardRegister(Base):
    """Outward Register (S29-S35)"""
    __tablename__ = "outward_register"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    outward_number = Column(String(50), unique=True, nullable=False)
    outward_date = Column(Date, nullable=False)  # S29
    
    bill_no = Column(String(100))  # S30
    item_id = Column(String(36), ForeignKey("items.id"))
    item_name = Column(String(255))  # S31
    
    customer_id = Column(String(36), ForeignKey("customers.id"))
    customer_name = Column(String(255))  # S32
    
    batch_no = Column(String(100))  # S33
    dispatch_qty = Column(Numeric(10, 2))  # S34
    uom = Column(String(50))
    
    dispatched_by = Column(String(255))  # S35
    transporter = Column(String(255))
    vehicle_no = Column(String(50))
    lr_no = Column(String(100))  # Lorry Receipt Number
    
    created_at = Column(DateTime, default=datetime.utcnow)


class StockRegister(Base):
    """Stock Register / Bin Card"""
    __tablename__ = "stock_register"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    item_code = Column(String(50))
    item_name = Column(String(255))
    
    warehouse_location = Column(String(100))
    bin_location = Column(String(50))
    
    opening_balance = Column(Numeric(10, 2), default=0)
    quantity_received = Column(Numeric(10, 2), default=0)
    quantity_issued = Column(Numeric(10, 2), default=0)
    closing_balance = Column(Numeric(10, 2), default=0)
    
    reorder_level = Column(Numeric(10, 2))
    minimum_stock = Column(Numeric(10, 2))
    maximum_stock = Column(Numeric(10, 2))
    
    last_receipt_date = Column(Date)
    last_issue_date = Column(Date)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
