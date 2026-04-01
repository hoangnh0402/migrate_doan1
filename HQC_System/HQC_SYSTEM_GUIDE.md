# Hướng dẫn Quản trị và Cấu hình Hệ thống HQC System (Hà Nội)

Tài liệu này hướng dẫn cách cấu hình, vận hành và thu thập dữ liệu (Địa lý, Thời tiết, AQI, Giao thông) cho hệ thành phố thông minh HQC System.

## 1. Dữ liệu Địa lý và OpenStreetMap (OSM)

Hệ thống sử dụng dữ liệu OSM để hiển thị ranh giới hành chính (phường/xã), đường phố, tòa nhà và các điểm quan tâm (POI).

### Cách lấy dữ liệu đầy đủ cho Hà Nội (Offline):
1.  **Tải dữ liệu thô:** Truy cập [Geofabrik Vietnam](https://download.geofabrik.de/asia/vietnam.html) và tải file `vietnam-latest.osm.pbf`.
2.  **Cài đặt công cụ:** Chạy lệnh sau bên trong container backend để cài đặt bộ giải mã:
    ```bash
    apt-get update && apt-get install osmium-tool
    ```
3.  **Import dữ liệu:** Chạy script có sẵn để đổ dữ liệu Hà Nội vào Postgres/PostGIS:
    ```bash
    python scripts/import_osm.py --file /app/data/osm/vietnam-latest.osm.pbf --area hanoi
    ```

### Cách lấy ranh giới hành chính nhanh (Online):
Tôi đã tạo một script mới giúp lấy dữ liệu ranh giới (admin boundaries) của Hà Nội trực tiếp qua internet (qua Overpass API) mà không cần file PBF:
```bash
python scripts/sync_hanoi_osm_overpass.py
```

---

## 2. Dữ liệu Thời gian thực (Real-time IoT)

Để các module "Sức khỏe đô thị" và "Phân tích thông minh" có dữ liệu thực tế từ các trạm quan trắc của Hà Nội, bạn cần cấu hình các API Key trong file `.env`:

| Chỉ số | Nguồn API | Website đăng ký |
| :--- | :--- | :--- |
| **Chất lượng không khí (AQI)** | AQICN | [aqicn.org/api/](https://aqicn.org/api/) |
| **Thời tiết (Weather)** | OpenWeatherMap | [openweathermap.org](https://openweathermap.org/api) |
| **Giao thông (Traffic)** | TomTom Traffic | [developer.tomtom.com](https://developer.tomtom.com/) |
| **AI Phân tích** | Gemini AI | [aistudio.google.com](https://aistudio.google.com/) |

> **Lưu ý:** Sau khi có API Key, hãy điền vào các biến `OPENWEATHER_API_KEY`, `TOMTOM_API_KEY`, `AQICN_API_TOKEN` và `GEMINI_API_KEY` trong file `.env` của thư mục `backend` và `web-dashboard`.

---

## 3. Các Script Seed dữ liệu (Dành cho Demo)

Nếu bạn chưa có API Key nhưng muốn hiển thị đầy đủ tính năng của Dashboard để Demo, hãy chạy các script sau (theo thứ tự):

```bash
# 1. Khởi tạo cơ sở dữ liệu địa lý mẫu (Đã chạy)
python scripts/seed_geographic_stub.py

# 2. Đổ dữ liệu môi trường chuẩn FIWARE NGSI-LD
python scripts/seed_fiware_data.py

# 3. Đổ dữ liệu báo cáo sự cố hạ tầng từ người dân (Reports)
python scripts/seed_reports.py

# 4. Đổ dữ liệu Demo môi trường chuyên sâu (mô phỏng sensor)
python scripts/seed_demo_environmental.py
```

---

## 4. Tài khoản Đăng nhập Hệ thống (Admin)

Tài khoản mặc định để truy cập vào Dashboard Quản trị:
*   **URL:** `http://localhost:3000`
*   **Email:** `admin@hqcsystem.com`
*   **Mật khẩu:** `Admin@2025`

---

## 5. Xử lý lỗi thường gặp

*   **Lỗi 401 Unauthorized:** Hãy đảm bảo bạn đã đăng nhập và Token còn hiệu lực.
*   **Bản đồ trống:** Kiểm tra xem layer PostgreSQL đã được seed dữ liệu chưa (Chạy `seed_geographic_stub.py`).
*   **AI không phân tích:** Nếu chưa có key Gemini, hệ thống sẽ sử dụng cơ chế **Mock Fallback** (Dữ liệu mô phỏng tiếng Việt chất lượng cao) mà tôi đã thiết lập để không gây lỗi Dashboard.

---
*© 2025 HQC System - Nền tảng Thành phố thông minh hiện đại.*
