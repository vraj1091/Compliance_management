"""SQLAlchemy models for Manufacturing (Items, BOM, Routing, Work Orders)."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Item(Base):
    """Item master for products and components."""
    __tablename__ = "items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    item_type = Column(String(50))  # Finished Good, Component, Raw Material
    item_revision = Column(String(10), default="A")
    unit_of_measure = Column(String(20), default="EA")
    device_class = Column(String(50))  # Class I, II, III for medical devices
    udi = Column(String(100))  # Unique Device Identifier
    status = Column(String(50), default="Active")  # Active, Inactive, Obsolete
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bom_parents = relationship("BillOfMaterial", back_populates="parent_item", foreign_keys="BillOfMaterial.parent_item_id")
    bom_components = relationship("BillOfMaterial", back_populates="component_item", foreign_keys="BillOfMaterial.component_item_id")
    routings = relationship("Routing", back_populates="item")
    work_orders = relationship("WorkOrder", back_populates="item")
    inspection_plans = relationship("InspectionPlan", back_populates="item")
    inventory = relationship("Inventory", back_populates="item")
    lot_tracking = relationship("LotTracking", back_populates="item")


class BillOfMaterial(Base):
    """Bill of Materials for products."""
    __tablename__ = "bill_of_materials"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    parent_item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    component_item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    quantity = Column(Numeric(10, 4), nullable=False)
    unit_of_measure = Column(String(20))
    revision = Column(Integer, default=1)
    sequence = Column(Integer, default=10)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    parent_item = relationship("Item", back_populates="bom_parents", foreign_keys=[parent_item_id])
    component_item = relationship("Item", back_populates="bom_components", foreign_keys=[component_item_id])


class Routing(Base):
    """Manufacturing routing/operations."""
    __tablename__ = "routings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    operation_sequence = Column(Integer, nullable=False)
    operation_name = Column(String(100), nullable=False)
    work_center = Column(String(50))
    setup_time_minutes = Column(Integer, default=0)
    run_time_per_unit = Column(Numeric(10, 2))
    instructions = Column(Text)
    quality_check_required = Column(String(10), default="No")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    item = relationship("Item", back_populates="routings")


class WorkOrder(Base):
    """Production work orders."""
    __tablename__ = "work_orders"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    work_order_number = Column(String(50), unique=True, nullable=False)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    quantity_ordered = Column(Numeric(10, 4), nullable=False)
    quantity_completed = Column(Numeric(10, 4), default=0)
    quantity_scrapped = Column(Numeric(10, 4), default=0)
    status = Column(String(50), default="Draft")  # Draft, Released, In Progress, Completed, Closed
    priority = Column(String(20), default="Normal")  # Low, Normal, High, Urgent
    start_date = Column(DateTime)
    scheduled_completion = Column(DateTime)
    actual_completion = Column(DateTime)
    lot_number = Column(String(100))
    notes = Column(Text)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    item = relationship("Item", back_populates="work_orders")
    created_by_user = relationship("User", back_populates="work_orders")
    operations = relationship("WorkOrderOperation", back_populates="work_order", cascade="all, delete-orphan")
    inspections = relationship("InspectionRecord", back_populates="work_order")


class WorkOrderOperation(Base):
    """Work order operations tracking."""
    __tablename__ = "work_order_operations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    work_order_id = Column(String(36), ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False)
    operation_sequence = Column(Integer, nullable=False)
    operation_name = Column(String(100), nullable=False)
    work_center = Column(String(50))
    status = Column(String(50), default="Pending")  # Pending, In Progress, Completed
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    operator_id = Column(String(36), ForeignKey("users.id"))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    work_order = relationship("WorkOrder", back_populates="operations")
