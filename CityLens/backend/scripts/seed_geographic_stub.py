#!/usr/bin/env python3
import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

async def seed_geographic_stub():
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    
    async with engine.begin() as conn:
        print("🌍 Seeding Geographic stub data (OSM layers)...")
        
        # 1. Streets
        await conn.execute(text("""
            INSERT INTO streets (osm_id, name, highway_type, geometry)
            VALUES (1001, 'Đường Giải Phóng', 'primary', ST_GeomFromText('LINESTRING(105.84 21.00, 105.85 21.01)', 4326))
            ON CONFLICT (osm_id) DO NOTHING;
        """))
        
        # 2. Buildings
        await conn.execute(text("""
            INSERT INTO buildings (osm_id, name, building_type, geometry)
            VALUES (2001, 'Tòa nhà CityLens', 'office', ST_GeomFromText('POLYGON((105.81 21.03, 105.82 21.03, 105.82 21.04, 105.81 21.04, 105.81 21.03))', 4326))
            ON CONFLICT (osm_id) DO NOTHING;
        """))
        
        # 3. POIs
        await conn.execute(text("""
            INSERT INTO pois (osm_id, osm_type, name, category, geometry)
            VALUES (3001, 'node', 'Hồ Hoàn Kiếm', 'tourism', ST_GeomFromText('POINT(105.85 21.02)', 4326))
            ON CONFLICT (osm_id) DO NOTHING;
        """))
        
        # 4. Administrative Boundaries
        await conn.execute(text("""
            INSERT INTO administrative_boundaries (osm_id, osm_type, name, admin_level, geometry)
            VALUES (4001, 'relation', 'Quận Hoàn Kiếm', 6, ST_GeomFromText('POLYGON((105.84 21.02, 105.86 21.02, 105.86 21.04, 105.84 21.04, 105.84 21.02))', 4326))
            ON CONFLICT (osm_id) DO NOTHING;
        """))
        
        print("  ✓ Seeded Streets, Buildings, POIs, and Boundaries")
        
    await engine.dispose()
    print("✅ Geographic seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_geographic_stub())
