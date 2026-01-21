"""Models package - Import all models for easy access."""
from models.user import User, Role, AuditLog
from models.document import Document, DocumentVersion
from models.training import TrainingMatrix, TrainingRecord
from models.quality import Nonconformance, CAPARecord, EffectivenessCheck, Audit, AuditFinding
from models.manufacturing import Item, BillOfMaterial, Routing, WorkOrder, WorkOrderOperation
from models.inventory import (
    InspectionPlan, TestSpecification, InspectionRecord, TestResult,
    Inventory, LotTracking, SerialNumber
)

# HR Department Models
from models.hr import (
    Employee, CompetencyMatrix, SkillLevelMatrix, 
    TrainingCalendar, TrainingSession, TrainingAttendance, TrainingEvaluation
)

# Maintenance Department Models
from models.maintenance import (
    CleaningRecord, Equipment, PreventiveMaintenance, BreakdownRecord
)

# Marketing Department Models
from models.marketing import (
    Customer, Inquiry, OrderConfirmation, OrderItem,
    InternalWorkOrder, CustomerFeedback, CustomerComplaint
)

# Purchase Department Models
from models.purchase import (
    Vendor, VendorAudit, PurchaseRequisition, 
    PurchaseOrder, PurchaseOrderItem, VendorEvaluation
)

# Store Department Models
from models.store import (
    MaterialInward, ReceivingMemo, IndentSlip, OutwardRegister, StockRegister
)

# MR/QA Department Models
from models.mr import (
    AuditSchedule, AuditCircular, InternalAuditNote, InternalAuditFinding,
    CorrectiveActionReport, ManagementReviewMeeting, DocumentChangeRequest, PreventiveActionReport
)

# Extended QC Models
from models.qc_extended import (
    LeakTestRecord, FumigationRecord, DistilledWaterTest, RoomThermometerCalibration,
    PlateCountRecord, MediaReconciliation, EquipmentLogbook, BETRecord,
    CalibrationRecord, ChemicalTestingReport, RawMaterialAnalysis,
    RetainSampleRegister, StabilityRegister
)

__all__ = [
    # User & Auth
    "User", "Role", "AuditLog",
    # Documents
    "Document", "DocumentVersion",
    # Training
    "TrainingMatrix", "TrainingRecord",
    # Quality
    "Nonconformance", "CAPARecord", "EffectivenessCheck", "Audit", "AuditFinding",
    # Manufacturing
    "Item", "BillOfMaterial", "Routing", "WorkOrder", "WorkOrderOperation",
    # QC & Inventory
    "InspectionPlan", "TestSpecification", "InspectionRecord", "TestResult",
    "Inventory", "LotTracking", "SerialNumber",
    # HR Department
    "Employee", "CompetencyMatrix", "SkillLevelMatrix",
    "TrainingCalendar", "TrainingSession", "TrainingAttendance", "TrainingEvaluation",
    # Maintenance Department
    "CleaningRecord", "Equipment", "PreventiveMaintenance", "BreakdownRecord",
    # Marketing Department
    "Customer", "Inquiry", "OrderConfirmation", "OrderItem",
    "InternalWorkOrder", "CustomerFeedback", "CustomerComplaint",
    # Purchase Department
    "Vendor", "VendorAudit", "PurchaseRequisition",
    "PurchaseOrder", "PurchaseOrderItem", "VendorEvaluation",
    # Store Department
    "MaterialInward", "ReceivingMemo", "IndentSlip", "OutwardRegister", "StockRegister",
    # MR/QA Department
    "AuditSchedule", "AuditCircular", "InternalAuditNote", "InternalAuditFinding",
    "CorrectiveActionReport", "ManagementReviewMeeting", "DocumentChangeRequest", "PreventiveActionReport",
    # Extended QC
    "LeakTestRecord", "FumigationRecord", "DistilledWaterTest", "RoomThermometerCalibration",
    "PlateCountRecord", "MediaReconciliation", "EquipmentLogbook", "BETRecord",
    "CalibrationRecord", "ChemicalTestingReport", "RawMaterialAnalysis",
    "RetainSampleRegister", "StabilityRegister",
]
