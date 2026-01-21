"""Audits router."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Audit, AuditFinding, User
from schemas import (
    AuditCreate, AuditUpdate, AuditResponse,
    AuditFindingCreate, AuditFindingResponse
)
from utils.auth import get_current_user


router = APIRouter(prefix="/api/audits", tags=["Audits"])


def generate_audit_number(count: int) -> str:
    """Generate audit number."""
    year = datetime.now().year
    return f"AUD-{year}-{count + 1:04d}"


@router.get("", response_model=List[AuditResponse])
async def get_audits(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    audit_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all audits."""
    query = select(Audit).order_by(Audit.start_date.desc())
    
    if status:
        query = query.where(Audit.status == status)
    if audit_type:
        query = query.where(Audit.audit_type == audit_type)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
async def create_audit(
    audit_data: AuditCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new audit."""
    result = await db.execute(select(func.count(Audit.id)))
    count = result.scalar() or 0
    
    audit = Audit(
        audit_number=generate_audit_number(count),
        **audit_data.model_dump()
    )
    db.add(audit)
    await db.commit()
    await db.refresh(audit)
    
    return audit


@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(
    audit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific audit."""
    result = await db.execute(select(Audit).where(Audit.id == audit_id))
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit


@router.put("/{audit_id}", response_model=AuditResponse)
async def update_audit(
    audit_id: str,
    audit_data: AuditUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an audit."""
    result = await db.execute(select(Audit).where(Audit.id == audit_id))
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    update_data = audit_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(audit, field, value)
    
    await db.commit()
    await db.refresh(audit)
    
    return audit


# ==================== Audit Findings ====================

@router.get("/{audit_id}/findings", response_model=List[AuditFindingResponse])
async def get_audit_findings(
    audit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get findings for an audit."""
    result = await db.execute(
        select(AuditFinding)
        .where(AuditFinding.audit_id == audit_id)
        .order_by(AuditFinding.created_at)
    )
    return result.scalars().all()


@router.post("/{audit_id}/findings", response_model=AuditFindingResponse, status_code=status.HTTP_201_CREATED)
async def create_audit_finding(
    audit_id: str,
    finding_data: AuditFindingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a finding for an audit."""
    # Verify audit exists
    result = await db.execute(select(Audit).where(Audit.id == audit_id))
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    # Get finding count for number
    result = await db.execute(
        select(func.count(AuditFinding.id)).where(AuditFinding.audit_id == audit_id)
    )
    count = result.scalar() or 0
    
    finding = AuditFinding(
        audit_id=audit_id,
        finding_number=f"{audit.audit_number}-F{count + 1:02d}",
        finding_text=finding_data.finding_text,
        finding_type=finding_data.finding_type,
        severity=finding_data.severity,
        category=finding_data.category,
        clause_reference=finding_data.clause_reference
    )
    db.add(finding)
    await db.commit()
    await db.refresh(finding)
    
    return finding


@router.post("/findings/{finding_id}/response")
async def submit_finding_response(
    finding_id: str,
    response: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit response to a finding."""
    result = await db.execute(select(AuditFinding).where(AuditFinding.id == finding_id))
    finding = result.scalar_one_or_none()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    
    finding.response = response
    finding.status = "Response Submitted"
    
    await db.commit()
    
    return {"message": "Response submitted successfully"}
