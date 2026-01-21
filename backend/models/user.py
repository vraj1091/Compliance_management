"""SQLAlchemy models for Users and Roles."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Role(Base):
    """Role model for RBAC."""
    __tablename__ = "roles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    permissions = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    users = relationship("User", back_populates="role")
    training_matrix = relationship("TrainingMatrix", back_populates="role")


class User(Base):
    """User model for authentication and authorization."""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=False)
    department = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    role = relationship("Role", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    documents = relationship("Document", back_populates="created_by_user", foreign_keys="Document.created_by")
    training_records = relationship("TrainingRecord", back_populates="employee")
    nonconformances = relationship("Nonconformance", back_populates="created_by_user", foreign_keys="Nonconformance.created_by")
    capa_records = relationship("CAPARecord", back_populates="owner")
    audits = relationship("Audit", back_populates="led_by_user")
    work_orders = relationship("WorkOrder", back_populates="created_by_user", foreign_keys="WorkOrder.created_by")
    
    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()


class AuditLog(Base):
    """Audit log for tracking all system changes."""
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    table_name = Column(String(100))
    record_id = Column(String(36))
    old_values = Column(JSON)
    new_values = Column(JSON)
    ip_address = Column(String(45))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
