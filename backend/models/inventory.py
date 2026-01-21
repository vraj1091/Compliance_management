"""SQLAlchemy models for Quality Control and Inventory."""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, DateTime, Date, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


# ==================== Quality Control ====================

class InspectionPlan(Base):
    """Inspection plans for items."""
    __tablename__ = "inspection_plans"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    plan_name = Column(String(255), nullable=False)
    inspection_type = Column(String(100))  # Incoming, In-Process, Final
    sampling_level = Column(String(50))  # 100%, AQL 1.0, etc.
    acceptance_criteria = Column(Text)
    instructions = Column(Text)
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    item = relationship("Item", back_populates="inspection_plans")
    specifications = relationship("TestSpecification", back_populates="inspection_plan")
    records = relationship("InspectionRecord", back_populates="inspection_plan")


class TestSpecification(Base):
    """Test specifications within an inspection plan."""
    __tablename__ = "test_specifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_plan_id = Column(String(36), ForeignKey("inspection_plans.id"), nullable=False)
    test_name = Column(String(255), nullable=False)
    test_method = Column(String(255))
    specification = Column(String(255))
    lower_limit = Column(Numeric(10, 4))
    upper_limit = Column(Numeric(10, 4))
    unit = Column(String(50))
    sequence = Column(Integer, default=1)
    is_critical = Column(String(10), default="No")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inspection_plan = relationship("InspectionPlan", back_populates="specifications")


class InspectionRecord(Base):
    """Inspection records for work orders."""
    __tablename__ = "inspection_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    work_order_id = Column(String(36), ForeignKey("work_orders.id"), nullable=False)
    inspection_plan_id = Column(String(36), ForeignKey("inspection_plans.id"), nullable=False)
    inspector_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    inspection_date = Column(DateTime, default=datetime.utcnow)
    lot_number = Column(String(100))
    sample_size = Column(Integer)
    status = Column(String(50), default="In Progress")  # In Progress, Pass, Fail, Conditional
    disposition = Column(String(50))  # Accept, Reject, Rework, Use As Is
    disposition_by = Column(String(36), ForeignKey("users.id"))
    disposition_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    work_order = relationship("WorkOrder", back_populates="inspections")
    inspection_plan = relationship("InspectionPlan", back_populates="records")
    results = relationship("TestResult", back_populates="inspection_record", cascade="all, delete-orphan")


class TestResult(Base):
    """Individual test results."""
    __tablename__ = "test_results"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_record_id = Column(String(36), ForeignKey("inspection_records.id", ondelete="CASCADE"), nullable=False)
    test_name = Column(String(255), nullable=False)
    test_specification = Column(String(255))
    actual_result = Column(String(255))
    acceptance_status = Column(String(50))  # Pass, Fail
    recorded_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inspection_record = relationship("InspectionRecord", back_populates="results")


# ==================== Inventory ====================

class Inventory(Base):
    """Inventory levels by location."""
    __tablename__ = "inventory"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    warehouse_location = Column(String(100), nullable=False)
    bin_location = Column(String(50))
    quantity_on_hand = Column(Numeric(10, 4), default=0)
    quantity_reserved = Column(Numeric(10, 4), default=0)
    quantity_available = Column(Numeric(10, 4), default=0)
    reorder_point = Column(Numeric(10, 4))
    last_counted_date = Column(Date)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    item = relationship("Item", back_populates="inventory")


class LotTracking(Base):
    """Lot tracking for items."""
    __tablename__ = "lot_tracking"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    lot_number = Column(String(50), nullable=False)
    manufacturing_date = Column(Date)
    expiry_date = Column(Date)
    quantity_manufactured = Column(Numeric(10, 4))
    quantity_remaining = Column(Numeric(10, 4))
    supplier_lot = Column(String(100))
    status = Column(String(50), default="Available")  # Available, Reserved, Quarantine, Expired
    warehouse_location = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    item = relationship("Item", back_populates="lot_tracking")
    serial_numbers = relationship("SerialNumber", back_populates="lot")


class SerialNumber(Base):
    """Serial number tracking."""
    __tablename__ = "serial_numbers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    serial_number = Column(String(100), nullable=False)
    lot_id = Column(String(36), ForeignKey("lot_tracking.id"))
    status = Column(String(50), default="Active")  # Active, Shipped, Returned, Scrapped
    ship_date = Column(Date)
    customer_name = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lot = relationship("LotTracking", back_populates="serial_numbers")
