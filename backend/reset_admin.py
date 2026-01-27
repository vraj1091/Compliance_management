import asyncio
from database import AsyncSessionLocal
from models import User
from utils.auth import get_password_hash
from sqlalchemy import select

async def reset_password():
    print("Connecting to database...")
    async with AsyncSessionLocal() as db:
        print("Searching for user 'admin'...")
        result = await db.execute(select(User).where(User.username == "admin"))
        user = result.scalar_one_or_none()
        if user:
            print(f"Found user: {user.username}")
            new_hash = get_password_hash("Admin@123")
            user.password_hash = new_hash
            await db.commit()
            print("Password successfully reset to 'Admin@123'")
        else:
            print("User 'admin' not found! You may need to run seed.py.")

if __name__ == "__main__":
    asyncio.run(reset_password())
