#!/bin/bash
set -e

echo "========================================="
echo "  QMS-ERP Application Startup"
echo "========================================="
echo ""

# Wait a moment for any file system operations to complete
sleep 2

echo "[1/4] Checking database file..."
if [ ! -f "qms_erp.db" ]; then
    echo "✓ Database file does not exist, will create new"
else
    echo "✓ Database file exists"
fi
echo ""

echo "[2/4] Initializing database tables..."
python -c "
import asyncio
from database import init_db

async def main():
    try:
        await init_db()
        print('✓ Database tables created/verified successfully')
    except Exception as e:
        print(f'⚠ Database init error: {e}')
        import traceback
        traceback.print_exc()
        raise

asyncio.run(main())
" || { echo "✗ Database initialization failed!"; exit 1; }

echo ""
echo "[3/4] Seeding initial data..."
python -c "
import asyncio
from sqlalchemy import select
from database import AsyncSessionLocal
from models import Role, User
from utils.auth import get_password_hash

async def main():
    try:
        async with AsyncSessionLocal() as db:
            # Check if admin role exists
            result = await db.execute(select(Role).where(Role.id == 'role-admin'))
            if not result.scalar_one_or_none():
                print('  Creating admin role...')
                admin_role = Role(
                    id='role-admin',
                    name='System Admin',
                    description='Full system access',
                    permissions={'all': True}
                )
                db.add(admin_role)
                await db.commit()
                print('  ✓ Admin role created')
            else:
                print('  ✓ Admin role exists')
            
            # Check if admin user exists
            result = await db.execute(select(User).where(User.username == 'admin'))
            admin_user = result.scalar_one_or_none()
            if not admin_user:
                print('  Creating admin user...')
                admin_user = User(
                    id='user-admin',
                    email='admin@qms-erp.com',
                    username='admin',
                    password_hash=get_password_hash('Admin@123'),
                    first_name='System',
                    last_name='Administrator',
                    department='IT',
                    role_id='role-admin',
                    is_active=True
                )
                db.add(admin_user)
                await db.commit()
                print('  ✓ Admin user created')
            else:
                print('  ✓ Admin user exists')
                # Reset password just in case
                admin_user.password_hash = get_password_hash('Admin@123')
                admin_user.is_active = True
                await db.commit()
                print('  ✓ Password verified/reset')
        
        print('✓ Database seeded successfully')
    except Exception as e:
        print(f'⚠ Seed error: {e}')
        import traceback
        traceback.print_exc()
        raise

asyncio.run(main())
" || { echo "✗ Database seeding failed!"; exit 1; }

echo ""
echo "[4/4] Starting FastAPI server..."
echo "========================================="
echo ""
echo "Login credentials:"
echo "  Username: admin"
echo "  Password: Admin@123"
echo ""

exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
