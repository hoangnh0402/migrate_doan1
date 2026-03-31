# Lá»‹ch sá»­ thay Ä‘á»•i (Changelog)

Táº¥t cáº£ cÃ¡c thay Ä‘á»•i quan trá»ng cá»§a HQC System Backend Ä‘Æ°á»£c ghi láº¡i trong file nÃ y.

Äá»‹nh dáº¡ng dá»±a trÃªn [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
vÃ  dá»± Ã¡n tuÃ¢n theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [ChÆ°a phÃ¡t hÃ nh]

### Dá»± kiáº¿n
- Há»— trá»£ WebSocket cho thÃ´ng bÃ¡o thá»i gian thá»±c
- PhÃ¢n tÃ­ch nÃ¢ng cao vá»›i machine learning
- Há»— trá»£ Ä‘a ngÃ´n ngá»¯ (i18n)

## [1.0.1] - 2025-12-08

### TÃ i liá»‡u
- ThÃªm CHANGELOG.md vá»›i lá»‹ch sá»­ thay Ä‘á»•i chi tiáº¿t
- ThÃªm CONTRIBUTING.md vá»›i hÆ°á»›ng dáº«n Ä‘Ã³ng gÃ³p
- ThÃªm DEPENDENCIES.md vá»›i thÃ´ng tin licenses

### Cáº£i thiá»‡n
- Chuáº©n hÃ³a format tÃ i liá»‡u tiáº¿ng Viá»‡t
- Cáº­p nháº­t .gitignore

## [1.0.0] - 2025-12-07

### ThÃªm má»›i

#### TÃ­ch há»£p LOD (Linked Open Data)
- API NGSI-LD tuÃ¢n thá»§ chuáº©n ETSI
- Há»— trá»£ ontology SOSA/SSN cho dá»¯ liá»‡u cáº£m biáº¿n
- API dá»¯ liá»‡u Ä‘á»‹a lÃ½ vá»›i PostGIS
- TÃ­ch há»£p cÃ¡c nguá»“n LOD bÃªn ngoÃ i:
  - OpenWeatherMap (dá»¯ liá»‡u thá»i tiáº¿t)
  - AQICN (chá»‰ sá»‘ cháº¥t lÆ°á»£ng khÃ´ng khÃ­)
  - TomTom (lÆ°u lÆ°á»£ng giao thÃ´ng)
  - OpenStreetMap (ranh giá»›i Ä‘á»‹a lÃ½, POIs)

#### TÃ­nh nÄƒng chÃ­nh
- XÃ¡c thá»±c ngÆ°á»i dÃ¹ng vá»›i JWT tokens
- Há»‡ thá»‘ng quáº£n lÃ½ bÃ¡o cÃ¡o (CRUD)
- Quáº£n lÃ½ ranh giá»›i hÃ nh chÃ­nh (quáº­n, phÆ°á»ng)
- Dá»¯ liá»‡u Ä‘Æ°á»ng phá»‘ vÃ  tÃ²a nhÃ  tá»« OSM
- Endpoints tá»•ng há»£p dá»¯ liá»‡u thá»i gian thá»±c

#### CÆ¡ sá»Ÿ dá»¯ liá»‡u
- PostgreSQL 15+ vá»›i extension PostGIS
- SQLAlchemy 2.0 ORM vá»›i há»— trá»£ async
- Alembic migrations cho quáº£n lÃ½ schema
- Há»— trá»£ MongoDB cho sá»± kiá»‡n thá»i gian thá»±c
- Lá»›p cache Redis

#### API Endpoints
- `/api/v1/auth/` - XÃ¡c thá»±c
- `/api/v1/users/` - Quáº£n lÃ½ ngÆ°á»i dÃ¹ng
- `/api/v1/reports/` - BÃ¡o cÃ¡o cÃ´ng dÃ¢n
- `/api/v1/geographic/` - Dá»¯ liá»‡u Ä‘á»‹a lÃ½
- `/api/v1/statistics/` - Thá»‘ng kÃª
- `/ngsi-ld/v1/` - Entities tuÃ¢n thá»§ NGSI-LD

#### TÃ i liá»‡u
- TÃ i liá»‡u OpenAPI/Swagger
- TÃ i liá»‡u ReDoc
- README Ä‘áº§y Ä‘á»§
- DEPENDENCIES.md vá»›i thÃ´ng tin license
- HÆ°á»›ng dáº«n CONTRIBUTING

### Báº£o máº­t
- MÃ£ hÃ³a máº­t kháº©u vá»›i bcrypt
- XÃ¡c thá»±c JWT token
- Cáº¥u hÃ¬nh CORS
- Kiá»ƒm tra Ä‘áº§u vÃ o vá»›i Pydantic

## 2025-12-01

### ThÃªm má»›i
- API endpoints Ä‘á»‹a lÃ½ cho boundaries
- Scripts import dá»¯ liá»‡u OSM
- Tá»•ng há»£p dá»¯ liá»‡u Ä‘Ã´ thá»‹
- Há»— trá»£ truy váº¥n nhiá»u boundaries

### Thay Ä‘á»•i
- Cáº­p nháº­t dependencies cho Python 3.11
- Cáº£i thiá»‡n xá»­ lÃ½ lá»—i trong adapters

### Sá»­a lá»—i
- Xá»­ lÃ½ geometry PostGIS trong export GeoJSON
- ÄÆ¡n giáº£n hÃ³a boundary cho cÃ¡c polygon lá»›n

## 2025-11-25

### ThÃªm má»›i
- SQLAlchemy models cho táº¥t cáº£ entities
- Alembic migration framework
- Script import OSM vá»›i osmium
- Seeding categories bÃ¡o cÃ¡o
- Neo4j/GraphDB ontology schema

### Thay Ä‘á»•i
- Cáº­p nháº­t Python dependencies
- Äá»•i tÃªn `metadata` thÃ nh `report_metadata` trong Report model

### Sá»­a lá»—i
- Import vÃ  export models
- Cáº¥u hÃ¬nh Alembic

## 2025-11-15

### ThÃªm má»›i
- Cáº¥u trÃºc dá»± Ã¡n FastAPI ban Ä‘áº§u
- CÃ¡c thao tÃ¡c CRUD cÆ¡ báº£n
- Thiáº¿t láº­p database PostgreSQL
- Cáº¥u hÃ¬nh Docker
- XÃ¡c thá»±c cÆ¡ báº£n

---

[ChÆ°a phÃ¡t hÃ nh]: https://github.com/PKA-Open-Dynamics/HQC System/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/PKA-Open-Dynamics/HQC System/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/PKA-Open-Dynamics/HQC System/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/PKA-Open-Dynamics/HQC System/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/PKA-Open-Dynamics/HQC System/releases/tag/v0.1.0

