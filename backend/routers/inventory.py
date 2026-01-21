"""Inventory management router."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import User, Inventory, LotTracking, SerialNumber, Item
from schemas import (
    InventoryCreate, InventoryResponse,
    LotTrackingCreate, LotTrackingResponse
)
from utils.auth import get_current_user


router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


# ==================== Inventory Summary (MUST be before /{inv_id}) ====================

@router.get("/summary")
async def get_inventory_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get inventory summary statistics."""
    # Total items in inventory
    total_result = await db.execute(select(func.count(Inventory.id)))
    total_records = total_result.scalar() or 0
    
    # Total quantity on hand
    qty_result = await db.execute(select(func.sum(Inventory.quantity_on_hand)))
    total_on_hand = qty_result.scalar() or 0
    
    # Low stock items (less than 10 available)
    low_stock_result = await db.execute(
        select(func.count(Inventory.id)).where(Inventory.quantity_available < 10)
    )
    low_stock_count = low_stock_result.scalar() or 0
    
    # Active lots
    active_lots_result = await db.execute(
        select(func.count(LotTracking.id)).where(LotTracking.status == "Active")
    )
    active_lots = active_lots_result.scalar() or 0
    
    return {
        "total_records": total_records,
        "total_quantity_on_hand": total_on_hand,
        "low_stock_items": low_stock_count,
        "active_lots": active_lots
    }


# ==================== Lot Tracking (MUST be before /{inv_id}) ====================

@router.get("/lots", response_model=List[LotTrackingResponse])
async def get_lots(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    item_id: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get lot tracking records."""
    query = select(LotTracking).order_by(LotTracking.created_at.desc())
    if item_id:
        query = query.where(LotTracking.item_id == item_id)
    if status:
        query = query.where(LotTracking.status == status)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/lots", response_model=LotTrackingResponse, status_code=status.HTTP_201_CREATED)
async def create_lot(
    lot_data: LotTrackingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new lot tracking record."""
    lot = LotTracking(
        quantity_remaining=lot_data.quantity_manufactured,
        **lot_data.model_dump()
    )
    db.add(lot)
    await db.commit()
    await db.refresh(lot)
    return lot


@router.get("/lots/{lot_id}", response_model=LotTrackingResponse)
async def get_lot(
    lot_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific lot."""
    result = await db.execute(select(LotTracking).where(LotTracking.id == lot_id))
    lot = result.scalar_one_or_none()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return lot


@router.patch("/lots/{lot_id}/status")
async def update_lot_status(
    lot_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update lot status (Active, On Hold, Released, Expired, Consumed)."""
    result = await db.execute(select(LotTracking).where(LotTracking.id == lot_id))
    lot = result.scalar_one_or_none()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    lot.status = status
    await db.commit()
    
    return {"message": "Lot status updated", "status": status}


# ==================== Serial Numbers (MUST be before /{inv_id}) ====================

@router.get("/serial-numbers")
async def get_serial_numbers(
    item_id: Optional[str] = None,
    lot_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get serial number records."""
    query = select(SerialNumber)
    if item_id:
        query = query.where(SerialNumber.item_id == item_id)
    if lot_id:
        query = query.where(SerialNumber.lot_id == lot_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/serial-numbers")
async def create_serial_number(
    item_id: str,
    serial_number: str,
    lot_id: Optional[str] = None,
    work_order_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a serial number record."""
    # Check if serial number already exists
    existing = await db.execute(
        select(SerialNumber).where(SerialNumber.serial_number == serial_number)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Serial number already exists")
    
    sn = SerialNumber(
        item_id=item_id,
        serial_number=serial_number,
        lot_id=lot_id,
        work_order_id=work_order_id,
        status="Created"
    )
    db.add(sn)
    await db.commit()
    await db.refresh(sn)
    return sn


@router.get("/serial-numbers/{sn}")
async def get_serial_number(
    sn: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get serial number details for traceability."""
    result = await db.execute(
        select(SerialNumber).where(SerialNumber.serial_number == sn)
    )
    serial = result.scalar_one_or_none()
    if not serial:
        raise HTTPException(status_code=404, detail="Serial number not found")
    return serial


# ==================== Inventory (base routes) ====================

@router.get("", response_model=List[InventoryResponse])
async def get_inventory(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    item_id: Optional[str] = None,
    warehouse: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get inventory records."""
    query = select(Inventory).order_by(Inventory.updated_at.desc())
    if item_id:
        query = query.where(Inventory.item_id == item_id)
    if warehouse:
        query = query.where(Inventory.warehouse_location == warehouse)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_record(
    inv_data: InventoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new inventory record."""
    inventory = Inventory(
        quantity_available=inv_data.quantity_on_hand,
        **inv_data.model_dump()
    )
    db.add(inventory)
    await db.commit()
    await db.refresh(inventory)
    return inventory


# ==================== Inventory by ID (MUST be LAST) ====================

@router.get("/{inv_id}", response_model=InventoryResponse)
async def get_inventory_record(
    inv_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific inventory record."""
    result = await db.execute(select(Inventory).where(Inventory.id == inv_id))
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return inv


@router.patch("/{inv_id}/adjust")
async def adjust_inventory(
    inv_id: str,
    quantity_adjustment: float,
    reason: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Adjust inventory quantity."""
    result = await db.execute(select(Inventory).where(Inventory.id == inv_id))
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    
    inv.quantity_on_hand += quantity_adjustment
    inv.quantity_available = inv.quantity_on_hand - inv.quantity_reserved
    inv.last_movement_date = datetime.utcnow()
    
    await db.commit()
    
    return {
        "message": "Inventory adjusted",
        "adjustment": quantity_adjustment,
        "new_quantity": inv.quantity_on_hand,
        "reason": reason
    }


@router.post("/{inv_id}/reserve")
async def reserve_inventory(
    inv_id: str,
    quantity: float,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reserve inventory for a work order."""
    result = await db.execute(select(Inventory).where(Inventory.id == inv_id))
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    
    if quantity > inv.quantity_available:
        raise HTTPException(status_code=400, detail="Insufficient available quantity")
    
    inv.quantity_reserved += quantity
    inv.quantity_available = inv.quantity_on_hand - inv.quantity_reserved
    await db.commit()
    
    return {"message": "Inventory reserved", "reserved": quantity}
