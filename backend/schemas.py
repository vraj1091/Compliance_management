"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime, date


# ==================== Auth Schemas ====================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# ==================== User Schemas ====================

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[dict] = {}


class RoleCreate(RoleBase):
    pass


class RoleResponse(RoleBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role_id: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    role_id: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: str
    role_id: str
    is_active: bool
    created_at: datetime
    role: Optional[RoleResponse] = None
    
    class Config:
        from_attributes = True


# ==================== Document Schemas ====================

class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    document_type: str


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: str
    doc_number: str
    status: str
    current_revision: int
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Training Schemas ====================

class TrainingMatrixBase(BaseModel):
    role_id: str
    training_name: str
    training_code: Optional[str] = None
    description: Optional[str] = None
    is_required: bool = True
    frequency_months: Optional[int] = None


class TrainingMatrixCreate(TrainingMatrixBase):
    pass


class TrainingMatrixResponse(TrainingMatrixBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class TrainingRecordBase(BaseModel):
    employee_id: str
    training_id: str
    completion_date: Optional[date] = None
    expiry_date: Optional[date] = None
    is_certified: bool = False
    trainer: Optional[str] = None
    notes: Optional[str] = None


class TrainingRecordCreate(TrainingRecordBase):
    pass


class TrainingRecordResponse(TrainingRecordBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== NC Schemas ====================

class NonconformanceBase(BaseModel):
    title: str
    description: str
    severity: Optional[str] = None
    source: Optional[str] = None
    product_affected: Optional[str] = None
    lot_number: Optional[str] = None
    quantity_affected: Optional[int] = None
    discovered_date: date
    discovered_by: Optional[str] = None


class NonconformanceCreate(NonconformanceBase):
    pass


class NonconformanceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    root_cause_category: Optional[str] = None
    immediate_action: Optional[str] = None
    assigned_to: Optional[str] = None


class NonconformanceResponse(NonconformanceBase):
    id: str
    nc_number: str
    status: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ==================== CAPA Schemas ====================

class CAPABase(BaseModel):
    title: str
    capa_type: Optional[str] = None
    description: Optional[str] = None
    nc_id: Optional[str] = None
    due_date: Optional[date] = None
    priority: str = "Medium"


class CAPACreate(CAPABase):
    owner_id: str


class CAPAUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    root_cause: Optional[str] = None
    root_cause_method: Optional[str] = None
    corrective_action: Optional[str] = None
    preventive_action: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None


class CAPAResponse(CAPABase):
    id: str
    capa_number: str
    root_cause: Optional[str] = None
    corrective_action: Optional[str] = None
    preventive_action: Optional[str] = None
    owner_id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Audit Schemas ====================

class AuditBase(BaseModel):
    title: str
    audit_type: Optional[str] = None
    scope: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    auditee_department: Optional[str] = None


class AuditCreate(AuditBase):
    led_by: str


class AuditUpdate(BaseModel):
    title: Optional[str] = None
    scope: Optional[str] = None
    status: Optional[str] = None
    summary: Optional[str] = None
    end_date: Optional[date] = None


class AuditResponse(AuditBase):
    id: str
    audit_number: str
    led_by: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuditFindingBase(BaseModel):
    finding_text: str
    finding_type: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    clause_reference: Optional[str] = None


class AuditFindingCreate(AuditFindingBase):
    audit_id: str


class AuditFindingResponse(AuditFindingBase):
    id: str
    audit_id: str
    finding_number: Optional[str] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Item Schemas ====================

class ItemBase(BaseModel):
    item_code: str
    description: str
    item_type: Optional[str] = None
    unit_of_measure: str = "EA"
    device_class: Optional[str] = None
    udi: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    description: Optional[str] = None
    item_type: Optional[str] = None
    item_revision: Optional[str] = None
    device_class: Optional[str] = None
    udi: Optional[str] = None
    status: Optional[str] = None


class ItemResponse(ItemBase):
    id: str
    item_revision: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Work Order Schemas ====================

class WorkOrderBase(BaseModel):
    item_id: str
    quantity_ordered: float
    priority: str = "Normal"
    start_date: Optional[datetime] = None
    scheduled_completion: Optional[datetime] = None
    lot_number: Optional[str] = None
    notes: Optional[str] = None


class WorkOrderCreate(WorkOrderBase):
    pass


class WorkOrderUpdate(BaseModel):
    quantity_ordered: Optional[float] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    quantity_completed: Optional[float] = None
    quantity_scrapped: Optional[float] = None


class WorkOrderResponse(WorkOrderBase):
    id: str
    work_order_number: str
    quantity_completed: float
    quantity_scrapped: float
    status: str
    created_by: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Inspection Schemas ====================

class InspectionPlanBase(BaseModel):
    item_id: str
    plan_name: str
    inspection_type: Optional[str] = None
    sampling_level: Optional[str] = None
    acceptance_criteria: Optional[str] = None


class InspectionPlanCreate(InspectionPlanBase):
    pass


class InspectionPlanResponse(InspectionPlanBase):
    id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class InspectionRecordBase(BaseModel):
    work_order_id: str
    inspection_plan_id: str
    lot_number: Optional[str] = None
    sample_size: Optional[int] = None


class InspectionRecordCreate(InspectionRecordBase):
    pass


class InspectionRecordResponse(InspectionRecordBase):
    id: str
    inspector_id: str
    inspection_date: datetime
    status: str
    disposition: Optional[str] = None
    
    class Config:
        from_attributes = True


# ==================== Inventory Schemas ====================

class InventoryBase(BaseModel):
    item_id: str
    warehouse_location: str
    bin_location: Optional[str] = None
    quantity_on_hand: float = 0


class InventoryCreate(InventoryBase):
    pass


class InventoryResponse(InventoryBase):
    id: str
    quantity_reserved: float
    quantity_available: float
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LotTrackingBase(BaseModel):
    item_id: str
    lot_number: str
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    quantity_manufactured: Optional[float] = None


class LotTrackingCreate(LotTrackingBase):
    pass


class LotTrackingResponse(LotTrackingBase):
    id: str
    quantity_remaining: Optional[float] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Dashboard Schemas ====================

class KPIData(BaseModel):
    open_ncs: int
    open_capas: int
    open_findings: int
    overdue_trainings: int
    open_work_orders: int
    pending_inspections: int


class ChartData(BaseModel):
    labels: List[str]
    datasets: List[dict]


class DashboardResponse(BaseModel):
    kpis: KPIData
    nc_trend: ChartData
    capa_status: dict
    recent_activity: List[dict]
