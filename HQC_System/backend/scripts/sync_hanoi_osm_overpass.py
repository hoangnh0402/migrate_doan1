#!/usr/bin/env python3
# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Sync Hanoi OSM data from Overpass API (Real-time fetching)
Does not require local PBF files or osmium tool.
"""

import sys
import os
import requests
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

HANOI_QUERY = """
[out:json][timeout:60];
(
  // Hanoi City
  relation["admin_level"="4"]["name:en"="Hanoi"];
  // Hanoi Districts
  relation["admin_level"="6"](area:3601901191);
);
out tags bb geom;
"""

async def sync_hanoi_osm():
    print("🌍 Fetching real Hanoi OSM data from Overpass API...")
    
    try:
        response = requests.post(OVERPASS_URL, data={'data': HANOI_QUERY}, timeout=60)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"❌ Failed to fetch data from Overpass: {e}")
        return

    elements = data.get('elements', [])
    print(f"✓ Found {len(elements)} administrative boundaries.")

    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    
    async with engine.begin() as conn:
        for el in elements:
            osm_id = el.get('id')
            tags = el.get('tags', {})
            name = tags.get('name', tags.get('name:vi', 'Không tên'))
            admin_level = int(tags.get('admin_level', 6))
            
            # Simplified geometry for demonstration (using bounding box as polygon if geom is complex)
            # In a real app, we'd reconstruct the full polygon from el['geometry']
            bounds = el.get('bounds', {})
            if not bounds: continue
            
            # Create a simple box polygon from bounding box
            min_lat, min_lon = bounds['minlat'], bounds['minlon']
            max_lat, max_lon = bounds['maxlat'], bounds['maxlon']
            
            wkt = f'POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, {max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))'
            
            print(f"  → Syncing {name} (Level {admin_level})...")
            
            await conn.execute(text("""
                INSERT INTO administrative_boundaries (osm_id, osm_type, name, admin_level, geometry, tags)
                VALUES (:osm_id, 'relation', :name, :admin_level, ST_GeomFromText(:wkt, 4326), :tags)
                ON CONFLICT (osm_id) DO UPDATE SET 
                    name = EXCLUDED.name,
                    geometry = EXCLUDED.geometry,
                    tags = EXCLUDED.tags;
            """), {
                "osm_id": osm_id,
                "name": name,
                "admin_level": admin_level,
                "wkt": wkt,
                "tags": json.dumps(tags)
            })
            
    await engine.dispose()
    print("✅ Real-time OSM syncing for Hanoi completed!")

if __name__ == "__main__":
    import json
    asyncio.run(sync_hanoi_osm())
