#!/usr/bin/env python3
# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Initialize database schema - tạo tất cả tables
Run this instead of alembic when GeoAlchemy2 index conflicts occur
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.postgres import Base

# Import all models to register them with Base
from app.models import *  # noqa


def init_db():
    """Initialize database by creating all tables"""
    
    # Create engine
    engine = create_engine(settings.SQLALCHEMY_SYNC_DATABASE_URI)
    
    print("🔧 Creating PostGIS extension...")
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        conn.commit()
    
    print("🗄️  Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database schema initialized successfully!")
    print(f"📊 Created {len(Base.metadata.tables)} tables")
    
    # List all tables
    print("\n📋 Tables created:")
    for table_name in sorted(Base.metadata.tables.keys()):
        print(f"   - {table_name}")


if __name__ == "__main__":
    try:
        init_db()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
