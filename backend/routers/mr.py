"""MR/QA Department API Routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import date
import uuid

from database import get_db
from models.mr import (
    AuditSchedule, AuditCircular, InternalAuditNote, InternalAuditFinding,
    CorrectiveActionReport, ManagementReviewMeeting, DocumentChangeRequest, PreventiveActionReport
)
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/mr", tags=["MR/QA Department"])


# ==================== Audit Schedule Endpoints ====================

@router.get("/audit-schedules")
async def list_audit_schedules(
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(AuditSchedule)
    if year:
        query = query.where(AuditSchedule.year == year)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/audit-schedules", status_code=status.HTTP_201_CREATED)
async def create_audit_schedule(
    year: int, department: str, prepared_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    schedule = AuditSchedule(
        id=str(uuid.uuid4()), year=year, department=department,
        prepared_by=prepared_by, schedule_date=date.today()
    )
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)
    return schedule


# ==================== Audit Circular Endpoints ====================

@router.get("/audit-circulars")
async def list_audit_circulars(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(AuditCircular))
    return result.scalars().all()


@router.post("/audit-circulars", status_code=status.HTTP_201_CREATED)
async def create_audit_circular(
    audit_date: date, department: str, auditor: str, auditee: str,
    circular_text: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(AuditCircular.id)))
    count = result.scalar() or 0
    circular_no = f"AC-{date.today().year}-{count + 1:04d}"
    
    circular = AuditCircular(
        id=str(uuid.uuid4()), circular_no=circular_no, circular_date=date.today(),
        audit_date=audit_date, department=department, auditor=auditor,
        auditee=auditee, circular_text=circular_text
    )
    db.add(circular)
    await db.commit()
    await db.refresh(circular)
    return circular


# ==================== Internal Audit Notes ====================

@router.get("/audit-notes")
async def list_audit_notes(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(InternalAuditNote)
    if status:
        query = query.where(InternalAuditNote.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/audit-notes", status_code=status.HTTP_201_CREATED)
async def create_audit_note(
    audit_date: date, department: str, auditor: str, auditee: str,
    nc_count: int = 0, observation_count: int = 0,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(InternalAuditNote.id)))
    count = result.scalar() or 0
    audit_no = f"IAN-{date.today().year}-{count + 1:04d}"
    
    note = InternalAuditNote(
        id=str(uuid.uuid4()), audit_no=audit_no, audit_date=audit_date,
        department=department, auditor=auditor, auditee=auditee,
        nc_count=nc_count, observation_count=observation_count,
        total_findings=nc_count + observation_count
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


# ==================== Corrective Action Reports ====================

@router.get("/car")
async def list_car(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(CorrectiveActionReport)
    if status:
        query = query.where(CorrectiveActionReport.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/car", status_code=status.HTTP_201_CREATED)
async def create_car(
    department: str, nc_details: str, finding_type: str,
    audit_reference: Optional[str] = None, clause_no: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(CorrectiveActionReport.id)))
    count = result.scalar() or 0
    car_number = f"CAR-{date.today().year}-{count + 1:04d}"
    
    car = CorrectiveActionReport(
        id=str(uuid.uuid4()), car_number=car_number, car_date=date.today(),
        department=department, nc_details=nc_details, finding_type=finding_type,
        audit_reference=audit_reference, clause_no=clause_no
    )
    db.add(car)
    await db.commit()
    await db.refresh(car)
    return car


# ==================== Management Review Meetings ====================

@router.get("/mrm")
async def list_mrm(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(ManagementReviewMeeting))
    return result.scalars().all()


@router.post("/mrm", status_code=status.HTTP_201_CREATED)
async def create_mrm(
    meeting_date: date, agenda: str, meeting_time: Optional[str] = None,
    next_meeting_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(ManagementReviewMeeting.id)))
    count = result.scalar() or 0
    meeting_no = f"MRM-{date.today().year}-{count + 1:04d}"
    
    mrm = ManagementReviewMeeting(
        id=str(uuid.uuid4()), meeting_no=meeting_no, meeting_date=meeting_date,
        meeting_time=meeting_time, agenda=agenda, next_meeting_date=next_meeting_date
    )
    db.add(mrm)
    await db.commit()
    await db.refresh(mrm)
    return mrm


# ==================== Document Change Requests ====================

@router.get("/dcr")
async def list_dcr(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(DocumentChangeRequest)
    if status:
        query = query.where(DocumentChangeRequest.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/dcr", status_code=status.HTTP_201_CREATED)
async def create_dcr(
    request_type: str, document_title: str, change_details: str, change_reason: str,
    document_no: Optional[str] = None, revision_no: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(DocumentChangeRequest.id)))
    count = result.scalar() or 0
    dcr_number = f"DCR-{date.today().year}-{count + 1:04d}"
    
    dcr = DocumentChangeRequest(
        id=str(uuid.uuid4()), dcr_number=dcr_number, dcr_date=date.today(),
        request_type=request_type, document_no=document_no, revision_no=revision_no,
        document_title=document_title, change_details=change_details, change_reason=change_reason
    )
    db.add(dcr)
    await db.commit()
    await db.refresh(dcr)
    return dcr


# ==================== Stats ====================

@router.get("/stats")
async def get_mr_stats(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(InternalAuditNote.id)).where(InternalAuditNote.status == "Open"))
    open_audits = result.scalar() or 0
    
    result = await db.execute(select(func.count(CorrectiveActionReport.id)).where(CorrectiveActionReport.status == "Open"))
    open_car = result.scalar() or 0
    
    result = await db.execute(select(func.count(DocumentChangeRequest.id)).where(DocumentChangeRequest.status == "Pending"))
    pending_dcr = result.scalar() or 0
    
    result = await db.execute(select(func.count(ManagementReviewMeeting.id)))
    total_mrm = result.scalar() or 0
    
    return {
        "open_audits": open_audits,
        "open_car": open_car,
        "pending_dcr": pending_dcr,
        "total_mrm": total_mrm
    }
