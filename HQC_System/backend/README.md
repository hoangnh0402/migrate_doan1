<p align="center">
  <img src="../docs/assets/HQC System-logo.png" alt="HQC System Logo" width="120">
</p>

<h1 align="center">HQC System Backend</h1>

<p align="center">
  <strong>REST API vÃ  NGSI-LD cho Smart City Platform</strong>
</p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License: GPL v3">
  </a>
  <img src="https://img.shields.io/badge/Python-3.11+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.109-green.svg" alt="FastAPI">
</p>

---

## Video HÆ°á»›ng dáº«n

<div align="center">

[![HQC System Backend Setup Guide](https://img.youtube.com/vi/n725hlexIL8/maxresdefault.jpg)](https://www.youtube.com/watch?v=n725hlexIL8)

**[â–¶Xem video hÆ°á»›ng dáº«n cháº¡y Backend](https://www.youtube.com/watch?v=n725hlexIL8)**

</div>

---

## Quick Start vá»›i Docker

CÃ¡ch nhanh nháº¥t Ä‘á»ƒ cháº¡y HQC System Backend:

```bash
# Clone repository
git clone https://github.com/PKA-Open-Dynamics/HQC System.git
cd HQC System/backend

# Cháº¡y 1 lá»‡nh duy nháº¥t
./start.sh
```

Script sáº½ tá»± Ä‘á»™ng:
- âœ… Táº¡o file .env tá»« template
- âœ… Build Docker image
- âœ… Khá»Ÿi Ä‘á»™ng PostgreSQL vÃ  Redis
- âœ… Khá»Ÿi Ä‘á»™ng Backend API

Truy cáº­p API sau khi khá»Ÿi Ä‘á»™ng:
- **API Documentation**: http://localhost:8000/docs
- **API Endpoint**: http://localhost:8000/api/v1
- **Health Check**: http://localhost:8000/health

### Import database (487,000+ OSM entities)

Sau khi backend cháº¡y, xem hÆ°á»›ng dáº«n import dá»¯ liá»‡u:

```bash
# Xem hÆ°á»›ng dáº«n chi tiáº¿t
cat DATABASE_IMPORT.md

# Hoáº·c import trá»±c tiáº¿p (náº¿u cÃ³ file dump)
docker exec -i HQC System-postgres psql -U HQC System -d HQC System_db < HQC System_dump.sql
```

### Dá»«ng services

```bash
docker-compose down        # Dá»«ng nhÆ°ng giá»¯ data
docker-compose down -v     # Dá»«ng vÃ  xÃ³a táº¥t cáº£ data
```

---

## Tong quan

HQC System Backend cung cáº¥p REST API vÃ  NGSI-LD API cho:
- Quáº£n lÃ½ bÃ¡o cÃ¡o tá»« ngÆ°á»i dÃ¢n (citizen reports)
- Dá»¯ liá»‡u Ä‘á»‹a lÃ½ tá»« OpenStreetMap (boundaries, streets, POIs)
- TÃ­ch há»£p dá»¯ liá»‡u thá»i gian thá»±c (weather, AQI, traffic)
- API chuáº©n NGSI-LD theo ETSI specification

## CÃ´ng nghá»‡

| ThÃ nh pháº§n | CÃ´ng nghá»‡ | PhiÃªn báº£n |
|------------|-----------|-----------|
| Framework | FastAPI | 0.109.0 |
| Database | PostgreSQL + PostGIS | 15+ |
| ORM | SQLAlchemy + GeoAlchemy2 | 2.0.25 |
| Cache | Redis | 7+ |
| Document Store | MongoDB | 7+ (tÃ¹y chá»n) |
| API Standards | REST, NGSI-LD | v1 |

## CÃ i Ä‘áº·t tá»« mÃ£ nguá»“n (Development)

### YÃªu cáº§u há»‡ thá»‘ng

- Python 3.11 trá»Ÿ lÃªn
- PostgreSQL 15+ vá»›i extension PostGIS
- Redis 7+ (tÃ¹y chá»n, cho caching)
- MongoDB 7+ (tÃ¹y chá»n, cho real-time events)

### CÃ i Ä‘áº·t tá»± Ä‘á»™ng

```bash
chmod +x setup.sh
./setup.sh
```

### CÃ i Ä‘áº·t thá»§ cÃ´ng

**BÆ°á»›c 1: Clone repository**

```bash
git clone https://github.com/PKA-Open-Dynamics/HQC System.git
cd HQC System/backend
```

**BÆ°á»›c 2: Táº¡o virtual environment**

```bash
# Linux/macOS
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

**BÆ°á»›c 3: CÃ i Ä‘áº·t dependencies**

```bash
pip install -r requirements.txt
```

**BÆ°á»›c 4: Cáº¥u hÃ¬nh environment**

```bash
cp .env.example .env
# Chá»‰nh sá»­a .env vá»›i thÃ´ng tin database cá»§a báº¡n
```

**BÆ°á»›c 5: Khá»Ÿi táº¡o database**

```bash
# Táº¡o database PostgreSQL vá»›i PostGIS
createdb HQC System
psql -d HQC System -c "CREATE EXTENSION postgis;"

# Cháº¡y migrations
alembic upgrade head

# Seed dá»¯ liá»‡u máº«u (tÃ¹y chá»n)
python scripts/init_db.py
```

**BÆ°á»›c 6: Cháº¡y server**

```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Sau khi cháº¡y server, truy cáº­p:

| TÃ i liá»‡u | URL |
|----------|-----|
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| OpenAPI JSON | http://localhost:8000/openapi.json |

### API Endpoints

| Prefix | MÃ´ táº£ |
|--------|-------|
| `/api/v1/auth/` | XÃ¡c thá»±c (login, register) |
| `/api/v1/users/` | Quáº£n lÃ½ ngÆ°á»i dÃ¹ng |
| `/api/v1/reports/` | BÃ¡o cÃ¡o cÃ´ng dÃ¢n CRUD |
| `/api/v1/geographic/` | Dá»¯ liá»‡u Ä‘á»‹a lÃ½ (boundaries, streets) |
| `/api/v1/statistics/` | Analytics vÃ  thá»‘ng kÃª |
| `/ngsi-ld/v1/entities` | NGSI-LD entities |

## Cáº¥u trÃºc thÆ° má»¥c

```
backend/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ api/v1/          # API routes
â”‚   â”‚   â””â”€â”€ endpoints/   # Endpoint handlers
â”‚   â”œâ”€â”€ adapters/        # External API adapters
â”‚   â”œâ”€â”€ core/            # Config vÃ  security
â”‚   â”œâ”€â”€ db/              # Database connections
â”‚   â”œâ”€â”€ models/          # SQLAlchemy models
â”‚   â”œâ”€â”€ schemas/         # Pydantic schemas
â”‚   â””â”€â”€ services/        # Business logic
â”œâ”€â”€ alembic/             # Database migrations
â”œâ”€â”€ graphdb/             # LOD ontology
â”œâ”€â”€ scripts/             # Utility scripts
â”œâ”€â”€ setup.sh             # Script cÃ i Ä‘áº·t
â”œâ”€â”€ CHANGELOG.md         # Lá»‹ch sá»­ thay Ä‘á»•i
â”œâ”€â”€ CONTRIBUTING.md      # HÆ°á»›ng dáº«n Ä‘Ã³ng gÃ³p
â”œâ”€â”€ DEPENDENCIES.md      # ThÃ´ng tin thÆ° viá»‡n
â”œâ”€â”€ LICENSE              # GPL-3.0 License
â””â”€â”€ requirements.txt     # Python dependencies
```

## Testing

```bash
# Cháº¡y tests
pytest

# Vá»›i coverage
pytest --cov=app --cov-report=html
```

## ÄÃ³ng gÃ³p

Xem [CONTRIBUTING.md](CONTRIBUTING.md) Ä‘á»ƒ biáº¿t cÃ¡ch Ä‘Ã³ng gÃ³p cho dá»± Ã¡n.

## Giáº¥y phÃ©p

Dá»± Ã¡n nÃ y Ä‘Æ°á»£c phÃ¡t hÃ nh theo giáº¥y phÃ©p **GNU General Public License v3.0 (GPL-3.0)**.

```
Copyright (c) 2025 HQC System Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

Xem file [LICENSE](LICENSE) Ä‘á»ƒ biáº¿t chi tiáº¿t.

## TÃ i liá»‡u liÃªn quan

- [DEPENDENCIES.md](DEPENDENCIES.md) - Danh sÃ¡ch thÆ° viá»‡n
- [CHANGELOG.md](CHANGELOG.md) - Lá»‹ch sá»­ thay Ä‘á»•i
- [Main README](../README.md) - TÃ i liá»‡u dá»± Ã¡n chÃ­nh

