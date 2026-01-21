"""HR Department Models - Personnel, Training, Competency"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Float, JSON
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Employee(Base):
    """Employee/Personnel Information"""
    __tablename__ = "employees"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_code = Column(String(50), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    # Personal Information (H1-H14)
    post_applied = Column(String(100))  # H1
    full_name = Column(String(255), nullable=False)  # H3
    gender = Column(String(20))  # H4/H5
    fathers_name = Column(String(255))  # H6
    communication_address = Column(Text)  # H7
    permanent_address = Column(Text)  # H8
    mobile = Column(String(20))  # H9
    email = Column(String(255))  # H10
    date_of_birth = Column(Date)  # H11
    age = Column(Integer)  # H12
    marital_status = Column(String(50))  # H13
    mother_tongue = Column(String(50))  # H14
    is_appointed = Column(Boolean, default=False)  # H15/H16
    
    # Educational Details (H17-H22)
    education_degree = Column(String(100))  # H17
    institution = Column(String(255))  # H18
    education_mode = Column(String(50))  # H19 - Regular/Correspondence/Part-time
    years_studied = Column(String(50))  # H20
    year_of_passing = Column(Integer)  # H21
    percentage_marks = Column(String(50))  # H22
    
    department = Column(String(100))
    designation = Column(String(100))
    date_of_joining = Column(Date)
    status = Column(String(50), default="Active")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    competencies = relationship("CompetencyMatrix", back_populates="employee")
    skill_levels = relationship("SkillLevelMatrix", back_populates="employee")
    training_attendance = relationship("TrainingAttendance", back_populates="employee")


class CompetencyMatrix(Base):
    """Competency Matrix (H26-H37)"""
    __tablename__ = "competency_matrix"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(36), ForeignKey("employees.id"), nullable=False)
    date = Column(Date)  # H26
    sr_no = Column(Integer)  # H27
    designation = Column(String(100))  # H28
    
    # Education
    min_education_required = Column(String(255))  # H30
    min_education_available = Column(String(255))  # H31
    
    # Experience
    min_experience_required = Column(String(255))  # H32
    min_experience_available = Column(String(255))  # H33
    
    # Skills
    min_skills_required = Column(String(255))  # H34
    min_skills_available = Column(String(255))  # H35
    
    # Training
    min_training_required = Column(String(255))  # H36
    min_training_available = Column(String(255))  # H37
    
    is_competent = Column(Boolean, default=False)
    remarks = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee", back_populates="competencies")


class SkillLevelMatrix(Base):
    """Skill Level Matrix (H38-H51)"""
    __tablename__ = "skill_level_matrix"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(36), ForeignKey("employees.id"), nullable=False)
    sr_no = Column(Integer)  # H38
    
    # Skills rated on 10-point scale
    technical_knowledge_required = Column(Float)  # H40
    technical_knowledge_available = Column(Float)  # H41
    workmanship_required = Column(Float)  # H42
    workmanship_available = Column(Float)  # H43
    communication_required = Column(Float)  # H44
    communication_available = Column(Float)  # H45
    managerial_required = Column(Float)  # H46
    managerial_available = Column(Float)  # H47
    knowledge_sharing_required = Column(Float)  # H48
    knowledge_sharing_available = Column(Float)  # H49
    
    total_required = Column(Float)  # H50
    total_available = Column(Float)  # H51
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee", back_populates="skill_levels")


class TrainingCalendar(Base):
    """Training Calendar (H52-H81)"""
    __tablename__ = "training_calendar"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    year = Column(Integer, nullable=False)  # H52
    sr_no = Column(Integer)  # H53
    topic = Column(String(255), nullable=False)  # H54
    tutor = Column(String(255))  # H55
    
    # Monthly planned/actual dates (H56-H79)
    jan_planned = Column(Date)
    jan_actual = Column(Date)
    feb_planned = Column(Date)
    feb_actual = Column(Date)
    mar_planned = Column(Date)
    mar_actual = Column(Date)
    apr_planned = Column(Date)
    apr_actual = Column(Date)
    may_planned = Column(Date)
    may_actual = Column(Date)
    jun_planned = Column(Date)
    jun_actual = Column(Date)
    jul_planned = Column(Date)
    jul_actual = Column(Date)
    aug_planned = Column(Date)
    aug_actual = Column(Date)
    sep_planned = Column(Date)
    sep_actual = Column(Date)
    oct_planned = Column(Date)
    oct_actual = Column(Date)
    nov_planned = Column(Date)
    nov_actual = Column(Date)
    dec_planned = Column(Date)
    dec_actual = Column(Date)
    
    prepared_by = Column(String(255))  # H80
    approved_by = Column(String(255))  # H81
    
    created_at = Column(DateTime, default=datetime.utcnow)


class TrainingSession(Base):
    """Training Session/Attendance (H82-H96)"""
    __tablename__ = "training_sessions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    training_no = Column(String(50), unique=True, nullable=False)  # H83
    subject = Column(String(255), nullable=False)  # H82
    venue = Column(String(255))  # H84
    faculty_name = Column(String(255))  # H85
    training_date = Column(Date, nullable=False)  # H86
    training_time = Column(String(50))  # H87
    num_participants = Column(Integer)  # H88
    
    faculty_signature = Column(String(255))  # H93
    faculty_sign_date = Column(Date)  # H94
    hr_signature = Column(String(255))  # H95
    hr_sign_date = Column(Date)  # H96
    
    status = Column(String(50), default="Scheduled")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    attendances = relationship("TrainingAttendance", back_populates="session")


class TrainingAttendance(Base):
    """Training Attendance Record (H89-H92)"""
    __tablename__ = "training_attendance"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("training_sessions.id"), nullable=False)
    employee_id = Column(String(36), ForeignKey("employees.id"), nullable=False)
    sl_no = Column(Integer)  # H89
    feedback = Column(String(50))  # H91 - Good/Satisfactory/Not Good
    signature = Column(String(255))  # H92
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("TrainingSession", back_populates="attendances")
    employee = relationship("Employee", back_populates="training_attendance")


class TrainingEvaluation(Base):
    """Training Evaluation (H97-H107)"""
    __tablename__ = "training_evaluations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    training_no = Column(String(50), nullable=False)  # H97
    evaluated_by = Column(String(255))  # H98
    training_date = Column(Date)  # H99
    evaluation_date = Column(Date)  # H100
    
    sr_no = Column(Integer)  # H101
    participant_name = Column(String(255))  # H102
    
    # Scores (5 marks each)
    knowledge_increase = Column(Integer)  # H103
    implementation_ability = Column(Integer)  # H104
    value_addition_self = Column(Integer)  # H105
    value_addition_org = Column(Integer)  # H106
    total_score = Column(Integer)  # H107 (max 20)
    
    # Criteria: <10 = retrain, 10-15 = brief by MD, >15 = no action
    action_required = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)
