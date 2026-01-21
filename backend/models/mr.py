"""Management Representative (MR) / Quality Assurance Models"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Float
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())


class AuditSchedule(Base):
    """Internal Audit Schedule (M1-M18)"""
    __tablename__ = "audit_schedules"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    year = Column(Integer, nullable=False)  # M1, M3
    sr_no = Column(Integer)  # M2
    department = Column(String(100), nullable=False)  # M4
    
    # Monthly schedule (M5-M16)
    jan_planned = Column(Date)
    feb_planned = Column(Date)
    mar_planned = Column(Date)
    apr_planned = Column(Date)
    may_planned = Column(Date)
    jun_planned = Column(Date)
    jul_planned = Column(Date)
    aug_planned = Column(Date)
    sep_planned = Column(Date)
    oct_planned = Column(Date)
    nov_planned = Column(Date)
    dec_planned = Column(Date)
    
    prepared_by = Column(String(255))  # M17
    schedule_date = Column(Date)  # M18
    
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditCircular(Base):
    """Audit Circular and Plan (M19-M29)"""
    __tablename__ = "audit_circulars"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    circular_no = Column(String(50), unique=True, nullable=False)
    circular_date = Column(Date, nullable=False)  # M19
    
    audit_date = Column(Date, nullable=False)  # M21
    mrm_date = Column(Date)  # Management Review Meeting date
    circular_text = Column(Text)  # M20
    
    department = Column(String(100))  # M22
    auditee = Column(String(255))  # M23
    audit_time = Column(String(50))  # M24
    auditor = Column(String(255))  # M25
    
    prepared_by = Column(String(255))  # M26
    prepared_date = Column(Date)  # M27
    
    # Distribution list
    distributed_to = Column(Text)  # M28 - Names
    signatures = Column(Text)  # M29
    
    created_at = Column(DateTime, default=datetime.utcnow)


class InternalAuditNote(Base):
    """Internal Audit Notes (M30-M37)"""
    __tablename__ = "internal_audit_notes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    audit_no = Column(String(50), unique=True, nullable=False)
    audit_date = Column(Date, nullable=False)
    
    department = Column(String(100))  # M30
    auditor = Column(String(255))  # M31
    auditee = Column(String(255))  # M32
    
    nc_count = Column(Integer, default=0)  # M33
    observation_count = Column(Integer, default=0)
    total_findings = Column(Integer, default=0)  # M34
    
    suggestions = Column(Text)  # M35
    audit_summary = Column(Text)  # M36
    detailed_notes = Column(Text)  # M37
    
    status = Column(String(50), default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    findings = relationship("InternalAuditFinding", back_populates="audit_note")


class InternalAuditFinding(Base):
    """Audit Finding linked to Internal Audit"""
    __tablename__ = "audit_finding_details"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    audit_note_id = Column(String(36), ForeignKey("internal_audit_notes.id"), nullable=False)
    finding_no = Column(String(50))
    
    finding_type = Column(String(50))  # NC/Observation/OFI
    severity = Column(String(50))  # Major/Minor
    clause_reference = Column(String(100))
    finding_description = Column(Text, nullable=False)
    
    root_cause = Column(Text)
    corrective_action = Column(Text)
    target_date = Column(Date)
    
    status = Column(String(50), default="Open")
    closed_date = Column(Date)
    
    audit_note = relationship("InternalAuditNote", back_populates="findings")


class CorrectiveActionReport(Base):
    """Corrective Action Report (M38-M55)"""
    __tablename__ = "corrective_action_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    car_number = Column(String(50), unique=True, nullable=False)  # M40
    car_date = Column(Date, nullable=False)  # M38
    
    audit_reference = Column(String(100))  # M39
    standard_reference = Column(String(100))  # M41
    clause_no = Column(String(50))  # M42
    department = Column(String(100))  # M43
    
    finding_type = Column(String(50))  # M44 - Major/Minor/Observation
    nc_details = Column(Text, nullable=False)  # Details of Non-Conformity
    
    auditee_signature = Column(String(255))  # M45
    auditor_signature = Column(String(255))  # M46
    
    root_cause = Column(Text)  # M47
    root_cause_approved_by = Column(String(255))  # M48
    
    correction = Column(Text)  # M49 - Immediate correction
    corrective_action = Column(Text)  # Corrective Action
    target_date = Column(Date)  # M50
    action_approved_by = Column(String(255))  # M51
    
    effectiveness_check = Column(Text)  # M52
    effectiveness_status = Column(String(50))  # M53 - Open/Closed
    effectiveness_date = Column(Date)  # M54
    effectiveness_approved_by = Column(String(255))  # M55
    
    status = Column(String(50), default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ManagementReviewMeeting(Base):
    """Minutes of MRM (M56-M68)"""
    __tablename__ = "management_review_meetings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_no = Column(String(50), unique=True, nullable=False)  # M56
    meeting_time = Column(String(50))  # M57
    meeting_date = Column(Date, nullable=False)  # M58
    next_meeting_date = Column(Date)  # M59
    
    attendees = Column(Text)  # M60 - JSON list of attendees with dept and signature
    agenda = Column(Text)  # M64
    
    # Review Inputs
    audit_results = Column(Text)
    customer_feedback = Column(Text)
    quality_objectives = Column(Text)
    capa_status = Column(Text)
    previous_mrm_followup = Column(Text)
    qms_changes = Column(Text)
    improvement_recommendations = Column(Text)
    regulatory_requirements = Column(Text)
    complaint_handling = Column(Text)
    regulatory_reporting = Column(Text)
    process_monitoring = Column(Text)
    product_monitoring = Column(Text)
    
    # Review Outputs
    qms_improvements = Column(Text)
    product_improvements = Column(Text)
    resource_needs = Column(Text)
    regulatory_changes = Column(Text)
    
    action_by = Column(String(255))  # M65, M67
    target_date = Column(Date)  # M66, M68
    
    status = Column(String(50), default="Scheduled")
    created_at = Column(DateTime, default=datetime.utcnow)


class DocumentChangeRequest(Base):
    """Document Change/Introduction/Removal Request (M69-M87)"""
    __tablename__ = "document_change_requests"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    dcr_number = Column(String(50), unique=True, nullable=False)
    dcr_date = Column(Date, nullable=False)
    
    request_type = Column(String(50))  # M69-M71: Change/Introduction/Removal
    document_no = Column(String(100))  # M72
    revision_no = Column(String(20))  # M73
    document_date = Column(Date)  # M74
    document_title = Column(String(500))  # M75
    
    change_details = Column(Text)  # M76
    change_reason = Column(Text)  # M77
    
    requested_by_designation = Column(String(100))  # M78
    requested_by_signature = Column(String(255))  # M79
    
    mr_verification = Column(String(255))  # M80
    is_unobjectionable = Column(Boolean)  # M81/M82
    management_remarks = Column(Text)  # M83
    
    is_approved = Column(Boolean)  # M84/M85
    approval_date = Column(Date)  # M86
    approved_by = Column(String(255))  # M87
    
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)


class PreventiveActionReport(Base):
    """Preventive Action Report (M88-M103)"""
    __tablename__ = "preventive_action_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    par_number = Column(String(50), unique=True, nullable=False)  # M88
    
    identified_by = Column(String(255))  # M89
    department = Column(String(100))  # M90
    identification_date = Column(Date, nullable=False)  # M91
    
    preventive_action_identified = Column(Text, nullable=False)  # M92
    identified_signature = Column(String(255))  # M93
    
    reviewed_by = Column(String(255))  # M94
    is_accepted = Column(Boolean)  # M95
    review_date = Column(Date)  # M96
    acceptance_status = Column(String(10))  # M97 - Y/N
    
    preventive_action_required = Column(Text)  # M98
    action_signature = Column(String(255))  # M99
    action_date = Column(Date)  # M100
    
    procedure_amended = Column(String(255))  # M101
    action_completed = Column(Text)  # M102
    completion_date = Column(Date)  # M103
    
    status = Column(String(50), default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)
