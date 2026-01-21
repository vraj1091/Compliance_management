"""SQLAlchemy models for Quality Management (NC, CAPA, Audits)."""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Nonconformance(Base):
    """Nonconformance records."""
    __tablename__ = "nonconformances"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    nc_number = Column(String(50), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20))  # Critical, Major, Minor
    source = Column(String(100))  # Production, Incoming, Customer, Audit
    product_affected = Column(String(255))
    lot_number = Column(String(100))
    quantity_affected = Column(Integer)
    discovered_date = Column(Date, nullable=False)
    discovered_by = Column(String(255))
    root_cause_category = Column(String(100))
    immediate_action = Column(Text)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    assigned_to = Column(String(36), ForeignKey("users.id"))
    status = Column(String(50), default="Open")  # Open, Under Investigation, Resolved, Closed
    closed_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_by_user = relationship("User", back_populates="nonconformances", foreign_keys=[created_by])
    capa_records = relationship("CAPARecord", back_populates="nonconformance")


class CAPARecord(Base):
    """Corrective and Preventive Action records."""
    __tablename__ = "capa_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    capa_number = Column(String(50), unique=True, nullable=False)
    nc_id = Column(String(36), ForeignKey("nonconformances.id"))
    capa_type = Column(String(20))  # Corrective, Preventive
    title = Column(String(255), nullable=False)
    description = Column(Text)
    root_cause = Column(Text)
    root_cause_method = Column(String(50))  # 5-Why, Fishbone, etc.
    corrective_action = Column(Text)
    preventive_action = Column(Text)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    due_date = Column(Date)
    completion_date = Column(Date)
    status = Column(String(50), default="Open")  # Open, In Progress, Pending Verification, Closed
    priority = Column(String(20), default="Medium")  # Low, Medium, High, Critical
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    nonconformance = relationship("Nonconformance", back_populates="capa_records")
    owner = relationship("User", back_populates="capa_records")
    effectiveness_checks = relationship("EffectivenessCheck", back_populates="capa")


class EffectivenessCheck(Base):
    """Effectiveness verification for CAPAs."""
    __tablename__ = "effectiveness_checks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    capa_id = Column(String(36), ForeignKey("capa_records.id"), nullable=False)
    check_date = Column(Date, nullable=False)
    result = Column(String(50))  # Effective, Not Effective, Partially Effective
    evidence = Column(Text)
    approved_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    comments = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    capa = relationship("CAPARecord", back_populates="effectiveness_checks")


class Audit(Base):
    """Audit records."""
    __tablename__ = "audits"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    audit_number = Column(String(50), unique=True, nullable=False)
    audit_type = Column(String(50))  # Internal, External, Regulatory, Supplier
    title = Column(String(255), nullable=False)
    scope = Column(Text)
    criteria = Column(Text)  # Standards/procedures audited against
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    led_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    auditors = Column(Text)  # Comma-separated list or JSON
    auditee_department = Column(String(100))
    status = Column(String(50), default="Scheduled")  # Scheduled, In Progress, Completed, Closed
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    led_by_user = relationship("User", back_populates="audits")
    findings = relationship("AuditFinding", back_populates="audit", cascade="all, delete-orphan")


class AuditFinding(Base):
    """Audit findings."""
    __tablename__ = "audit_findings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    audit_id = Column(String(36), ForeignKey("audits.id", ondelete="CASCADE"), nullable=False)
    finding_number = Column(String(50))
    finding_text = Column(Text, nullable=False)
    finding_type = Column(String(50))  # Observation, Minor NC, Major NC, Opportunity
    severity = Column(String(20))  # Low, Medium, High
    category = Column(String(100))
    clause_reference = Column(String(100))
    response = Column(Text)
    response_due_date = Column(Date)
    status = Column(String(50), default="Open")  # Open, Response Submitted, Verified, Closed
    linked_capa_id = Column(String(36), ForeignKey("capa_records.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    audit = relationship("Audit", back_populates="findings")
