"""Items and Manufacturing router."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from database import get_db
from models import Item, BillOfMaterial, Routing, User
from schemas import ItemCreate, ItemUpdate, ItemResponse
from utils.auth import get_current_user


router = APIRouter(prefix="/api", tags=["Manufacturing"])


# ==================== Items ====================

@router.get("/items", response_model=List[ItemResponse])
async def get_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    item_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all items."""
    query = select(Item).order_by(Item.item_code)
    
    if item_type:
        query = query.where(Item.item_type == item_type)
    if status:
        query = query.where(Item.status == status)
    if search:
        query = query.where(Item.item_code.ilike(f"%{search}%") | Item.description.ilike(f"%{search}%"))
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_data: ItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new item."""
    # Check if item code exists
    result = await db.execute(select(Item).where(Item.item_code == item_data.item_code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Item code already exists")
    
    item = Item(**item_data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    
    return item


@router.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific item."""
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: str,
    item_data: ItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an item."""
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    await db.commit()
    await db.refresh(item)
    
    return item


# ==================== Bill of Materials ====================

@router.get("/boms/{item_id}")
async def get_bom(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get BOM for an item."""
    result = await db.execute(
        select(BillOfMaterial)
        .options(selectinload(BillOfMaterial.component_item))
        .where(BillOfMaterial.parent_item_id == item_id)
        .order_by(BillOfMaterial.sequence)
    )
    bom_items = result.scalars().all()
    
    return [
        {
            "id": bom.id,
            "component_item_id": bom.component_item_id,
            "component_code": bom.component_item.item_code if bom.component_item else None,
            "component_description": bom.component_item.description if bom.component_item else None,
            "quantity": float(bom.quantity) if bom.quantity else 0,
            "unit_of_measure": bom.unit_of_measure,
            "sequence": bom.sequence
        }
        for bom in bom_items
    ]


@router.post("/boms")
async def create_bom_line(
    parent_item_id: str,
    component_item_id: str,
    quantity: float,
    unit_of_measure: str = "EA",
    sequence: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a component to BOM."""
    bom = BillOfMaterial(
        parent_item_id=parent_item_id,
        component_item_id=component_item_id,
        quantity=quantity,
        unit_of_measure=unit_of_measure,
        sequence=sequence
    )
    db.add(bom)
    await db.commit()
    
    return {"message": "BOM line added successfully"}


# ==================== Routing ====================

@router.get("/routings/{item_id}")
async def get_routing(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get routing for an item."""
    result = await db.execute(
        select(Routing)
        .where(Routing.item_id == item_id)
        .order_by(Routing.operation_sequence)
    )
    return result.scalars().all()


@router.post("/routings")
async def create_routing_operation(
    item_id: str,
    operation_sequence: int,
    operation_name: str,
    work_center: Optional[str] = None,
    setup_time_minutes: int = 0,
    run_time_per_unit: Optional[float] = None,
    instructions: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a routing operation."""
    routing = Routing(
        item_id=item_id,
        operation_sequence=operation_sequence,
        operation_name=operation_name,
        work_center=work_center,
        setup_time_minutes=setup_time_minutes,
        run_time_per_unit=run_time_per_unit,
        instructions=instructions
    )
    db.add(routing)
    await db.commit()
    
    return {"message": "Routing operation added successfully"}
