#!/usr/bin/env python3
import asyncio
import sys
import os
import requests
import json
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Các danh mục cần lấy và mapping sang category/subcategory của hệ thống
# Format: (OSM_Key, OSM_Value, System_Category, System_Subcategory)
POI_CONFIG = [
    ("amenity", "restaurant", "amenity", "restaurant"),
    ("amenity", "cafe", "amenity", "cafe"),
    ("amenity", "bank", "amenity", "bank"),
    ("amenity", "atm", "amenity", "atm"),
    ("amenity", "hospital", "amenity", "hospital"),
    ("amenity", "pharmacy", "amenity", "pharmacy"),
    ("amenity", "school", "amenity", "school"),
    ("shop", "supermarket", "shop", "supermarket"),
    ("shop", "mall", "shop", "mall"),
    ("tourism", "attraction", "tourism", "attraction"),
    ("tourism", "hotel", "tourism", "hotel"),
    ("leisure", "park", "leisure", "park"),
]

def build_overpass_query(bbox="20.95,105.75,21.10,105.90"):
    """
    Tạo truy vấn Overpass để lấy các POI trong khu vực Hà Nội bằng Bounding Box.
    bbox: minLat, minLon, maxLat, maxLon
    """
    parts = []
    for key, val, _, _ in POI_CONFIG:
        parts.append(f'node["{key}"="{val}"]({bbox});')
        parts.append(f'way["{key}"="{val}"]({bbox});')
        
    query = f"""
    [out:json][timeout:90];
    (
      {" ".join(parts)}
    );
    out center tags;
    """
    return query

async def sync_pois():
    print("🌍 Đang bắt đầu đồng bộ dữ liệu POI thực tế từ OpenStreetMap...")
    query = build_overpass_query()
    
    try:
        print("  → Gửi yêu cầu tới Overpass API (có thể mất 15-30s)...")
        response = requests.post(OVERPASS_URL, data={'data': query}, timeout=120)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"❌ Lỗi khi tải dữ liệu từ Overpass: {e}")
        return

    elements = data.get('elements', [])
    print(f"✓ Tìm thấy {len(elements)} địa điểm thực tế.")
    
    if not elements:
        print("⚠ Không tìm thấy dữ liệu nào.")
        return

    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    
    async with engine.begin() as conn:
        print(f"🚀 Đang đưa {len(elements)} địa điểm vào cơ sở dữ liệu...")
        
        count = 0
        for el in elements:
            osm_id = el.get('id')
            tags = el.get('tags', {})
            
            # Lấy tọa độ (node có lat/lon, way có center)
            lat = el.get('lat') or el.get('center', {}).get('lat')
            lon = el.get('lon') or el.get('center', {}).get('lon')
            if lat is None or lon is None: continue
            
            # Xác định category/subcategory dựa trên tags
            target_cat, target_sub = "amenity", "other"
            for key, val, cat, sub in POI_CONFIG:
                if tags.get(key) == val:
                    target_cat, target_sub = cat, sub
                    break
            
            name = tags.get('name') or tags.get('name:vi') or tags.get('name:en') or "Không tên"
            name_en = tags.get('name:en')
            
            # Xử lý địa chỉ đơn giản
            addr_house = tags.get('addr:housenumber', '')
            addr_street = tags.get('addr:street', '')
            address = f"{addr_house} {addr_street}".strip() or tags.get('address')
            
            # Phone & Contact
            phone = tags.get('phone') or tags.get('contact:phone')
            website = tags.get('website') or tags.get('contact:website')
            email = tags.get('email') or tags.get('contact:email')
            
            await conn.execute(text("""
                INSERT INTO pois (osm_id, osm_type, name, name_en, category, subcategory, address, phone, website, email, location, tags)
                VALUES (:osm_id, :osm_type, :name, :name_en, :cat, :sub, :addr, :phone, :website, :email, ST_GeomFromText(:wkt, 4326), :tags)
                ON CONFLICT (osm_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    name_en = EXCLUDED.name_en,
                    category = EXCLUDED.category,
                    subcategory = EXCLUDED.subcategory,
                    address = EXCLUDED.address,
                    location = EXCLUDED.location,
                    tags = EXCLUDED.tags;
            """), {
                "osm_id": osm_id,
                "osm_type": el.get('type', 'node'),
                "name": name,
                "name_en": name_en,
                "cat": target_cat,
                "sub": target_sub,
                "addr": address,
                "phone": phone,
                "website": website,
                "email": email,
                "wkt": f"POINT({lon} {lat})",
                "tags": json.dumps(tags)
            })
            count += 1
            if count % 100 == 0:
                print(f"  ... Đã xử lý {count}/{len(elements)} địa điểm")

        print(f"✅ Đồng bộ thành công {count} địa điểm thực tế.")
        
    await engine.dispose()
    print("=" * 60)
    print("HOÀN THÀNH: Hệ thống HQC System đã được cập nhật dữ liệu thật!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(sync_pois())
