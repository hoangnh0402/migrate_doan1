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
        print("ðŸŒ Seeding Geographic stub data (OSM layers)...")
        
        # 1. Streets
        await conn.execute(text("""
            INSERT INTO streets (osm_id, osm_type, name, highway_type, geometry)
            VALUES (1001, 'way', 'ÄÆ°á»ng Giáº£i PhÃ³ng', 'primary', ST_GeomFromText('LINESTRING(105.842 21.002, 105.845 21.015)', 4326))
            ON CONFLICT (osm_id) DO NOTHING;
        """))
        
        # 2. Buildings
        await conn.execute(text("""
            INSERT INTO buildings (osm_id, osm_type, name, building_type, geometry)
            VALUES (2001, 'way', 'TÃ²a nhÃ  HQC System', 'office', ST_GeomFromText('POLYGON((105.815 21.032, 105.822 21.032, 105.822 21.038, 105.815 21.038, 105.815 21.032))', 4326))
            ON CONFLICT (osm_id) DO NOTHING;
        """))
        
        # 3. POIs
        await conn.execute(text("""
            INSERT INTO pois (osm_id, osm_type, name, category, location)
            VALUES (3001, 'node', 'Há»“ HoÃ n Kiáº¿m', 'tourism', ST_GeomFromText('POINT(105.852 21.028)', 4326))
            ON CONFLICT (osm_id) DO NOTHING;
        """))
        
        # 4. Administrative Boundaries
        await conn.execute(text("""
            INSERT INTO administrative_boundaries (osm_id, osm_type, name, admin_level, geometry)
            VALUES (4001, 'relation', 'Quáº­n HoÃ n Kiáº¿m', 6, ST_GeomFromText('POLYGON((105.840 21.025, 105.858 21.025, 105.858 21.040, 105.840 21.040, 105.840 21.025))', 4326))
            ON CONFLICT (osm_id) DO NOTHING;
        """))
        
        print("  âœ“ Seeded Streets, Buildings, POIs, and Boundaries")
        
    await engine.dispose()
    print("âœ… Geographic seeding completed!")

if __name__ == "__main__":
    import traceback
    try:
        asyncio.run(seed_geographic_stub())
    except Exception:
        traceback.print_exc()

