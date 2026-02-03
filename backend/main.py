"""
Medical Device QMS-ERP System
Main FastAPI Application Entry Point
"""
print("DEBUG: main.py is loading...")
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from sqlalchemy import select

from config import settings
from database import init_db, AsyncSessionLocal
from models import User
from seed import seed_data

# Import routers
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.documents import router as documents_router
from routers.training import router as training_router
from routers.nc_capa import router as nc_capa_router
from routers.audits import router as audits_router
from routers.items import router as items_router
from routers.work_orders import router as work_orders_router
from routers.dashboard import router as dashboard_router
from routers.qc import router as qc_router
from routers.inventory import router as inventory_router

# New department routers
from routers.hr import router as hr_router
from routers.maintenance import router as maintenance_router
from routers.marketing import router as marketing_router
from routers.purchase import router as purchase_router
from routers.store import router as store_router
from routers.mr import router as mr_router
from routers.qc_extended import router as qc_extended_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    # Startup
    print("Starting Medical Device QMS-ERP System...")
    await init_db()
    print("Database initialized")
    
    # Auto-seed if admin user is missing
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        if not result.scalar_one_or_none():
            print("Admin user not found. Auto-seeding database...")
            try:
                await seed_data()
                print("Database seeded successfully!")
            except Exception as e:
                print(f"Error seeding database: {e}")
    
    yield
    # Shutdown
    print("Shutting down...")



# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Medical Device QMS-ERP System
    
    A comprehensive Quality Management System and ERP for medical device manufacturers.
    
    ### Features:
    - 📋 Document Control
    - 🎓 Training Management  
    - ⚠️ Nonconformance & CAPA
    - 📊 Audit Management
    - 🏭 Manufacturing (Items, BOM, Routing, Work Orders)
    - 📦 Inventory & Lot Tracking
    - 🔍 Quality Control & Inspections
    - 📈 Real-time Dashboards
    
    ### Regulatory Compliance:
    - FDA 21 CFR Part 820
    - ISO 13485:2016
    - EU MDR 2017/745
    """,
    openapi_tags=[
        {"name": "Authentication", "description": "User authentication and session management"},
        {"name": "Users", "description": "User and role management"},
        {"name": "Documents", "description": "Document control and version management"},
        {"name": "Training", "description": "Training matrix and records"},
        {"name": "Nonconformances", "description": "NC management and tracking"},
        {"name": "CAPAs", "description": "Corrective and preventive actions"},
        {"name": "Audits", "description": "Audit scheduling and findings"},
        {"name": "Items", "description": "Item master and BOM management"},
        {"name": "Work Orders", "description": "Manufacturing work orders"},
        {"name": "Dashboard", "description": "KPIs and analytics"},
    ],
    lifespan=lifespan,
)

# Configure CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"  # Allow all other origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(documents_router)
app.include_router(training_router)
app.include_router(nc_capa_router)
app.include_router(audits_router)
app.include_router(items_router)
app.include_router(work_orders_router)
app.include_router(dashboard_router)
app.include_router(qc_router)
app.include_router(inventory_router)

# New department routers
app.include_router(hr_router)
app.include_router(maintenance_router)
app.include_router(marketing_router)
app.include_router(purchase_router)
app.include_router(store_router)
app.include_router(mr_router)
app.include_router(qc_extended_router)


@app.get("/api", tags=["Root"])
async def root():
    """Root endpoint - API health check."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "Welcome to the Medical Device QMS-ERP API"
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}


@app.get("/debug-static", tags=["Root"])
async def debug_static():
    """Debug endpoint to check static files."""
    static_dir = Path(__file__).parent / "static"
    return {
        "static_dir_exists": static_dir.exists(),
        "static_dir_path": str(static_dir),
        "files": list(str(f) for f in static_dir.rglob("*")) if static_dir.exists() else []
    }


@app.get("/debug-headers", tags=["Root"])
async def debug_headers(request: Request):
    return {"headers": dict(request.headers)}


# Mount static files for production (frontend build)
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React SPA for all non-API routes."""
        # If it's an API route, let it pass through
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        
        # If it's empty or root, serve index.html
        if not full_path or full_path == "/":
            index_path = static_dir / "index.html"
            if index_path.exists():
                return FileResponse(index_path)
        
        # Check if file exists in static directory
        file_path = static_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        
        # Otherwise serve index.html (SPA routing)
        index_path = static_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        
        return {"error": "Frontend not built"}
else:
    @app.get("/")
    async def root_fallback():
        """Fallback when static files don't exist."""
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "message": "Welcome to the Medical Device QMS-ERP API",
            "note": "Frontend static files not found. Build the frontend first."
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
