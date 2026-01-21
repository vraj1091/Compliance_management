#!/usr/bin/env python3
"""
Script to run the backend server with proper initialization
"""
import asyncio
import uvicorn
from database import init_db
from seed import seed_data


async def setup_and_run():
    """Initialize database and seed data if needed"""
    print("Initializing database...")
    await init_db()
    
    print("Seeding database...")
    await seed_data()
    
    print("Starting server...")


if __name__ == "__main__":
    # Run setup
    asyncio.run(setup_and_run())
    
    # Start the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )