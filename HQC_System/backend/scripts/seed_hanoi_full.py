#!/usr/bin/env python3
# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Import DỮ LIỆU THẬT của Hà Nội từ OpenStreetMap (Overpass API) vào PostgreSQL/PostGIS.

Bao gồm 4 layer:
  1. Administrative Boundaries (Thành phố, Quận/Huyện, Phường/Xã)
  2. Streets (Đường phố có tên)
  3. Buildings (Tòa nhà có tên)
  4. POIs (Điểm quan trọng: nhà hàng, bệnh viện, trường học, ATM...)

Usage:
    python scripts/seed_hanoi_full.py                    # Import tất cả
    python scripts/seed_hanoi_full.py --only boundaries  # Chỉ ranh giới
    python scripts/seed_hanoi_full.py --only streets     # Chỉ đường phố
    python scripts/seed_hanoi_full.py --only buildings   # Chỉ tòa nhà
    python scripts/seed_hanoi_full.py --only pois        # Chỉ POI
    python scripts/seed_hanoi_full.py --dry-run          # Chỉ query, không insert
"""

import sys
import os
import json
import time
import asyncio
import argparse
import traceback
from typing import List, Dict, Any, Optional, Tuple

import requests
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

# ============================================================================
# CONSTANTS
# ============================================================================

# Multiple Overpass API mirrors for reliability
OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]
OVERPASS_TIMEOUT = 120  # seconds per request

# Hanoi OSM relation ID → area ID for Overpass
# area_id = 3600000000 + relation_id
HANOI_RELATION_ID = 1901191
HANOI_AREA_ID = 3600000000 + HANOI_RELATION_ID  # 3601901191

# Bounding box of Hanoi (urban core for faster queries)
# Full Hanoi is very large - focus on urban districts
HANOI_BBOX = "20.95,105.75,21.10,105.90"         # Urban core
HANOI_BBOX_EXTENDED = "20.85,105.70,21.20,105.95"  # Extended urban
HANOI_BBOX_FULL = "20.55,105.28,21.40,106.05"      # Full Hanoi province

# Rate limiting: delay between Overpass queries (seconds)
QUERY_DELAY = 10

# Current server index (will rotate on failure)
_current_server_idx = 0

# POI categories to import
POI_CATEGORIES = [
    # (osm_key, osm_value, system_category, system_subcategory)
    ("amenity", "restaurant", "amenity", "restaurant"),
    ("amenity", "cafe", "amenity", "cafe"),
    ("amenity", "fast_food", "amenity", "fast_food"),
    ("amenity", "bar", "amenity", "bar"),
    ("amenity", "bank", "amenity", "bank"),
    ("amenity", "atm", "amenity", "atm"),
    ("amenity", "hospital", "amenity", "hospital"),
    ("amenity", "clinic", "amenity", "clinic"),
    ("amenity", "pharmacy", "amenity", "pharmacy"),
    ("amenity", "school", "amenity", "school"),
    ("amenity", "university", "amenity", "university"),
    ("amenity", "kindergarten", "amenity", "kindergarten"),
    ("amenity", "library", "amenity", "library"),
    ("amenity", "police", "amenity", "police"),
    ("amenity", "fire_station", "amenity", "fire_station"),
    ("amenity", "post_office", "amenity", "post_office"),
    ("amenity", "fuel", "amenity", "fuel"),
    ("amenity", "parking", "amenity", "parking"),
    ("amenity", "place_of_worship", "amenity", "place_of_worship"),
    ("amenity", "marketplace", "amenity", "marketplace"),
    ("shop", "supermarket", "shop", "supermarket"),
    ("shop", "mall", "shop", "mall"),
    ("shop", "convenience", "shop", "convenience"),
    ("shop", "electronics", "shop", "electronics"),
    ("shop", "clothes", "shop", "clothes"),
    ("tourism", "hotel", "tourism", "hotel"),
    ("tourism", "attraction", "tourism", "attraction"),
    ("tourism", "museum", "tourism", "museum"),
    ("tourism", "viewpoint", "tourism", "viewpoint"),
    ("tourism", "guest_house", "tourism", "guest_house"),
    ("leisure", "park", "leisure", "park"),
    ("leisure", "sports_centre", "leisure", "sports_centre"),
    ("leisure", "swimming_pool", "leisure", "swimming_pool"),
    ("leisure", "stadium", "leisure", "stadium"),
    ("leisure", "fitness_centre", "leisure", "fitness_centre"),
]


def print_banner():
    print("=" * 70)
    print("  🏙️  HQC System - Import Dữ liệu Thật Hà Nội từ OpenStreetMap")
    print("=" * 70)
    print(f"  Overpass servers: {len(OVERPASS_SERVERS)} mirrors")
    print(f"  Hanoi Area ID: {HANOI_AREA_ID}")
    print(f"  Bbox (urban): {HANOI_BBOX}")
    print(f"  Rate limit delay: {QUERY_DELAY}s giữa các query")
    print("=" * 70)


# ============================================================================
# OVERPASS API HELPER
# ============================================================================

def query_overpass(query: str, description: str = "") -> Optional[Dict]:
    """Send query to Overpass API with server rotation and retry logic."""
    global _current_server_idx
    
    desc = f" ({description})" if description else ""
    
    # Try each server
    for server_attempt in range(len(OVERPASS_SERVERS)):
        server_idx = (_current_server_idx + server_attempt) % len(OVERPASS_SERVERS)
        server_url = OVERPASS_SERVERS[server_idx]
        server_name = server_url.split("//")[1].split("/")[0]
        
        for attempt in range(2):  # 2 retries per server
            try:
                print(f"  📡 [{server_name}] Query{desc} (lần {attempt+1})...")
                
                response = requests.post(
                    server_url,
                    data={"data": query},
                    timeout=OVERPASS_TIMEOUT,
                    headers={"User-Agent": "HQC-System/1.0 (university-project)"}
                )
                response.raise_for_status()
                response.encoding = 'utf-8'  # Force UTF-8 decoding to prevent Mojibake
                data = response.json()
                
                elements = data.get("elements", [])
                print(f"  ✓ Nhận được {len(elements)} phần tử")
                
                # Remember this working server
                _current_server_idx = server_idx
                return data
                
            except requests.exceptions.Timeout:
                print(f"  ⏱️ Timeout từ {server_name}")
                if attempt == 0:
                    time.sleep(5)
                    
            except requests.exceptions.HTTPError as e:
                status = e.response.status_code if e.response else 0
                print(f"  ❌ HTTP {status} từ {server_name}")
                if status == 429:
                    print(f"  ⚠️ Rate limited! Đợi {QUERY_DELAY}s...")
                    time.sleep(QUERY_DELAY)
                elif status in (504, 502, 503):
                    print(f"  ⚠️ Server overloaded, thử server khác...")
                    break  # Try next server
                else:
                    break
                    
            except Exception as e:
                print(f"  ❌ Lỗi: {e}")
                break
        
        # Delay before trying next server
        if server_attempt < len(OVERPASS_SERVERS) - 1:
            print(f"  🔄 Chuyển sang server khác...")
            time.sleep(3)
    
    print(f"  ❌ Tất cả {len(OVERPASS_SERVERS)} server đều thất bại")
    return None


# ============================================================================
# LAYER 1: ADMINISTRATIVE BOUNDARIES
# ============================================================================

async def import_admin_boundaries(engine: AsyncEngine, dry_run: bool = False) -> int:
    """
    Import ranh giới hành chính Hà Nội:
    - Level 4: Thành phố Hà Nội
    - Level 6: Quận/Huyện/Thị xã (~30)
    - Level 8: Phường/Xã/Thị trấn (~584)
    """
    print("\n" + "─" * 70)
    print("🏛️  LAYER 1: RANH GIỚI HÀNH CHÍNH")
    print("─" * 70)
    
    # Step 1: Hanoi city + Districts (small query, reliable)
    query_districts = f"""
    [out:json][timeout:60];
    (
      relation["admin_level"="4"]["name:en"="Hanoi"];
      relation["admin_level"="6"]({HANOI_BBOX_FULL});
    );
    out tags bb;
    """
    
    # Step 2: Wards (larger query, separate)
    query_wards = f"""
    [out:json][timeout:90];
    relation["admin_level"="8"]({HANOI_BBOX_FULL});
    out tags bb;
    """
    
    # Fetch districts first (small, fast)
    elements = []
    
    data1 = query_overpass(query_districts, "Thành phố + Quận/Huyện")
    if data1:
        elements.extend(data1.get("elements", []))
    
    time.sleep(QUERY_DELAY)
    
    # Then fetch wards
    data2 = query_overpass(query_wards, "Phường/Xã")
    if data2:
        elements.extend(data2.get("elements", []))
    
    if not elements:
        print("  ❌ Không thể lấy dữ liệu ranh giới hành chính")
        return 0
    
    print(f"  📊 Tổng: {len(elements)} ranh giới")
    
    if dry_run:
        print(f"  [DRY RUN] Sẽ import {len(elements)} ranh giới")
        for el in elements[:10]:
            tags = el.get("tags", {})
            print(f"    - {tags.get('name', 'N/A')} (level {tags.get('admin_level', '?')})")
        if len(elements) > 10:
            print(f"    ... và {len(elements) - 10} mục khác")
        return len(elements)
    
    count = 0
    async with engine.begin() as conn:
        for el in elements:
            osm_id = el.get("id")
            tags = el.get("tags", {})
            bounds = el.get("bounds", {})
            
            name = tags.get("name") or tags.get("name:vi") or "Không tên"
            name_en = tags.get("name:en")
            admin_level = int(tags.get("admin_level", 6))
            population = None
            if tags.get("population"):
                try:
                    population = int(tags["population"])
                except (ValueError, TypeError):
                    pass
            
            # Create bounding box polygon as geometry
            if bounds:
                min_lat = bounds.get("minlat", 0)
                min_lon = bounds.get("minlon", 0)
                max_lat = bounds.get("maxlat", 0)
                max_lon = bounds.get("maxlon", 0)
                wkt = (
                    f"POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, "
                    f"{max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))"
                )
            else:
                # Skip elements without bounds
                continue
            
            try:
                await conn.execute(text("""
                    INSERT INTO administrative_boundaries 
                        (osm_id, osm_type, name, name_en, admin_level, geometry, tags, population)
                    VALUES 
                        (:osm_id, 'relation', :name, :name_en, :admin_level, 
                         ST_GeomFromText(:wkt, 4326), CAST(:tags AS jsonb), :population)
                    ON CONFLICT (osm_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        name_en = EXCLUDED.name_en,
                        admin_level = EXCLUDED.admin_level,
                        geometry = EXCLUDED.geometry,
                        tags = EXCLUDED.tags,
                        population = EXCLUDED.population,
                        updated_at = NOW();
                """), {
                    "osm_id": osm_id,
                    "name": name,
                    "name_en": name_en,
                    "admin_level": admin_level,
                    "wkt": wkt,
                    "tags": json.dumps(tags),
                    "population": population,
                })
                count += 1
                
                if count % 50 == 0:
                    print(f"  ... Đã xử lý {count}/{len(elements)} ranh giới")
                    
            except Exception as e:
                print(f"  ⚠️ Lỗi insert {name}: {e}")
    
    # Print summary by admin level
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT admin_level, COUNT(*) 
            FROM administrative_boundaries 
            GROUP BY admin_level 
            ORDER BY admin_level;
        """))
        rows = result.fetchall()
        level_names = {4: "Thành phố", 5: "Tỉnh", 6: "Quận/Huyện", 7: "Xã cũ", 8: "Phường/Xã"}
        print(f"\n  📊 Tổng kết ranh giới hành chính:")
        for row in rows:
            level_name = level_names.get(row[0], f"Level {row[0]}")
            print(f"    Level {row[0]} ({level_name}): {row[1]} bản ghi")
    
    print(f"\n  ✅ Đã import {count} ranh giới hành chính")
    return count


# ============================================================================
# LAYER 2: STREETS
# ============================================================================

async def import_streets(engine: AsyncEngine, dry_run: bool = False) -> int:
    """
    Import đường phố có tên trong Hà Nội.
    Chỉ lấy primary, secondary, tertiary, residential có tên.
    """
    print("\n" + "─" * 70)
    print("🛣️  LAYER 2: ĐƯỜNG PHỐ")
    print("─" * 70)
    
    # Query streets with names using bbox (more reliable than area)
    road_types = [
        ("primary,primary_link,trunk,trunk_link,motorway,motorway_link", "Đường chính", HANOI_BBOX_FULL),
        ("secondary,secondary_link", "Đường phụ", HANOI_BBOX_EXTENDED),
        ("tertiary,tertiary_link", "Đường cấp 3", HANOI_BBOX),
        ("residential,living_street", "Đường nội khu", HANOI_BBOX),
    ]
    
    all_elements = []
    
    for highway_values, desc, bbox in road_types:
        # Build filter for multiple highway values using bbox
        filters = []
        for hv in highway_values.split(","):
            filters.append(f'way["highway"="{hv}"]["name"]({bbox});')
        
        query = f"""
        [out:json][timeout:90];
        (
          {" ".join(filters)}
        );
        out body geom;
        """
        
        data = query_overpass(query, desc)
        if data:
            new_elements = data.get("elements", [])
            all_elements.extend(new_elements)
            print(f"    → {desc}: {len(new_elements)} đường")
        
        # Rate limit
        time.sleep(QUERY_DELAY)
    
    print(f"\n  📊 Tổng cộng: {len(all_elements)} đường phố")
    
    if dry_run:
        print(f"  [DRY RUN] Sẽ import {len(all_elements)} đường")
        return len(all_elements)
    
    count = 0
    skipped = 0
    async with engine.begin() as conn:
        for el in all_elements:
            osm_id = el.get("id")
            tags = el.get("tags", {})
            geometry_nodes = el.get("geometry", [])
            
            name = tags.get("name") or tags.get("name:vi")
            if not name:
                skipped += 1
                continue
            
            name_en = tags.get("name:en")
            highway_type = tags.get("highway", "unclassified")
            surface = tags.get("surface")
            lanes = None
            if tags.get("lanes"):
                try:
                    lanes = int(tags["lanes"])
                except (ValueError, TypeError):
                    pass
            maxspeed = None
            if tags.get("maxspeed") and tags.get("maxspeed", "").isdigit():
                maxspeed = int(tags["maxspeed"])
            oneway = tags.get("oneway") == "yes"
            
            # Build LineString WKT from geometry nodes
            if not geometry_nodes or len(geometry_nodes) < 2:
                skipped += 1
                continue
            
            coords = [f"{node['lon']} {node['lat']}" for node in geometry_nodes 
                      if 'lon' in node and 'lat' in node]
            if len(coords) < 2:
                skipped += 1
                continue
                
            wkt = f"LINESTRING({', '.join(coords)})"
            
            # Approximate length in meters
            # Using simple Euclidean approximation
            total_length = 0.0
            for i in range(len(geometry_nodes) - 1):
                if 'lat' not in geometry_nodes[i] or 'lat' not in geometry_nodes[i+1]:
                    continue
                dlat = (geometry_nodes[i+1]['lat'] - geometry_nodes[i]['lat']) * 111320
                dlon = (geometry_nodes[i+1]['lon'] - geometry_nodes[i]['lon']) * 111320 * 0.85  # cos(21°)
                total_length += (dlat**2 + dlon**2) ** 0.5
            
            try:
                await conn.execute(text("""
                    INSERT INTO streets 
                        (osm_id, osm_type, name, name_en, highway_type, surface, 
                         lanes, maxspeed, oneway, geometry, length, tags)
                    VALUES 
                        (:osm_id, 'way', :name, :name_en, :highway_type, :surface,
                         :lanes, :maxspeed, :oneway, ST_GeomFromText(:wkt, 4326), :length, CAST(:tags AS jsonb))
                    ON CONFLICT (osm_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        name_en = EXCLUDED.name_en,
                        highway_type = EXCLUDED.highway_type,
                        surface = EXCLUDED.surface,
                        lanes = EXCLUDED.lanes,
                        maxspeed = EXCLUDED.maxspeed,
                        oneway = EXCLUDED.oneway,
                        geometry = EXCLUDED.geometry,
                        length = EXCLUDED.length,
                        tags = EXCLUDED.tags,
                        updated_at = NOW();
                """), {
                    "osm_id": osm_id,
                    "name": name,
                    "name_en": name_en,
                    "highway_type": highway_type,
                    "surface": surface,
                    "lanes": lanes,
                    "maxspeed": maxspeed,
                    "oneway": oneway,
                    "wkt": wkt,
                    "length": round(total_length, 2),
                    "tags": json.dumps(tags),
                })
                count += 1
                
                if count % 500 == 0:
                    print(f"  ... Đã xử lý {count} đường phố")
                    
            except Exception as e:
                skipped += 1
                if "invalid" in str(e).lower() or "geometry" in str(e).lower():
                    pass  # Skip invalid geometries silently
                else:
                    print(f"  ⚠️ Lỗi insert đường '{name}': {e}")
    
    # Print summary by type
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT highway_type, COUNT(*) 
            FROM streets 
            GROUP BY highway_type 
            ORDER BY COUNT(*) DESC;
        """))
        rows = result.fetchall()
        print(f"\n  📊 Phân loại đường phố:")
        for row in rows:
            print(f"    {row[0]}: {row[1]} đường")
    
    print(f"\n  ✅ Đã import {count} đường phố (bỏ qua {skipped})")
    return count


# ============================================================================
# LAYER 3: BUILDINGS
# ============================================================================

async def import_buildings(engine: AsyncEngine, dry_run: bool = False) -> int:
    """
    Import tòa nhà có tên trong Hà Nội.
    Chỉ lấy tòa nhà có tên hoặc type đặc biệt.
    """
    print("\n" + "─" * 70)
    print("🏢  LAYER 3: TÒA NHÀ")
    print("─" * 70)
    
    # Query named buildings using bbox (more reliable)
    query = f"""
    [out:json][timeout:90];
    (
      way["building"]["name"]({HANOI_BBOX_EXTENDED});
      way["building"="hospital"]({HANOI_BBOX_EXTENDED});
      way["building"="school"]({HANOI_BBOX_EXTENDED});
      way["building"="university"]({HANOI_BBOX_EXTENDED});
      way["building"="government"]({HANOI_BBOX_EXTENDED});
      way["building"="church"]({HANOI_BBOX_EXTENDED});
      way["building"="temple"]({HANOI_BBOX_EXTENDED});
      way["building"="commercial"]({HANOI_BBOX_EXTENDED});
      way["building"="office"]({HANOI_BBOX_EXTENDED});
    );
    out body geom;
    """
    
    data = query_overpass(query, "Tòa nhà")
    if not data:
        print("  ❌ Không thể lấy dữ liệu tòa nhà")
        return 0
    
    elements = data.get("elements", [])
    
    if dry_run:
        print(f"  [DRY RUN] Sẽ import {len(elements)} tòa nhà")
        return len(elements)
    
    count = 0
    skipped = 0
    seen_osm_ids = set()
    
    async with engine.begin() as conn:
        for el in elements:
            osm_id = el.get("id")
            
            # Deduplicate (same building may appear from multiple queries)
            if osm_id in seen_osm_ids:
                continue
            seen_osm_ids.add(osm_id)
            
            tags = el.get("tags", {})
            geometry_nodes = el.get("geometry", [])
            
            name = tags.get("name") or tags.get("name:vi")
            building_type = tags.get("building", "yes")
            addr_street = tags.get("addr:street")
            addr_housenumber = tags.get("addr:housenumber")
            addr_district = tags.get("addr:district")
            
            levels = None
            if tags.get("building:levels"):
                try:
                    levels = int(tags["building:levels"])
                except (ValueError, TypeError):
                    pass
            
            height = None
            if tags.get("height"):
                try:
                    height = float(tags["height"].replace("m", "").strip())
                except (ValueError, TypeError):
                    pass
            
            # Build Polygon WKT from geometry nodes
            if not geometry_nodes or len(geometry_nodes) < 3:
                skipped += 1
                continue
            
            coords = [f"{node['lon']} {node['lat']}" for node in geometry_nodes 
                      if 'lon' in node and 'lat' in node]
            if len(coords) < 3:
                skipped += 1
                continue
            
            # Ensure polygon is closed
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            
            wkt = f"POLYGON(({', '.join(coords)}))"
            
            # Approximate area in square meters
            # Very rough: 1 degree ≈ 111,320m at equator
            lats = [n['lat'] for n in geometry_nodes if 'lat' in n]
            lons = [n['lon'] for n in geometry_nodes if 'lon' in n]
            if lats and lons:
                dlat = (max(lats) - min(lats)) * 111320
                dlon = (max(lons) - min(lons)) * 111320 * 0.85
                area = dlat * dlon
            else:
                area = 0
            
            try:
                await conn.execute(text("""
                    INSERT INTO buildings 
                        (osm_id, osm_type, name, building_type, addr_street, 
                         addr_housenumber, addr_district, levels, height, 
                         geometry, area, tags)
                    VALUES 
                        (:osm_id, 'way', :name, :building_type, :addr_street,
                         :addr_housenumber, :addr_district, :levels, :height,
                         ST_GeomFromText(:wkt, 4326), :area, CAST(:tags AS jsonb))
                    ON CONFLICT (osm_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        building_type = EXCLUDED.building_type,
                        addr_street = EXCLUDED.addr_street,
                        addr_housenumber = EXCLUDED.addr_housenumber,
                        addr_district = EXCLUDED.addr_district,
                        levels = EXCLUDED.levels,
                        height = EXCLUDED.height,
                        geometry = EXCLUDED.geometry,
                        area = EXCLUDED.area,
                        tags = EXCLUDED.tags,
                        updated_at = NOW();
                """), {
                    "osm_id": osm_id,
                    "name": name,
                    "building_type": building_type,
                    "addr_street": addr_street,
                    "addr_housenumber": addr_housenumber,
                    "addr_district": addr_district,
                    "levels": levels,
                    "height": height,
                    "wkt": wkt,
                    "area": round(area, 2),
                    "tags": json.dumps(tags),
                })
                count += 1
                
                if count % 500 == 0:
                    print(f"  ... Đã xử lý {count} tòa nhà")
                    
            except Exception as e:
                skipped += 1
                if "invalid" not in str(e).lower():
                    print(f"  ⚠️ Lỗi insert tòa nhà '{name}': {e}")
    
    # Print summary
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT building_type, COUNT(*) 
            FROM buildings 
            GROUP BY building_type 
            ORDER BY COUNT(*) DESC
            LIMIT 15;
        """))
        rows = result.fetchall()
        print(f"\n  📊 Phân loại tòa nhà (top 15):")
        for row in rows:
            print(f"    {row[0]}: {row[1]} tòa")
    
    print(f"\n  ✅ Đã import {count} tòa nhà (bỏ qua {skipped})")
    return count


# ============================================================================
# LAYER 4: POINTS OF INTEREST (POIs)
# ============================================================================

async def import_pois(engine: AsyncEngine, dry_run: bool = False) -> int:
    """
    Import các điểm quan trọng (POI) trong Hà Nội.
    Bao gồm 35 danh mục từ OSM.
    """
    print("\n" + "─" * 70)
    print("📍  LAYER 4: ĐIỂM QUAN TRỌNG (POIs)")
    print("─" * 70)
    
    # Group POI categories into batches to avoid Overpass timeout
    # Each batch queries ~8-10 categories
    batch_size = 8
    batches = []
    for i in range(0, len(POI_CATEGORIES), batch_size):
        batches.append(POI_CATEGORIES[i:i + batch_size])
    
    all_elements = []
    category_map = {}  # osm_id -> (category, subcategory)
    
    for batch_idx, batch in enumerate(batches):
        print(f"\n  📦 Batch {batch_idx + 1}/{len(batches)}: ", end="")
        print(", ".join([sub for _, sub, _, _ in batch]))
        
        # Build query for this batch using bbox
        parts = []
        for key, val, _, _ in batch:
            parts.append(f'node["{key}"="{val}"]({HANOI_BBOX_EXTENDED});')
            parts.append(f'way["{key}"="{val}"]({HANOI_BBOX_EXTENDED});')
        
        query = f"""
        [out:json][timeout:90];
        (
          {" ".join(parts)}
        );
        out center tags;
        """
        
        data = query_overpass(query, f"POI batch {batch_idx + 1}")
        if data:
            new_elements = data.get("elements", [])
            
            # Map each element to its category
            for el in new_elements:
                el_tags = el.get("tags", {})
                for key, val, cat, sub in batch:
                    if el_tags.get(key) == val:
                        category_map[el["id"]] = (cat, sub)
                        break
            
            all_elements.extend(new_elements)
        
        # Rate limit between batches
        if batch_idx < len(batches) - 1:
            print(f"  ⏳ Đợi {QUERY_DELAY}s...")
            time.sleep(QUERY_DELAY)
    
    print(f"\n  📊 Tổng cộng: {len(all_elements)} POI")
    
    if dry_run:
        print(f"  [DRY RUN] Sẽ import {len(all_elements)} POI")
        return len(all_elements)
    
    count = 0
    skipped = 0
    seen_osm_ids = set()
    
    async with engine.begin() as conn:
        for el in all_elements:
            osm_id = el.get("id")
            
            # Deduplicate
            if osm_id in seen_osm_ids:
                continue
            seen_osm_ids.add(osm_id)
            
            tags = el.get("tags", {})
            
            # Get coordinates (node has lat/lon, way has center)
            lat = el.get("lat") or (el.get("center", {}) or {}).get("lat")
            lon = el.get("lon") or (el.get("center", {}) or {}).get("lon")
            if lat is None or lon is None:
                skipped += 1
                continue
            
            # Get category from map
            cat, sub = category_map.get(osm_id, ("amenity", "other"))
            
            name = tags.get("name") or tags.get("name:vi") or tags.get("name:en")
            if not name:
                # Generate a reasonable name for unnamed POIs
                type_names = {
                    "atm": "ATM", "bank": "Ngân hàng", "restaurant": "Nhà hàng",
                    "cafe": "Quán cà phê", "hospital": "Bệnh viện", "school": "Trường học",
                    "pharmacy": "Nhà thuốc", "hotel": "Khách sạn", "park": "Công viên",
                    "supermarket": "Siêu thị", "fuel": "Trạm xăng", "parking": "Bãi đỗ xe",
                    "clinic": "Phòng khám", "police": "Công an", "post_office": "Bưu điện",
                    "library": "Thư viện", "convenience": "Cửa hàng tiện lợi",
                    "marketplace": "Chợ", "fast_food": "Đồ ăn nhanh",
                    "place_of_worship": "Đền/Chùa", "kindergarten": "Trường mầm non",
                    "university": "Đại học", "fire_station": "PCCC",
                }
                name = type_names.get(sub, sub.replace("_", " ").title())
            
            name_en = tags.get("name:en")
            
            # Address
            addr_house = tags.get("addr:housenumber", "")
            addr_street = tags.get("addr:street", "")
            address = f"{addr_house} {addr_street}".strip() or tags.get("addr:full") or tags.get("address")
            
            # Contact info
            phone = tags.get("phone") or tags.get("contact:phone")
            website = tags.get("website") or tags.get("contact:website")
            email = tags.get("email") or tags.get("contact:email")
            opening_hours = tags.get("opening_hours")
            
            wkt = f"POINT({lon} {lat})"
            
            try:
                await conn.execute(text("""
                    INSERT INTO pois 
                        (osm_id, osm_type, name, name_en, category, subcategory,
                         phone, website, email, address, location, tags, opening_hours)
                    VALUES 
                        (:osm_id, :osm_type, :name, :name_en, :cat, :sub,
                         :phone, :website, :email, :address, 
                         ST_GeomFromText(:wkt, 4326), CAST(:tags AS jsonb), :opening_hours)
                    ON CONFLICT (osm_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        name_en = EXCLUDED.name_en,
                        category = EXCLUDED.category,
                        subcategory = EXCLUDED.subcategory,
                        phone = EXCLUDED.phone,
                        website = EXCLUDED.website,
                        email = EXCLUDED.email,
                        address = EXCLUDED.address,
                        location = EXCLUDED.location,
                        tags = EXCLUDED.tags,
                        opening_hours = EXCLUDED.opening_hours,
                        updated_at = NOW();
                """), {
                    "osm_id": osm_id,
                    "osm_type": el.get("type", "node"),
                    "name": name,
                    "name_en": name_en,
                    "cat": cat,
                    "sub": sub,
                    "phone": phone,
                    "website": website,
                    "email": email,
                    "address": address,
                    "wkt": wkt,
                    "tags": json.dumps(tags),
                    "opening_hours": opening_hours,
                })
                count += 1
                
                if count % 500 == 0:
                    print(f"  ... Đã xử lý {count} POI")
                    
            except Exception as e:
                skipped += 1
                print(f"  ⚠️ Lỗi insert POI '{name}': {e}")
    
    # Print summary by category
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT category, subcategory, COUNT(*) 
            FROM pois 
            GROUP BY category, subcategory 
            ORDER BY COUNT(*) DESC;
        """))
        rows = result.fetchall()
        print(f"\n  📊 Phân loại POI:")
        for row in rows:
            print(f"    {row[0]}/{row[1]}: {row[2]} điểm")
    
    print(f"\n  ✅ Đã import {count} POI (bỏ qua {skipped})")
    return count


# ============================================================================
# MAIN
# ============================================================================

async def main():
    parser = argparse.ArgumentParser(
        description="Import dữ liệu thật Hà Nội từ OpenStreetMap"
    )
    parser.add_argument(
        "--only", 
        choices=["boundaries", "streets", "buildings", "pois"],
        help="Chỉ import một layer cụ thể"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Chỉ query, không insert vào database"
    )
    
    args = parser.parse_args()
    
    print_banner()
    
    if args.dry_run:
        print("\n⚠️  CHẾ ĐỘ DRY RUN - Không ghi dữ liệu vào database\n")
    
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    
    start_time = time.time()
    total = 0
    
    try:
        layers = {
            "boundaries": ("Ranh giới hành chính", import_admin_boundaries),
            "streets": ("Đường phố", import_streets),
            "buildings": ("Tòa nhà", import_buildings),
            "pois": ("POI", import_pois),
        }
        
        if args.only:
            # Import only specified layer
            name, func = layers[args.only]
            print(f"\n🎯 Chỉ import: {name}")
            count = await func(engine, args.dry_run)
            total += count
        else:
            # Import all layers
            for key, (name, func) in layers.items():
                try:
                    count = await func(engine, args.dry_run)
                    total += count
                except Exception as e:
                    print(f"\n❌ Lỗi khi import {name}: {e}")
                    traceback.print_exc()
                
                # Delay between layers
                if key != "pois":  # Don't delay after last layer
                    print(f"\n  ⏳ Đợi {QUERY_DELAY}s trước layer tiếp theo...")
                    time.sleep(QUERY_DELAY)
        
        elapsed = time.time() - start_time
        
        # Final summary
        print("\n" + "=" * 70)
        print("  🎉 HOÀN THÀNH IMPORT DỮ LIỆU THỰC TẾ HÀ NỘI")
        print("=" * 70)
        print(f"  Tổng bản ghi: {total:,}")
        print(f"  Thời gian: {elapsed:.1f}s ({elapsed/60:.1f} phút)")
        
        if not args.dry_run:
            # Show final counts from database
            async with engine.begin() as conn:
                result = await conn.execute(text("""
                    SELECT 'Ranh giới' as layer, COUNT(*) FROM administrative_boundaries
                    UNION ALL
                    SELECT 'Đường phố', COUNT(*) FROM streets
                    UNION ALL
                    SELECT 'Tòa nhà', COUNT(*) FROM buildings
                    UNION ALL
                    SELECT 'POI', COUNT(*) FROM pois;
                """))
                rows = result.fetchall()
                print(f"\n  📊 Tổng trong database:")
                grand_total = 0
                for row in rows:
                    print(f"    {row[0]}: {row[1]:,} bản ghi")
                    grand_total += row[1]
                print(f"    ─────────────────────")
                print(f"    TỔNG: {grand_total:,} bản ghi")
        
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Lỗi nghiêm trọng: {e}")
        traceback.print_exc()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
