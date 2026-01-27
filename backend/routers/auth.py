"""Authentication router."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import timedelta
import traceback

from database import get_db
from models import User, Role
from schemas import Token, LoginRequest, UserCreate, UserResponse, ChangePasswordRequest
from utils.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_active_user
)
from config import settings


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if role exists
    result = await db.execute(select(Role).where(Role.id == user_data.role_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Invalid role ID")
    
    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        department=user_data.department,
        role_id=user_data.role_id
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Load the role relationship for the response
    result = await db.execute(
        select(User).options(selectinload(User.role)).where(User.id == user.id)
    )
    user_with_role = result.scalar_one()
    
    return user_with_role


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """Login and get access token."""
    print(f"LOGIN ATTEMPT: username={form_data.username}")
    try:
        result = await db.execute(
            select(User).options(selectinload(User.role)).where(User.username == form_data.username)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"LOGIN FAILED: User not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(form_data.password, user.password_hash):
            print(f"LOGIN FAILED: Invalid password")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        
        if not user.is_active:
            print(f"LOGIN FAILED: Inactive user")
            raise HTTPException(status_code=400, detail="Inactive user")
        
        access_token = create_access_token(
            data={"sub": user.id, "username": user.username, "role_id": user.role_id}
        )
        
        print(f"LOGIN SUCCESS: {user.username}")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"LOGIN ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user info."""
    return current_user


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password."""
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    current_user.password_hash = get_password_hash(data.new_password)
    await db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout (client should discard token)."""
    return {"message": "Logged out successfully"}
