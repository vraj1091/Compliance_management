"""Documents router with file upload."""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime
import os
import uuid
import shutil

from database import get_db
from models import Document, DocumentVersion, User
from schemas import DocumentCreate, DocumentUpdate, DocumentResponse
from utils.auth import get_current_user


router = APIRouter(prefix="/api/documents", tags=["Documents"])

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def generate_doc_number(doc_type: str, count: int) -> str:
    """Generate document number."""
    prefix_map = {
        "SOP": "SOP",
        "Work Instruction": "WI",
        "Form": "FRM",
        "Policy": "POL",
        "Procedure": "PRO",
        "Manual": "MAN",
        "Specification": "SPEC"
    }
    prefix = prefix_map.get(doc_type, "DOC")
    return f"{prefix}-{count + 1:04d}"


@router.get("", response_model=List[DocumentResponse])
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    document_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all documents with filters."""
    query = select(Document).order_by(Document.created_at.desc())
    
    if document_type:
        query = query.where(Document.document_type == document_type)
    if status:
        query = query.where(Document.status == status)
    if search:
        query = query.where(Document.title.ilike(f"%{search}%"))
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    doc_data: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new document."""
    # Get count for document number
    result = await db.execute(
        select(func.count(Document.id)).where(Document.document_type == doc_data.document_type)
    )
    count = result.scalar() or 0
    
    document = Document(
        doc_number=generate_doc_number(doc_data.document_type, count),
        title=doc_data.title,
        description=doc_data.description,
        document_type=doc_data.document_type,
        created_by=current_user.id
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    
    return document


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific document."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document(
    doc_id: str,
    doc_data: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a document."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    update_data = doc_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
    
    await db.commit()
    await db.refresh(document)
    
    return document


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    await db.delete(document)
    await db.commit()
    
    return {"message": "Document deleted successfully"}


@router.post("/{doc_id}/upload")
async def upload_document_file(
    doc_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a file to a document."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{doc_id}_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create document version
    version = DocumentVersion(
        document_id=doc_id,
        revision_number=document.current_revision,
        file_url=unique_filename,
        file_name=file.filename,
        change_summary="File uploaded",
        created_by=current_user.id
    )
    db.add(version)
    
    # Update document revision
    document.current_revision += 1
    await db.commit()
    
    return {"message": "File uploaded successfully", "filename": file.filename}


@router.get("/{doc_id}/download")
async def download_document_file(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download the latest version of a document."""
    # Get latest version
    result = await db.execute(
        select(DocumentVersion)
        .where(DocumentVersion.document_id == doc_id)
        .order_by(DocumentVersion.revision_number.desc())
    )
    version = result.scalars().first()
    
    if not version or not version.file_url:
        raise HTTPException(status_code=404, detail="No file found for this document")
    
    file_path = os.path.join(UPLOAD_DIR, version.file_url)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    return FileResponse(
        path=file_path,
        filename=version.file_name,
        media_type="application/octet-stream"
    )


@router.post("/{doc_id}/approve", response_model=DocumentResponse)
async def approve_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a document."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document.status = "Approved"
    document.approved_by = current_user.id
    document.approved_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(document)
    
    return document


@router.get("/{doc_id}/versions")
async def get_document_versions(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get document versions."""
    result = await db.execute(
        select(DocumentVersion)
        .where(DocumentVersion.document_id == doc_id)
        .order_by(DocumentVersion.revision_number.desc())
    )
    return result.scalars().all()

