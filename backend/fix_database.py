"""Fix database and create admin user."""
import asyncio
import sys
from pathlib import Path
from sqlalchemy import select
from database import AsyncSessionLocal, init_db, engine
from models import User, Role
from utils.auth import get_password_hash


async def fix_database():
    """Initialize database and create admin user if needed."""
    print("=" * 60)
    print("DATABASE FIX SCRIPT")
    print("=" * 60)
    
    # Step 1: Initialize database (create all tables)
    print("\n[1/4] Initializing database tables...")
    try:
        await init_db()
        print("✓ Database tables created/verified")
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        return False
    
    # Step 2: Check if admin role exists
    print("\n[2/4] Checking admin role...")
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Role).where(Role.id == "role-admin"))
            admin_role = result.scalar_one_or_none()
            
            if not admin_role:
                print("  Creating admin role...")
                admin_role = Role(
                    id="role-admin",
                    name="System Admin",
                    description="Full system access",
                    permissions={"all": True}
                )
                db.add(admin_role)
                await db.commit()
                print("✓ Admin role created")
            else:
                print("✓ Admin role exists")
        except Exception as e:
            print(f"✗ Error with admin role: {e}")
            return False
    
    # Step 3: Check if admin user exists
    print("\n[3/4] Checking admin user...")
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(User).where(User.username == "admin"))
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                print("  Creating admin user...")
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
            else:
                print("✓ Admin user exists")
                # Reset password just in case
                print("  Resetting admin password to 'Admin@123'...")
                admin_user.password_hash = get_password_hash("Admin@123")
                admin_user.is_active = True
                await db.commit()
                print("✓ Password reset")
        except Exception as e:
            print(f"✗ Error with admin user: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    # Step 4: Verify login
    print("\n[4/4] Verifying admin login...")
    async with AsyncSessionLocal() as db:
        try:
            from sqlalchemy.orm import selectinload
            result = await db.execute(
                select(User).options(selectinload(User.role)).where(User.username == "admin")
            )
            user = result.scalar_one_or_none()
            
            if user:
                from utils.auth import verify_password
                password_valid = verify_password("Admin@123", user.password_hash)
                if password_valid:
                    print("✓ Admin login verified")
                else:
                    print("✗ Password verification failed")
                    return False
            else:
                print("✗ Admin user not found")
                return False
        except Exception as e:
            print(f"✗ Error verifying login: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    print("\n" + "=" * 60)
    print("DATABASE FIX COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print("\n✓ You can now login with:")
    print("  Username: admin")
    print("  Password: Admin@123")
    print("\n" + "=" * 60)
    return True


async def main():
    """Main entry point."""
    success = await fix_database()
    if not success:
        print("\n⚠ Database fix encountered errors. Please check the output above.")
        sys.exit(1)
    else:
        print("\n✓ All checks passed. Backend should be ready.")
        sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
