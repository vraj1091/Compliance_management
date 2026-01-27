"""Manual database initialization script for Render deployment."""
import asyncio
import sys
from sqlalchemy import select
from database import init_db, AsyncSessionLocal
from models import Role, User
from utils.auth import get_password_hash


async def manual_init():
    """Manually initialize database and create admin user."""
    print("=" * 60)
    print("MANUAL DATABASE INITIALIZATION")
    print("=" * 60)
    print()
    
    # Step 1: Create tables
    print("[1/3] Creating database tables...")
    try:
        await init_db()
        print("✓ Tables created successfully")
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        return False
    
    print()
    
    # Step 2: Create admin role
    print("[2/3] Creating admin role...")
    async with AsyncSessionLocal() as db:
        try:
            # Check if role exists
            result = await db.execute(select(Role).where(Role.id == "role-admin"))
            admin_role = result.scalar_one_or_none()
            
            if admin_role:
                print("✓ Admin role already exists")
            else:
                admin_role = Role(
                    id="role-admin",
                    name="System Admin",
                    description="Full system access",
                    permissions={"all": True}
                )
                db.add(admin_role)
                await db.commit()
                print("✓ Admin role created")
        except Exception as e:
            print(f"✗ Error creating role: {e}")
            await db.rollback()
            return False
    
    print()
    
    # Step 3: Create admin user
    print("[3/3] Creating admin user...")
    async with AsyncSessionLocal() as db:
        try:
            # Check if user exists
            result = await db.execute(select(User).where(User.username == "admin"))
            admin_user = result.scalar_one_or_none()
            
            if admin_user:
                print("✓ Admin user already exists")
                print("  Resetting password to 'Admin@123'...")
                admin_user.password_hash = get_password_hash("Admin@123")
                admin_user.is_active = True
                await db.commit()
                print("✓ Password reset successfully")
            else:
                admin_user = User(
                    id="user-admin",
                    email="admin@qms-erp.com",
                    username="admin",
                    password_hash=get_password_hash("Admin@123"),
                    first_name="System",
                    last_name="Administrator",
                    department="IT",
                    role_id="role-admin",
                    is_active=True
                )
                db.add(admin_user)
                await db.commit()
                print("✓ Admin user created")
        except Exception as e:
            print(f"✗ Error creating user: {e}")
            await db.rollback()
            return False
    
    print()
    print("=" * 60)
    print("DATABASE INITIALIZATION COMPLETE!")
    print("=" * 60)
    print()
    print("Login credentials:")
    print("  Username: admin")
    print("  Password: Admin@123")
    print()
    return True


if __name__ == "__main__":
    success = asyncio.run(manual_init())
    sys.exit(0 if success else 1)
