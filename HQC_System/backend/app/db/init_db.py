# Copyright (c) 2025 HQC System Contributors
import asyncio
import json
import logging
import requests
from sqlalchemy import text
from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine

logger = logging.getLogger(__name__)

# OSM Overpass API URL
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Create async engine for initialization tasks
pg_engine = create_async_engine(settings.ASYNC_DATABASE_URL)

async def check_and_sync_boundaries():
    """Kiểm tra và đồng bộ ranh giới hành chính Hà Nội nếu rỗng"""
    async with pg_engine.begin() as conn:
        result = await conn.execute(text("SELECT count(*) FROM administrative_boundaries"))
        count = result.scalar()
        
        if count > 0:
            logger.info(f"[InitDB] Found {count} administrative boundaries, skipping boundary sync.")
            return

        logger.info("[InitDB] Administrative boundaries table is empty. Syncing Hanoi districts from Overpass...")
        
        # Hanoi Administrative Boundary Query
        query = """
        [out:json][timeout:60];
        (
          // Hanoi Districts
          relation["admin_level"="6"](area:3601901191);
        );
        out tags bb geom;
        """
        
        try:
            response = requests.post(OVERPASS_URL, data={'data': query}, timeout=90)
            response.raise_for_status()
            data = response.json()
            elements = data.get('elements', [])
            
            for el in elements:
                osm_id = el.get('id')
                tags = el.get('tags', {})
                name = tags.get('name', tags.get('name:vi', 'Không tên'))
                admin_level = int(tags.get('admin_level', 6))
                
                bounds = el.get('bounds', {})
                if not bounds: continue
                
                wkt = f"POLYGON(({bounds['minlon']} {bounds['minlat']}, {bounds['maxlon']} {bounds['minlat']}, {bounds['maxlon']} {bounds['maxlat']}, {bounds['minlon']} {bounds['maxlat']}, {bounds['minlon']} {bounds['minlat']}))"
                
                await conn.execute(text("""
                    INSERT INTO administrative_boundaries (osm_id, osm_type, name, admin_level, geometry, tags)
                    VALUES (:osm_id, 'relation', :name, :admin_level, ST_GeomFromText(:wkt, 4326), :tags)
                    ON CONFLICT (osm_id) DO NOTHING;
                """), {
                    "osm_id": osm_id,
                    "name": name,
                    "admin_level": admin_level,
                    "wkt": wkt,
                    "tags": json.dumps(tags)
                })
            logger.info(f"[InitDB] Successfully synced {len(elements)} Hanoi districts.")
        except Exception as e:
            logger.error(f"[InitDB] Failed to sync boundaries: {e}")

async def check_and_sync_pois():
    """Kiểm tra và đồng bộ POI Hà Nội nếu rỗng"""
    async with pg_engine.begin() as conn:
        result = await conn.execute(text("SELECT count(*) FROM pois"))
        count = result.scalar()
        
        if count > 10: # Nếu có hơn 10 POI (đã seed dense/osm), bỏ qua
            logger.info(f"[InitDB] Found {count} POIs, skipping POI sync.")
            return

        logger.info("[InitDB] POI table is sparse/empty. Syncing central Hanoi POIs from Overpass...")
        
        # BBOX Central Hanoi
        bbox = "20.95,105.75,21.10,105.90"
        poi_types = [
            ("amenity", "restaurant"), ("amenity", "cafe"), ("amenity", "bank"),
            ("amenity", "atm"), ("amenity", "hospital"), ("amenity", "pharmacy"),
            ("shop", "supermarket"), ("shop", "mall"), ("tourism", "attraction"),
            ("tourism", "hotel"), ("leisure", "park")
        ]
        
        parts = []
        for key, val in poi_types:
            parts.append(f'node["{key}"="{val}"]({bbox});')
            parts.append(f'way["{key}"="{val}"]({bbox});')
            
        query = f"[out:json][timeout:120]; ( {' '.join(parts)} ); out center tags;"
        
        try:
            response = requests.post(OVERPASS_URL, data={'data': query}, timeout=120)
            response.raise_for_status()
            data = response.json()
            elements = data.get('elements', [])
            
            for el in elements:
                osm_id = el.get('id')
                tags = el.get('tags', {})
                lat = el.get('lat') or el.get('center', {}).get('lat')
                lon = el.get('lon') or el.get('center', {}).get('lon')
                if lat is None or lon is None: continue
                
                # Simple categorization
                cat, sub = "amenity", "other"
                for k, v in poi_types:
                    if tags.get(k) == v:
                        cat, sub = k, v
                        break
                
                name = tags.get('name') or tags.get('name:vi') or "Không tên"
                
                await conn.execute(text("""
                    INSERT INTO pois (osm_id, osm_type, name, category, subcategory, location, tags)
                    VALUES (:osm_id, :osm_type, :name, :cat, :sub, ST_GeomFromText(:wkt, 4326), :tags)
                    ON CONFLICT (osm_id) DO NOTHING;
                """), {
                    "osm_id": osm_id,
                    "osm_type": el.get('type', 'node'),
                    "name": name,
                    "cat": cat,
                    "sub": sub,
                    "wkt": f"POINT({lon} {lat})",
                    "tags": json.dumps(tags)
                })
            logger.info(f"[InitDB] Successfully synced {len(elements)} real POIs.")
        except Exception as e:
            logger.error(f"[InitDB] Failed to sync POIs: {e}")

async def init_db():
    """Main function to initialize database data"""
    logger.info("[InitDB] Starting database initialization check...")
    
    # 1. Sync boundaries
    await check_and_sync_boundaries()
    
    # 2. Sync POIs
    await check_and_sync_pois()
    
    logger.info("[InitDB] Database initialization check completed.")
