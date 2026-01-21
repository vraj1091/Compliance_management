"""Extended QC Department Models - Lab Records, Calibration, Testing"""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Integer, Float, Numeric
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())


class LeakTestRecord(Base):
    """Leak Test Record (Q1-Q10)"""
    __tablename__ = "leak_test_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    sr_no = Column(Integer)  # Q1
    test_date = Column(Date, nullable=False)  # Q2
    worker_name = Column(String(255))  # Q3
    batch_no = Column(String(100), nullable=False)  # Q4
    
    qty_testing = Column(Integer)  # Q5
    qty_leak_sets = Column(Integer)  # Q6
    qty_ok_sets = Column(Integer)  # Q7
    sample_count = Column(Integer)  # Q8
    
    result = Column(String(50))  # Q9 - Pass/Fail
    signature = Column(String(255))  # Q10
    
    created_at = Column(DateTime, default=datetime.utcnow)


class FumigationRecord(Base):
    """Fumigation Record (Q11-Q17)"""
    __tablename__ = "fumigation_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    sr_no = Column(Integer)  # Q11
    fumigation_date = Column(Date, nullable=False)  # Q12
    area = Column(String(255), nullable=False)  # Q13
    
    start_time = Column(String(20))  # Q14
    end_time = Column(String(20))  # Q15
    done_by = Column(String(255))  # Q16
    remarks = Column(Text)  # Q17
    
    created_at = Column(DateTime, default=datetime.utcnow)


class DistilledWaterTest(Base):
    """Distilled Water Test Record (Q18-Q25, Q52-Q59)"""
    __tablename__ = "distilled_water_tests"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    sr_no = Column(Integer)  # Q18
    test_date = Column(Date, nullable=False)  # Q19
    month = Column(String(20))  # Q52
    
    # Test results
    clarity = Column(String(100))  # Q20, Q54
    ph_value = Column(Float)  # Q21, Q55
    chloride = Column(String(100))  # Q22, Q56
    sulphate = Column(String(100))  # Q23, Q57
    heavy_metals = Column(String(100))  # Q58
    residue = Column(String(100))  # Q24, Q59
    
    signature = Column(String(255))  # Q25
    result = Column(String(50))  # Pass/Fail
    
    created_at = Column(DateTime, default=datetime.utcnow)


class RoomThermometerCalibration(Base):
    """Calibration Record of Room Thermometer (Q26-Q32)"""
    __tablename__ = "room_thermometer_calibrations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    sr_no = Column(Integer)  # Q26
    calibration_date = Column(Date, nullable=False)  # Q27
    
    assembly_room_1_temp = Column(Float)  # Q28
    assembly_room_2_temp = Column(Float)  # Q29
    sterility_room_temp = Column(Float)  # Q30
    standard_thermometer_temp = Column(Float)  # Q31
    
    signature = Column(String(255))  # Q32
    result = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)


class PlateCountRecord(Base):
    """Plate Count Records of Sterility Room (Q33-Q40)"""
    __tablename__ = "plate_count_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    sr_no = Column(Integer)  # Q33
    expose_date = Column(Date, nullable=False)  # Q34
    expose_time = Column(String(20))  # Q35
    
    # Observations after 48 hours
    plate_a_1 = Column(Integer)  # Q36 - Under LF
    plate_a_2 = Column(Integer)  # Q37
    plate_b_1 = Column(Integer)  # Q38 - Corner of Sterility Room
    plate_b_2 = Column(Integer)  # Q39
    
    signature = Column(String(255))  # Q40
    result = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)


class MediaReconciliation(Base):
    """Media Reconciliation Record (Q41-Q51)"""
    __tablename__ = "media_reconciliations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    sr_no = Column(Integer)  # Q41
    receiving_date = Column(Date)  # Q42
    batch_no = Column(String(100))  # Q43
    expiry_date = Column(Date)  # Q44
    
    stock_qty = Column(Float)  # Q45
    date_of_use = Column(Date)  # Q46
    qty_used = Column(Float)  # Q47
    balance_qty = Column(Float)  # Q48
    
    plates_tubes_count = Column(Integer)  # Q49
    used_in = Column(String(255))  # Q50
    signature = Column(String(255))  # Q51
    
    created_at = Column(DateTime, default=datetime.utcnow)


class EquipmentLogbook(Base):
    """Generic Equipment Logbook (Q119-Q208)"""
    __tablename__ = "equipment_logbooks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_type = Column(String(100), nullable=False)  # Autoclave, Cyclo Mixer, etc.
    equipment_id = Column(String(50))
    
    sr_no = Column(Integer)
    log_date = Column(Date, nullable=False)
    start_time = Column(String(20))
    end_time = Column(String(20))
    
    purpose = Column(String(255))  # For Use/Test
    operated_by = Column(String(255))
    remarks = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class BETRecord(Base):
    """Bacterial Endotoxin Test Record (Q107-Q118)"""
    __tablename__ = "bet_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    sr_no = Column(Integer)  # Q107
    
    # CSE Details
    cse_lot_no = Column(String(100))  # Q108
    cse_expiry_date = Column(Date)  # Q109
    cse_reconstitution_date = Column(Date)  # Q110
    
    # Lysate Details
    lysate_lot_no = Column(String(100))  # Q111
    lysate_expiry_date = Column(Date)  # Q112
    lysate_sensitivity_date = Column(Date)  # Q113
    
    use_for = Column(String(255))  # Q114
    item_name = Column(String(255))  # Q115
    batch_no = Column(String(100))  # Q116
    
    result = Column(String(50))
    remarks = Column(Text)  # Q117
    signature = Column(String(255))  # Q118
    
    created_at = Column(DateTime, default=datetime.utcnow)


class CalibrationRecord(Base):
    """Generic Calibration Record"""
    __tablename__ = "calibration_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_type = Column(String(100), nullable=False)
    equipment_id = Column(String(50))
    
    sr_no = Column(Integer)
    calibration_date = Column(Date, nullable=False)
    
    # For different equipment types
    parameter_1_name = Column(String(100))
    parameter_1_standard = Column(String(100))
    parameter_1_observed = Column(String(100))
    
    parameter_2_name = Column(String(100))
    parameter_2_standard = Column(String(100))
    parameter_2_observed = Column(String(100))
    
    variation = Column(String(100))
    result = Column(String(50))  # Pass/Fail
    remarks = Column(Text)
    
    done_by = Column(String(255))
    verified_by = Column(String(255))
    
    next_calibration_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChemicalTestingReport(Base):
    """Chemical Testing Report (Q538-Q584)"""
    __tablename__ = "chemical_testing_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    ar_no = Column(String(50), unique=True, nullable=False)  # Q538
    test_date = Column(Date, nullable=False)  # Q539
    
    material_name = Column(String(255))  # Q540
    receipt_date = Column(Date)  # Q541
    qty_received = Column(String(100))  # Q542
    supplier_name = Column(String(255))  # Q543
    
    # Test Results
    appearance_result = Column(String(100))  # Q544-Q547
    appearance_complies = Column(Boolean)
    
    ph_blank = Column(Float)  # Q549
    ph_sample = Column(Float)  # Q550
    ph_complies = Column(Boolean)  # Q552
    
    alkalinity_blank = Column(Float)  # Q554
    alkalinity_sample = Column(Float)  # Q555
    alkalinity_diff = Column(Float)  # Q556
    alkalinity_complies = Column(Boolean)  # Q558
    
    reducing_blank = Column(Float)  # Q560
    reducing_sample = Column(Float)  # Q561
    reducing_diff = Column(Float)  # Q562
    reducing_complies = Column(Boolean)  # Q564
    
    residue_blank = Column(Float)  # Q567-Q569
    residue_sample = Column(Float)  # Q570-Q572
    residue_diff = Column(Float)  # Q573-Q575
    residue_complies = Column(Boolean)  # Q578
    
    heavy_metal_result = Column(String(100))  # Q580-Q581
    absorbancy_result = Column(String(100))  # Q582-Q583
    
    overall_result = Column(String(50))  # Pass/Fail
    checked_by = Column(String(255))  # Q584
    
    created_at = Column(DateTime, default=datetime.utcnow)


class RawMaterialAnalysis(Base):
    """Raw Material Analytical Record - Generic"""
    __tablename__ = "raw_material_analyses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_no = Column(String(50), unique=True, nullable=False)
    
    supplier_name = Column(String(255))
    receipt_date = Column(Date)
    product_name = Column(String(255))
    challan_no = Column(String(100))
    product_code = Column(String(100))
    
    qty_received = Column(Numeric(10, 2))
    release_no = Column(String(50))
    qty_rejected = Column(Numeric(10, 2))
    analysis_date = Column(Date)
    qty_sample = Column(Numeric(10, 2))
    qty_released = Column(Numeric(10, 2))
    
    # Visual Inspection Results (JSON)
    visual_inspection = Column(Text)  # JSON: {cracks: pass, dirt: pass, etc.}
    
    # Dimensional Inspection Results (JSON)
    dimensional_inspection = Column(Text)  # JSON: {id: {obs: x, limit: y}, od: {...}}
    
    # Functional Test Results
    functional_tests = Column(Text)  # JSON
    
    weight_10_pcs = Column(Float)
    weight_1_pc = Column(Float)
    
    overall_result = Column(String(50))  # Pass/Fail
    analyst_signature = Column(String(255))
    qc_incharge_signature = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)


class RetainSampleRegister(Base):
    """Retain Sample Register (Q656-Q661)"""
    __tablename__ = "retain_samples"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    sr_no = Column(Integer)  # Q656
    batch_no = Column(String(100), nullable=False)  # Q657
    product_name = Column(String(255))  # Q658
    
    mfg_date = Column(Date)  # Q659
    expiry_date = Column(Date)  # Q660
    retain_qty = Column(String(100))  # Q661
    
    storage_location = Column(String(255))
    status = Column(String(50), default="Active")
    
    created_at = Column(DateTime, default=datetime.utcnow)


class StabilityRegister(Base):
    """Stability Register (Q662-Q673)"""
    __tablename__ = "stability_registers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_name = Column(String(255))  # Q662
    batch_no = Column(String(100), nullable=False)  # Q663
    
    mfg_date = Column(Date)  # Q664
    expiry_date = Column(Date)  # Q665
    test_duration = Column(String(100))  # Q666
    
    physical_test_report_no = Column(String(100))  # Q667
    chemical_test_report_no = Column(String(100))  # Q668
    sterility_test_report_no = Column(String(100))  # Q669
    pyrogen_test_report_no = Column(String(100))  # Q670
    
    all_testing_completed_date = Column(Date)  # Q671
    signature = Column(String(255))  # Q672
    remarks = Column(Text)  # Q673
    
    overall_result = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
