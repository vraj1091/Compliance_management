"""SQLAlchemy models for Training and Competency."""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class TrainingMatrix(Base):
    """Training matrix defining required trainings per role."""
    __tablename__ = "training_matrix"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=False)
    training_name = Column(String(255), nullable=False)
    training_code = Column(String(50))
    description = Column(Text)
    is_required = Column(Boolean, default=True)
    frequency_months = Column(Integer)  # Recertification frequency
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    role = relationship("Role", back_populates="training_matrix")
    records = relationship("TrainingRecord", back_populates="training")


class TrainingRecord(Base):
    """Training records for employees."""
    __tablename__ = "training_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    training_id = Column(String(36), ForeignKey("training_matrix.id"), nullable=False)
    completion_date = Column(Date)
    expiry_date = Column(Date)
    is_certified = Column(Boolean, default=False)
    certification_number = Column(String(100))
    trainer = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    employee = relationship("User", back_populates="training_records")
    training = relationship("TrainingMatrix", back_populates="records")
