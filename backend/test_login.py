#!/usr/bin/env python3
"""Test login functionality"""
import asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import AsyncSessionLocal
from models import User
from utils.auth import verify_password

async def test_login():
    async with AsyncSessionLocal() as db:
        # Find admin user
        result = await db.execute(
            select(User).options(selectinload(User.role)).where(User.username == "admin")
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print("ERROR: Admin user not found!")
            return
        
        print(f"Found user: {user.username}")
        print(f"User ID: {user.id}")
        print(f"Password hash: {user.password_hash[:50]}...")
        print(f"Is active: {user.is_active}")
        print(f"Role ID: {user.role_id}")
        
        # Test password
        test_password = "Admin@123"
        is_valid = verify_password(test_password, user.password_hash)
        print(f"Password '{test_password}' valid: {is_valid}")

if __name__ == "__main__":
    asyncio.run(test_login())
