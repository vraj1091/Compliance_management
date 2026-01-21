"""HR Department API Routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date
import uuid

from database import get_db
from models.hr import (
    Employee, CompetencyMatrix, SkillLevelMatrix,
    TrainingCalendar, TrainingSession, TrainingAttendance, TrainingEvaluation
)
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/hr", tags=["HR Department"])


# ==================== Employee Endpoints ====================

@router.get("/employees")
async def list_employees(
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all employees with optional filters"""
    query = select(Employee)
    if department:
        query = query.where(Employee.department == department)
    if status:
        query = query.where(Employee.status == status)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/employees", status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_code: str,
    full_name: str,
    department: Optional[str] = None,
    designation: Optional[str] = None,
    email: Optional[str] = None,
    mobile: Optional[str] = None,
    date_of_joining: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new employee"""
    employee = Employee(
        id=str(uuid.uuid4()),
        employee_code=employee_code,
        full_name=full_name,
        department=department,
        designation=designation,
        email=email,
        mobile=mobile,
        date_of_joining=date_of_joining
    )
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return employee


@router.get("/employees/{employee_id}")
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employee by ID"""
    result = await db.execute(
        select(Employee)
        .options(selectinload(Employee.competencies), selectinload(Employee.skill_levels))
        .where(Employee.id == employee_id)
    )
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.put("/employees/{employee_id}")
async def update_employee(
    employee_id: str,
    full_name: Optional[str] = None,
    department: Optional[str] = None,
    designation: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update employee"""
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if full_name:
        employee.full_name = full_name
    if department:
        employee.department = department
    if designation:
        employee.designation = designation
    if status:
        employee.status = status
    
    await db.commit()
    await db.refresh(employee)
    return employee


# ==================== Competency Matrix Endpoints ====================

@router.get("/competency-matrix")
async def list_competency_matrix(
    employee_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List competency matrix records"""
    query = select(CompetencyMatrix)
    if employee_id:
        query = query.where(CompetencyMatrix.employee_id == employee_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/competency-matrix", status_code=status.HTTP_201_CREATED)
async def create_competency_record(
    employee_id: str,
    designation: str,
    min_education_required: str,
    min_education_available: str,
    min_experience_required: str,
    min_experience_available: str,
    is_competent: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create competency matrix record"""
    record = CompetencyMatrix(
        id=str(uuid.uuid4()),
        employee_id=employee_id,
        designation=designation,
        min_education_required=min_education_required,
        min_education_available=min_education_available,
        min_experience_required=min_experience_required,
        min_experience_available=min_experience_available,
        is_competent=is_competent,
        date=date.today()
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


# ==================== Training Calendar Endpoints ====================

@router.get("/training-calendar")
async def list_training_calendar(
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List training calendar"""
    query = select(TrainingCalendar)
    if year:
        query = query.where(TrainingCalendar.year == year)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/training-calendar", status_code=status.HTTP_201_CREATED)
async def create_training_calendar(
    year: int,
    topic: str,
    tutor: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create training calendar entry"""
    entry = TrainingCalendar(
        id=str(uuid.uuid4()),
        year=year,
        topic=topic,
        tutor=tutor
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


# ==================== Training Session Endpoints ====================

@router.get("/training-sessions")
async def list_training_sessions(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List training sessions"""
    query = select(TrainingSession)
    if status:
        query = query.where(TrainingSession.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/training-sessions", status_code=status.HTTP_201_CREATED)
async def create_training_session(
    subject: str,
    training_date: date,
    venue: Optional[str] = None,
    faculty_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create training session"""
    # Generate training number
    result = await db.execute(select(func.count(TrainingSession.id)))
    count = result.scalar() or 0
    training_no = f"TRN-{date.today().year}-{count + 1:04d}"
    
    session = TrainingSession(
        id=str(uuid.uuid4()),
        training_no=training_no,
        subject=subject,
        training_date=training_date,
        venue=venue,
        faculty_name=faculty_name
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/training-sessions/{session_id}")
async def get_training_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get training session with attendance"""
    result = await db.execute(
        select(TrainingSession)
        .options(selectinload(TrainingSession.attendances))
        .where(TrainingSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Training session not found")
    return session


# ==================== Training Attendance Endpoints ====================

@router.post("/training-attendance", status_code=status.HTTP_201_CREATED)
async def record_attendance(
    session_id: str,
    employee_id: str,
    feedback: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record training attendance"""
    attendance = TrainingAttendance(
        id=str(uuid.uuid4()),
        session_id=session_id,
        employee_id=employee_id,
        feedback=feedback
    )
    db.add(attendance)
    await db.commit()
    await db.refresh(attendance)
    return attendance


# ==================== Training Evaluation Endpoints ====================

@router.get("/training-evaluations")
async def list_evaluations(
    training_no: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List training evaluations"""
    query = select(TrainingEvaluation)
    if training_no:
        query = query.where(TrainingEvaluation.training_no == training_no)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/training-evaluations", status_code=status.HTTP_201_CREATED)
async def create_evaluation(
    training_no: str,
    participant_name: str,
    knowledge_increase: int,
    implementation_ability: int,
    value_addition_self: int,
    value_addition_org: int,
    evaluated_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create training evaluation"""
    total_score = knowledge_increase + implementation_ability + value_addition_self + value_addition_org
    
    # Determine action required based on score
    if total_score < 10:
        action_required = "Retrain required"
    elif total_score <= 15:
        action_required = "Brief by MD required"
    else:
        action_required = "No action required"
    
    evaluation = TrainingEvaluation(
        id=str(uuid.uuid4()),
        training_no=training_no,
        participant_name=participant_name,
        knowledge_increase=knowledge_increase,
        implementation_ability=implementation_ability,
        value_addition_self=value_addition_self,
        value_addition_org=value_addition_org,
        total_score=total_score,
        action_required=action_required,
        evaluated_by=evaluated_by,
        evaluation_date=date.today()
    )
    db.add(evaluation)
    await db.commit()
    await db.refresh(evaluation)
    return evaluation


# ==================== Dashboard/Stats ====================

@router.get("/stats")
async def get_hr_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get HR department statistics"""
    # Total employees
    result = await db.execute(select(func.count(Employee.id)))
    total_employees = result.scalar() or 0
    
    # Active employees
    result = await db.execute(select(func.count(Employee.id)).where(Employee.status == "Active"))
    active_employees = result.scalar() or 0
    
    # Scheduled trainings
    result = await db.execute(select(func.count(TrainingSession.id)).where(TrainingSession.status == "Scheduled"))
    scheduled_trainings = result.scalar() or 0
    
    # Completed trainings
    result = await db.execute(select(func.count(TrainingSession.id)).where(TrainingSession.status == "Completed"))
    completed_trainings = result.scalar() or 0
    
    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "scheduled_trainings": scheduled_trainings,
        "completed_trainings": completed_trainings
    }
