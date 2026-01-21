"""Extended QC Department API Routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import date
import uuid

from database import get_db
from models.qc_extended import (
    LeakTestRecord, FumigationRecord, DistilledWaterTest, RoomThermometerCalibration,
    PlateCountRecord, MediaReconciliation, EquipmentLogbook, BETRecord,
    CalibrationRecord, ChemicalTestingReport, RawMaterialAnalysis,
    RetainSampleRegister, StabilityRegister
)
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/qc-extended", tags=["Extended QC"])


# ==================== Leak Test Records ====================

@router.get("/leak-tests")
async def list_leak_tests(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(LeakTestRecord))
    return result.scalars().all()


@router.post("/leak-tests", status_code=status.HTTP_201_CREATED)
async def create_leak_test(
    batch_no: str, test_date: date, qty_testing: int,
    qty_leak_sets: int, qty_ok_sets: int, worker_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = "Pass" if qty_leak_sets == 0 else "Fail"
    record = LeakTestRecord(
        id=str(uuid.uuid4()), batch_no=batch_no, test_date=test_date,
        qty_testing=qty_testing, qty_leak_sets=qty_leak_sets,
        qty_ok_sets=qty_ok_sets, worker_name=worker_name, result=result
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


# ==================== Fumigation Records ====================

@router.get("/fumigation")
async def list_fumigation(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(FumigationRecord))
    return result.scalars().all()


@router.post("/fumigation", status_code=status.HTTP_201_CREATED)
async def create_fumigation(
    area: str, fumigation_date: date, start_time: str, end_time: str,
    done_by: Optional[str] = None, remarks: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    record = FumigationRecord(
        id=str(uuid.uuid4()), area=area, fumigation_date=fumigation_date,
        start_time=start_time, end_time=end_time, done_by=done_by, remarks=remarks
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


# ==================== Distilled Water Tests ====================

@router.get("/distilled-water-tests")
async def list_distilled_water_tests(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(DistilledWaterTest))
    return result.scalars().all()


@router.post("/distilled-water-tests", status_code=status.HTTP_201_CREATED)
async def create_distilled_water_test(
    test_date: date, clarity: str, ph_value: float,
    chloride: str, sulphate: str, residue: str,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result_status = "Pass" if 5.0 <= ph_value <= 7.0 else "Fail"
    record = DistilledWaterTest(
        id=str(uuid.uuid4()), test_date=test_date, clarity=clarity,
        ph_value=ph_value, chloride=chloride, sulphate=sulphate,
        residue=residue, result=result_status
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


# ==================== Calibration Records ====================

@router.get("/calibrations")
async def list_calibrations(
    equipment_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = select(CalibrationRecord)
    if equipment_type:
        query = query.where(CalibrationRecord.equipment_type == equipment_type)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/calibrations", status_code=status.HTTP_201_CREATED)
async def create_calibration(
    equipment_type: str, calibration_date: date, result: str,
    equipment_id: Optional[str] = None, done_by: Optional[str] = None,
    next_calibration_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    record = CalibrationRecord(
        id=str(uuid.uuid4()), equipment_type=equipment_type, equipment_id=equipment_id,
        calibration_date=calibration_date, result=result, done_by=done_by,
        next_calibration_date=next_calibration_date
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


# ==================== BET Records ====================

@router.get("/bet-records")
async def list_bet_records(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(BETRecord))
    return result.scalars().all()


@router.post("/bet-records", status_code=status.HTTP_201_CREATED)
async def create_bet_record(
    item_name: str, batch_no: str, result: str,
    cse_lot_no: Optional[str] = None, lysate_lot_no: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    record = BETRecord(
        id=str(uuid.uuid4()), item_name=item_name, batch_no=batch_no,
        result=result, cse_lot_no=cse_lot_no, lysate_lot_no=lysate_lot_no
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


# ==================== Retain Samples ====================

@router.get("/retain-samples")
async def list_retain_samples(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(RetainSampleRegister))
    return result.scalars().all()


@router.post("/retain-samples", status_code=status.HTTP_201_CREATED)
async def create_retain_sample(
    batch_no: str, product_name: str, retain_qty: str,
    mfg_date: Optional[date] = None, expiry_date: Optional[date] = None,
    storage_location: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    record = RetainSampleRegister(
        id=str(uuid.uuid4()), batch_no=batch_no, product_name=product_name,
        retain_qty=retain_qty, mfg_date=mfg_date, expiry_date=expiry_date,
        storage_location=storage_location
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


# ==================== Stability Register ====================

@router.get("/stability")
async def list_stability(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(StabilityRegister))
    return result.scalars().all()


@router.post("/stability", status_code=status.HTTP_201_CREATED)
async def create_stability_record(
    product_name: str, batch_no: str, test_duration: str,
    mfg_date: Optional[date] = None, expiry_date: Optional[date] = None,
    overall_result: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    record = StabilityRegister(
        id=str(uuid.uuid4()), product_name=product_name, batch_no=batch_no,
        test_duration=test_duration, mfg_date=mfg_date, expiry_date=expiry_date,
        overall_result=overall_result
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


# ==================== Stats ====================

@router.get("/stats")
async def get_qc_extended_stats(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(func.count(CalibrationRecord.id)))
    total_calibrations = result.scalar() or 0
    
    result = await db.execute(select(func.count(RetainSampleRegister.id)))
    retain_samples = result.scalar() or 0
    
    result = await db.execute(select(func.count(StabilityRegister.id)))
    stability_studies = result.scalar() or 0
    
    return {
        "total_calibrations": total_calibrations,
        "retain_samples": retain_samples,
        "stability_studies": stability_studies
    }
