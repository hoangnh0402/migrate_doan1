import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.auth_service import auth_service
from app.core.config import settings

async def reset():
    print(f"Connecting to {settings.MONGODB_URL}")
    db = AsyncIOMotorClient(settings.MONGODB_URL).hqc_system_realtime
    
    pwd = auth_service.get_password_hash("Admin@2025")
    print("New hashed password:", pwd)
    
    result = await db.users.update_one(
        {"email": "admin@hqcsystem.com"},
        {"$set": {"hashed_password": pwd}}
    )
    print(f"Updated {result.modified_count} documents!")

if __name__ == "__main__":
    asyncio.run(reset())
