"""SQLAlchemy models for Document Management."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Document(Base):
    """Document model for document management."""
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    doc_number = Column(String(50), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    document_type = Column(String(50), nullable=False)  # SOP, WI, Form, Policy
    status = Column(String(50), default="Draft")  # Draft, Under Review, Approved, Obsolete
    current_revision = Column(Integer, default=1)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    approved_by = Column(String(36), ForeignKey("users.id"))
    approved_at = Column(DateTime)
    effective_date = Column(DateTime)
    review_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_by_user = relationship("User", back_populates="documents", foreign_keys=[created_by])
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")


class DocumentVersion(Base):
    """Document version for version control."""
    __tablename__ = "document_versions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    revision_number = Column(Integer, nullable=False)
    file_url = Column(String(500))
    file_name = Column(String(255))
    change_summary = Column(Text)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="versions")
