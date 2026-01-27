#!/bin/bash
set -e

echo "========================================="
echo "  QMS-ERP Application Startup"
echo "========================================="
echo ""

echo "[1/3] Initializing database..."
python -c "
import asyncio
from database import init_db

async def main():
    try:
        await init_db()
        print('✓ Database initialized successfully')
    except Exception as e:
        print(f'⚠ Database init warning: {e}')
        print('  Continuing anyway...')

asyncio.run(main())
" || echo "⚠ Database initialization skipped"

echo ""
echo "[2/3] Seeding initial data..."
python -c "
import asyncio
from seed import seed_data

async def main():
    try:
        await seed_data()
        print('✓ Data seeded successfully')
    except Exception as e:
        print(f'⚠ Seed warning: {e}')
        print('  Continuing anyway...')

asyncio.run(main())
" || echo "⚠ Data seeding skipped"

echo ""
echo "[3/3] Starting FastAPI server..."
echo "========================================="
echo ""

exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
