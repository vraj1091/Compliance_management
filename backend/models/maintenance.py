"""Maintenance Department Models"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Float
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())


class CleaningRecord(Base):
    """Moping & Cleaning Record (M1-M35)"""
    __tablename__ = "cleaning_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    month = Column(String(20), nullable=False)  # M1
    year = Column(Integer, nullable=False)
    area = Column(String(255), nullable=False)  # M2
    day = Column(Integer, nullable=False)  # M3-M33 (1-31)
    
    is_cleaned = Column(Boolean, default=False)
    done_by = Column(String(255))  # M34
    time = Column(String(50))  # M35
    remarks = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Equipment(Base):
    """Equipment/Machine Master (M88-M95)"""
    __tablename__ = "equipment"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(50), unique=True, nullable=False)  # M89
    equipment_name = Column(String(255), nullable=False)  # M90
    make = Column(String(255))  # M91
    model = Column(String(255))
    serial_number = Column(String(100))
    location = Column(String(255))
    source_of_maintenance = Column(String(255))  # M92 - Internal/External
    
    installation_date = Column(Date)
    warranty_expiry = Column(Date)
    status = Column(String(50), default="Active")
    
    prepared_by = Column(String(255))  # M93
    approved_by = Column(String(255))  # M94
    last_updated = Column(Date)  # M95
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    maintenance_records = relationship("PreventiveMaintenance", back_populates="equipment")
    breakdowns = relationship("BreakdownRecord", back_populates="equipment")


class PreventiveMaintenance(Base):
    """Preventive Maintenance Checklist (M36-M74)"""
    __tablename__ = "preventive_maintenance"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(36), ForeignKey("equipment.id"), nullable=False)
    equipment_name = Column(String(255))  # M36
    equipment_id_no = Column(String(50))  # M37
    month_year = Column(String(20), nullable=False)  # M38
    
    check_points = Column(Text)  # M39 - JSON list of check points
    frequency = Column(String(50))  # M40 - Daily/Weekly/Monthly
    
    # Daily checks (M41-M71 for days 1-31)
    day = Column(Integer)
    check_status = Column(String(50))  # OK/Not OK/NA
    
    checked_by = Column(String(255))  # M72
    verified_by = Column(String(255))  # M73
    approved_by = Column(String(255))  # M74
    
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    equipment = relationship("Equipment", back_populates="maintenance_records")


class BreakdownRecord(Base):
    """Breakdown Register (M75-M87)"""
    __tablename__ = "breakdown_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    breakdown_no = Column(String(50), unique=True, nullable=False)
    year = Column(Integer)  # M75
    
    # Breakdown timing
    start_date = Column(Date, nullable=False)  # M76
    start_time = Column(String(20))  # M77
    end_date = Column(Date)  # M78
    end_time = Column(String(20))  # M79
    total_hours = Column(Float)  # M80
    
    equipment_id = Column(String(36), ForeignKey("equipment.id"), nullable=False)
    machine_id_no = Column(String(50))  # M81
    machine_name = Column(String(255))  # M82
    
    description = Column(Text, nullable=False)  # M83
    maintenance_details = Column(Text)  # M84
    corrective_action_needed = Column(Boolean, default=False)  # M85
    corrective_action_details = Column(Text)
    
    completion_approved_by = Column(String(255))  # M86
    remarks = Column(Text)  # M87
    
    status = Column(String(50), default="Open")  # Open/In Progress/Closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    equipment = relationship("Equipment", back_populates="breakdowns")
