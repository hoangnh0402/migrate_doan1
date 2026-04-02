#!/usr/bin/env python3
import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

# Base coordinates for Ngã Tư Sở (Default demo location)
CENTER_NTS = (21.0032, 105.8201)

# POI categories from the mobile app
CATEGORIES = [
    ("amenity", "atm", "ATM Demo"),
    ("amenity", "bank", "Ngân hàng Demo"),
    ("amenity", "restaurant", "Nhà hàng Demo"),
    ("amenity", "cafe", "Quán Cafe Demo"),
    ("amenity", "pharmacy", "Hiệu thuốc Demo"),
    ("amenity", "hospital", "Bệnh viện Demo"),
    ("amenity", "clinic", "Phòng khám Demo"),
    ("shop", "supermarket", "Siêu thị Demo"),
    ("shop", "mall", "Trung tâm thương mại Demo"),
    ("shop", "shop", "Cửa hàng Demo"),
    ("tourism", "hotel", "Khách sạn Demo"),
    ("tourism", "attraction", "Điểm tham quan Demo"),
    ("leisure", "park", "Công viên Demo"),
]

async def seed_pois_hanoi_dense():
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    
    async with engine.begin() as conn:
        print(f"🚀 Seeding DENSE POIs around Ngã Tư Sở...")
        
        count = 0
        for i, (cat, sub, name_prefix) in enumerate(CATEGORIES):
            # Tạo 5 điểm cho mỗi category trong bán kính ~1.5km
            for j in range(5):
                idx = 5000 + i * 10 + j
                name = f"{name_prefix} {j+1}"
                # Độ lệch tọa độ (khoảng 0.01 độ ~ 1.1km)
                # Sử dụng các offset khác nhau để tránh trùng lặp
                lon_offset = ((j % 3) - 1) * 0.005 + (i % 2) * 0.002
                lat_offset = ((j // 3) - 1) * 0.005 + (i // 3) * 0.002
                
                lon = CENTER_NTS[1] + lon_offset
                lat = CENTER_NTS[0] + lat_offset
                addr = f"Khu vực Ngã Tư Sở, Đống Đa/Thanh Xuân, Hà Nội"
                
                await conn.execute(text(f"""
                    INSERT INTO pois (osm_id, osm_type, name, category, subcategory, address, location)
                    VALUES ({idx}, 'node', :name, :cat, :sub, :addr, ST_GeomFromText('POINT({lon} {lat})', 4326))
                    ON CONFLICT (osm_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        category = EXCLUDED.category,
                        subcategory = EXCLUDED.subcategory,
                        address = EXCLUDED.address,
                        location = EXCLUDED.location;
                """), {"name": name, "cat": cat, "sub": sub, "addr": addr})
                count += 1
            
        print(f"  ✓ Seeded {count} dense POIs successfully.")
        
    await engine.dispose()
    print("✅ Dense POI seeding completed!")

if __name__ == "__main__":
    import traceback
    try:
        asyncio.run(seed_pois_hanoi_dense())
    except Exception:
        traceback.print_exc()
