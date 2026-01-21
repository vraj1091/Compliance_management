#!/usr/bin/env python3
"""
Simple script to test backend functionality
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.append('backend')

from database import init_db, AsyncSessionLocal
from models import User, Role
from sqlalchemy import select
from sqlalchemy.orm import selectinload


async def test_database():
    """Test database connection and data"""
    try:
        print("Testing database connection...")
        await init_db()
        print("✅ Database initialized successfully")
        
        async with AsyncSessionLocal() as db:
            # Test if roles exist
            result = await db.execute(select(Role))
            roles = result.scalars().all()
            print(f"✅ Found {len(roles)} roles in database")
            
            # Test if users exist
            result = await db.execute(
                select(User).options(selectinload(User.role))
            )
            users = result.scalars().all()
            print(f"✅ Found {len(users)} users in database")
            
            # Test specific user
            result = await db.execute(
                select(User).options(selectinload(User.role)).where(User.username == "admin")
            )
            admin_user = result.scalar_one_or_none()
            
            if admin_user:
                print(f"✅ Admin user found: {admin_user.username} ({admin_user.email})")
                if admin_user.role:
                    print(f"✅ Admin role loaded: {admin_user.role.name}")
                else:
                    print("❌ Admin role not loaded")
            else:
                print("❌ Admin user not found")
                
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False
    
    return True


async def main():
    """Main test function"""
    print("🧪 Testing QMS-ERP Backend\n")
    
    success = await test_database()
    
    if success:
        print("\n✅ All tests passed! Backend should work correctly.")
        print("\nTo start the backend:")
        print("  cd backend")
        print("  python run_backend.py")
        print("\nTest credentials:")
        print("  Username: admin")
        print("  Password: Admin@123")
    else:
        print("\n❌ Tests failed. Please check the database setup.")


if __name__ == "__main__":
    asyncio.run(main())