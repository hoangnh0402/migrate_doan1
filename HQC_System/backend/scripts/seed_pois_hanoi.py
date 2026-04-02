#!/usr/bin/env python3
import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

POIS = [
    # --- ATM & BANKS (Tài chính) ---
    (3101, "Vietcombank ATM - Ngã Tư Sở", "amenity", "atm", "229 Tây Sơn, Đống Đa", 105.8198, 21.0035),
    (3102, "BIDV ATM - Royal City", "amenity", "atm", "72A Nguyễn Trãi, Thanh Xuân", 105.8155, 21.0005),
    (3103, "Techcombank - Chi nhánh Sở Giao dịch", "amenity", "bank", "191 Bà Triệu, Hai Bà Trưng", 105.8495, 21.0115),
    (3104, "VietinBank - Trụ sở chính", "amenity", "bank", "108 Trần Hưng Đạo, Hoàn Kiếm", 105.8475, 21.0225),
    (3105, "TPBank ATM - Láng Hạ", "amenity", "atm", "57 Láng Hạ, Ba Đình", 105.8145, 21.0155),
    (3106, "Agribank ATM - Cầu Giấy", "amenity", "atm", "2 Chùa Hà, Cầu Giấy", 105.7955, 21.0355),
    (3107, "Sacombank - Chi nhánh Hà Nội", "amenity", "bank", "88 Lý Thường Kiệt, Hoàn Kiếm", 105.8455, 21.0245),
    
    # --- RESTAURANTS & CAFES (Ẩm thực) ---
    (3201, "Highlands Coffee - Cột Cờ", "amenity", "cafe", "28A Điện Biên Phủ, Ba Đình", 105.8395, 21.0335),
    (3202, "Phúc Long Coffee & Tea - IPH", "amenity", "cafe", "241 Xuân Thủy, Cầu Giấy", 105.7825, 21.0365),
    (3203, "Quán Ăn Ngon - Phan Bội Châu", "amenity", "restaurant", "18 Phan Bội Châu, Hoàn Kiếm", 105.8435, 21.0255),
    (3204, "Pizza 4P's - Phan Kế Bính", "amenity", "restaurant", "5 Phan Kế Bính, Ba Đình", 105.8125, 21.0345),
    (3205, "Cộng Cà Phê - Hồ Gươm", "amenity", "cafe", "116 Cầu Gỗ, Hoàn Kiếm", 105.8535, 21.0315),
    (3206, "Starbucks - Duy Tân", "amenity", "cafe", "Lô A1 Duy Tân, Cầu Giấy", 105.7845, 21.0295),
    (3207, "Nhà hàng Sen Tây Hồ", "amenity", "restaurant", "614 Lạc Long Quân, Tây Hồ", 105.8155, 21.0615),
    
    # --- HEALTHCARE (Y tế) ---
    (3301, "Bệnh viện Bạch Mai", "amenity", "hospital", "78 Giải Phóng, Phương Mai", 105.8415, 21.0005),
    (3302, "Bệnh viện Việt Đức", "amenity", "hospital", "40 Tràng Thi, Hoàn Kiếm", 105.8485, 21.0275),
    (3303, "Pharmacity - Nguyễn Trãi", "amenity", "pharmacy", "544 Nguyễn Trãi, Thanh Xuân", 105.7985, 20.9855),
    (3304, "Bệnh viện Đa khoa Hồng Ngọc", "amenity", "hospital", "55 Yên Ninh, Ba Đình", 105.8425, 21.0425),
    (3305, "Long Châu Pharmacy - Cầu Giấy", "amenity", "pharmacy", "121 Cầu Giấy", 105.7955, 21.0315),
    
    # --- SHOPPING (Mua sắm) ---
    (3401, "Vincom Center Bà Triệu", "shop", "mall", "191 Bà Triệu, Hai Bà Trưng", 105.8495, 21.0115),
    (3402, "Lotte Center Hanoi", "shop", "mall", "54 Liễu Giai, Ba Đình", 105.8125, 21.0325),
    (3403, "Big C Thăng Long", "shop", "supermarket", "222 Trần Duy Hưng, Cầu Giấy", 105.7905, 21.0065),
    (3404, "WinMart - Royal City", "shop", "supermarket", "72A Nguyễn Trãi, Thanh Xuân", 105.8155, 21.0005),
    (3405, "Tràng Tiền Plaza", "shop", "mall", "24 Hai Bà Trưng, Hoàn Kiếm", 105.8525, 21.0255),
    
    # --- TOURISM & LEISURE (Du lịch & Giải trí) ---
    (3501, "Sofitel Legend Metropole Hanoi", "tourism", "hotel", "15 Ngô Quyền, Hoàn Kiếm", 105.8555, 21.0255),
    (3502, "Văn Miếu - Quốc Tử Giám", "tourism", "attraction", "58 Quốc Tử Giám, Đống Đa", 105.8355, 21.0285),
    (3503, "Công viên Thống Nhất", "leisure", "park", "Trần Nhân Tông, Hai Bà Trưng", 105.8455, 21.0145),
    (3504, "Công viên Thủ Lệ", "leisure", "park", "Đường Bưởi, Ba Đình", 105.8105, 21.0315),
    (3505, "Bảo tàng Dân tộc học Việt Nam", "tourism", "attraction", "Nguyễn Văn Huyên, Cầu Giấy", 105.7985, 21.0405),
]

# Thêm một số điểm ngẫu nhiên quanh Ngã Tư Sở để Demo dầy đặc hơn
center_nts = (21.0032, 105.8201)
for i in range(20):
    idx = 3600 + i
    cat = "amenity"
    sub = "restaurant" if i % 2 == 0 else "cafe"
    name = f"{'Nhà hàng' if i % 2 == 0 else 'Quán'} Demo {i+1}"
    lon = center_nts[1] + (i % 5 - 2) * 0.002
    lat = center_nts[0] + (i // 5 - 2) * 0.002
    POIS.append((idx, name, cat, sub, "Gần Ngã Tư Sở, Đống Đa", lon, lat))

async def seed_pois_hanoi():
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    
    async with engine.begin() as conn:
        print(f"🚀 Seeding {len(POIS)} POIs in Hanoi...")
        
        for p in POIS:
            osm_id, name, cat, sub, addr, lon, lat = p
            await conn.execute(text(f"""
                INSERT INTO pois (osm_id, osm_type, name, category, subcategory, address, location)
                VALUES ({osm_id}, 'node', :name, :cat, :sub, :addr, ST_GeomFromText('POINT({lon} {lat})', 4326))
                ON CONFLICT (osm_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    category = EXCLUDED.category,
                    subcategory = EXCLUDED.subcategory,
                    address = EXCLUDED.address,
                    location = EXCLUDED.location;
            """), {"name": name, "cat": cat, "sub": sub, "addr": addr})
            
        print(f"  ✓ Seeded {len(POIS)} POIs successfully.")
        
    await engine.dispose()
    print("✅ POI seeding completed!")

if __name__ == "__main__":
    import traceback
    try:
        asyncio.run(seed_pois_hanoi())
    except Exception:
        traceback.print_exc()
