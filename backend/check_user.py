import asyncio
from sqlalchemy import select
from database import AsyncSessionLocal
from models import User

async def check_user():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        user = result.scalar_one_or_none()
        if user:
            print(f"User found: {user.username}, ID: {user.id}, Role: {user.role_id}")
        else:
            print("User 'admin' NOT FOUND.")

if __name__ == "__main__":
    asyncio.run(check_user())
