#!/bin/bash
set -e

echo "========================================="
echo "  QMS-ERP Application Startup"
echo "========================================="
echo ""

# Wait a moment for any file system operations to complete
sleep 2

echo "[1/2] Initializing database (synchronous)..."
python init_db_sync.py || { echo "✗ Database initialization failed!"; exit 1; }

echo ""
echo "[2/2] Starting FastAPI server..."
echo "========================================="
echo ""

exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
