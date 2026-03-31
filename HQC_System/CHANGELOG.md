# Lá»‹ch sá»­ thay Ä‘á»•i (Changelog)

Táº¥t cáº£ cÃ¡c thay Ä‘á»•i quan trá»ng cá»§a dá»± Ã¡n HQC System Ä‘Æ°á»£c ghi láº¡i trong file nÃ y.

Äá»‹nh dáº¡ng dá»±a trÃªn [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
vÃ  dá»± Ã¡n tuÃ¢n theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [ChÆ°a phÃ¡t hÃ nh]

### Dá»± kiáº¿n
- Mobile app triá»ƒn khai Ä‘áº§y Ä‘á»§
- PhÃ¢n tÃ­ch nÃ¢ng cao vá»›i machine learning
- Há»— trá»£ Ä‘a ngÃ´n ngá»¯ (i18n)
- Push notifications

## [1.0.1] - 2025-12-08

### ThÃªm má»›i
- NPM Packages published lÃªn GitHub Packages
- Pull Request template cho GitHub
- PUBLISHING.md hÆ°á»›ng dáº«n publish packages

### Sá»­a lá»—i
- Sá»­a package names Ä‘á»ƒ phÃ¹ há»£p vá»›i GitHub organization
- Cáº­p nháº­t .gitignore loáº¡i trá»« build artifacts

### TÃ i liá»‡u
- Web App: CHANGELOG, CONTRIBUTING, DEPENDENCIES
- Backend: CHANGELOG, CONTRIBUTING, DEPENDENCIES
- Web Dashboard: CHANGELOG, CONTRIBUTING, DEPENDENCIES
- Chuáº©n hÃ³a format tiáº¿ng Viá»‡t cho táº¥t cáº£ tÃ i liá»‡u

### Cáº£i thiá»‡n
- Tá»‘i Æ°u cáº¥u trÃºc documentation
- Script tá»± Ä‘á»™ng publish packages
- Chuáº©n hÃ³a repository URLs

## [1.0.0] - 2025-12-07

### ThÃªm má»›i

#### Backend (v1.0.0)
- API NGSI-LD tuÃ¢n thá»§ chuáº©n ETSI
- Há»— trá»£ ontology SOSA/SSN
- API dá»¯ liá»‡u Ä‘á»‹a lÃ½ vá»›i PostGIS
- TÃ­ch há»£p LOD (OpenWeatherMap, AQICN, TomTom, OSM)
- XÃ¡c thá»±c ngÆ°á»i dÃ¹ng vá»›i JWT
- Há»‡ thá»‘ng quáº£n lÃ½ bÃ¡o cÃ¡o
- Quáº£n lÃ½ ranh giá»›i hÃ nh chÃ­nh

#### Web Dashboard (v2.1.0)
- IntegratedDataPanel cho hiá»ƒn thá»‹ LOD
- BoundarySelector cho truy váº¥n Ä‘á»‹a lÃ½
- Hiá»ƒn thá»‹ dá»¯ liá»‡u Ä‘a nguá»“n (thá»i tiáº¿t, AQI, giao thÃ´ng, OSM)
- Dashboard vá»›i analytics
- Trang dá»¯ liá»‡u Ä‘á»‹a lÃ½

#### TÃ i liá»‡u
- README Ä‘áº§y Ä‘á»§ cho táº¥t cáº£ sub-projects
- DEPENDENCIES.md vá»›i thÃ´ng tin license
- HÆ°á»›ng dáº«n CONTRIBUTING.md
- CHANGELOG.md theo Ä‘á»‹nh dáº¡ng Keep a Changelog
- License headers GPL-3.0 trong táº¥t cáº£ source files

#### Háº¡ táº§ng
- Cáº¥u hÃ¬nh Docker Compose
- Thiáº¿t láº­p PostgreSQL + PostGIS
- Alembic migrations
- Máº«u cáº¥u hÃ¬nh environment
- Scripts cÃ i Ä‘áº·t tá»± Ä‘á»™ng (setup.sh)

### Thay Ä‘á»•i
- Thá»‘ng nháº¥t license GPL-3.0 cho táº¥t cáº£ components
- Dá»n sáº¡ch code vÃ  scripts khÃ´ng dÃ¹ng
- Chuáº©n hÃ³a API client vá»›i há»— trá»£ PATCH
- Cáº­p nháº­t cáº¥u trÃºc tÃ i liá»‡u

## 2025-11-25

### ThÃªm má»›i
- SQLAlchemy models cho táº¥t cáº£ entities
- Alembic migration framework
- Script import OSM vá»›i osmium
- Seeding categories bÃ¡o cÃ¡o
- Neo4j/GraphDB ontology schema

### Thay Ä‘á»•i
- Cáº­p nháº­t Python dependencies cho Python 3.11
- Äá»•i tÃªn `metadata` thÃ nh `report_metadata` trong Report model

### Sá»­a lá»—i
- Import vÃ  export models
- Cáº¥u hÃ¬nh Alembic
- Xá»­ lÃ½ geometry PostGIS

### Báº£o máº­t
- ThÃªm .gitignore rules cho:
  - Dá»¯ liá»‡u OSM lá»›n (*.osm.pbf, *.geojson)
  - Cáº¥u hÃ¬nh environment (.env)
  - Database files

## 2025-11-20

### ThÃªm má»›i
- Cáº¥u trÃºc dá»± Ã¡n ban Ä‘áº§u
- Skeleton API backend vá»›i FastAPI
- Ná»n táº£ng web dashboard vá»›i React + TypeScript
- Thiáº¿t láº­p mobile app vá»›i Flutter
- Authentication models
- Report submission models
- Thiáº¿t káº¿ database schema
- Cáº¥u hÃ¬nh Docker cho development
- Thiáº¿t láº­p CI/CD pipeline
- TÃ i liá»‡u dá»± Ã¡n

### Háº¡ táº§ng
- Thiáº¿t láº­p PostgreSQL database
- MongoDB cho dá»¯ liá»‡u thá»i gian thá»±c
- Neo4j knowledge graph foundation
- Redis cho caching
- Cáº¥u hÃ¬nh mÃ´i trÆ°á»ng development

---

## PhÃ¢n loáº¡i thay Ä‘á»•i

- **ThÃªm má»›i** - TÃ­nh nÄƒng má»›i
- **Thay Ä‘á»•i** - Thay Ä‘á»•i trong chá»©c nÄƒng hiá»‡n cÃ³
- **Loáº¡i bá»** - TÃ­nh nÄƒng sáº¯p bá»‹ gá»¡ bá»
- **XÃ³a bá»** - TÃ­nh nÄƒng Ä‘Ã£ bá»‹ gá»¡ bá»
- **Sá»­a lá»—i** - Sá»­a lá»—i
- **Báº£o máº­t** - Thay Ä‘á»•i liÃªn quan Ä‘áº¿n báº£o máº­t

---

[ChÆ°a phÃ¡t hÃ nh]: https://github.com/PKA-Open-Dynamics/HQC System/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/PKA-Open-Dynamics/HQC System/compare/v0.2.0...v1.0.0


