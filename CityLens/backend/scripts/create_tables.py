
import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.db.postgres import Base

# Import all models to register them with Base.metadata
from app.models.user import User
from app.models.report import Report, ReportCategory, ReportComment, ReportVote, ReportFollower, ReportActivity
from app.models.geographic import AdministrativeBoundary, Street, Building
from app.models.facility import PublicFacility, TransportFacility
from app.models.environment import EnvironmentalData
from app.models.db_models import EntityDB
from app.models.assignment import Department, ReportAssignment, AssignmentHistory, DepartmentMember
from app.models.notification import Notification, UserNotificationSettings, NotificationTemplate
from app.models.media import MediaFile
from app.models.incident import Incident

async def create_tables():
    print(f"Connecting to {settings.ASYNC_DATABASE_URL}...")
    engine = create_async_engine(settings.ASYNC_DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        print("Creating all tables...")
        # Note: This will not drop existing tables, it only creates missing ones
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully!")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_tables())
