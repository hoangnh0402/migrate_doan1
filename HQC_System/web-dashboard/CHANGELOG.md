# Lá»‹ch sá»­ thay Ä‘á»•i (Changelog)

Táº¥t cáº£ cÃ¡c thay Ä‘á»•i quan trá»ng cá»§a HQC System Web Dashboard Ä‘Æ°á»£c ghi láº¡i trong file nÃ y.

Äá»‹nh dáº¡ng dá»±a trÃªn [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
vÃ  dá»± Ã¡n tuÃ¢n theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [ChÆ°a phÃ¡t hÃ nh]

### Dá»± kiáº¿n
- Theo dÃµi tráº¡ng thÃ¡i bÃ¡o cÃ¡o trá»±c quan
- Há»‡ thá»‘ng thÃ´ng bÃ¡o ngÆ°á»i dÃ¹ng
- TÃ¹y chá»n lá»c nÃ¢ng cao

## [1.0.1] - 2025-12-08

### TÃ i liá»‡u
- ThÃªm CHANGELOG.md vá»›i lá»‹ch sá»­ thay Ä‘á»•i chi tiáº¿t
- ThÃªm CONTRIBUTING.md vá»›i hÆ°á»›ng dáº«n Ä‘Ã³ng gÃ³p
- Cáº­p nháº­t DEPENDENCIES.md vá»›i thÃ´ng tin Ä‘áº§y Ä‘á»§

### Cáº£i thiá»‡n
- Chuáº©n hÃ³a format tÃ i liá»‡u tiáº¿ng Viá»‡t
- Cáº­p nháº­t .gitignore

## [1.0.0] - 2025-12-07

### ThÃªm má»›i
- IntegratedDataPanel - Hiá»ƒn thá»‹ dá»¯ liá»‡u LOD toÃ n diá»‡n
  - Section OpenStreetMap (boundaries, POIs, streets)
  - Section thá»i tiáº¿t tá»« OpenWeatherMap
  - Section chá»‰ sá»‘ cháº¥t lÆ°á»£ng khÃ´ng khÃ­ tá»« AQICN
  - Section lÆ°u lÆ°á»£ng giao thÃ´ng tá»« TomTom
  - Kháº£ nÄƒng lÃ m má»›i dá»¯ liá»‡u thá»i gian thá»±c

- BoundarySelector - TrÃ¬nh duyá»‡t chá»n boundaries
  - Chá»n theo cáº¥p báº­c quáº­n/phÆ°á»ng
  - Chá»©c nÄƒng tÃ¬m kiáº¿m
  - Hiá»ƒn thá»‹ thá»‘ng kÃª nhanh

- DEPENDENCIES.md - TÃ i liá»‡u dependencies Ä‘áº§y Ä‘á»§
  - Táº¥t cáº£ cÃ¡c gÃ³i npm vá»›i licenses
  - ThÃ´ng tin phiÃªn báº£n
  - Ghi chÃº tÆ°Æ¡ng thÃ­ch license

- setup.sh - Script cÃ i Ä‘áº·t tá»± Ä‘á»™ng

### Thay Ä‘á»•i
- Dá»n sáº¡ch dá»± Ã¡n
  - XÃ³a components khÃ´ng dÃ¹ng (charts/, ui/)
  - XÃ³a utilities khÃ´ng dÃ¹ng (types/, utils/)
  - Há»£p nháº¥t cÃ¡c file API
  - Cáº­p nháº­t index exports

### Sá»­a lá»—i
- Trang Reports placeholder
- API client patch method
- Lá»—i build sau dá»n dáº¹p

## 2025-12-05

### ThÃªm má»›i
- TÃ­ch há»£p NGSI-LD API - Há»— trá»£ Ä‘áº§y Ä‘á»§ chuáº©n ETSI NGSI-LD
  - Service ngsi-ld-api.ts vá»›i cÃ¡c API methods
  - Há»— trá»£ ontology SOSA/SSN (Sensors, Observations)
  - Triá»ƒn khai FiWARE Smart Data Models
    - AirQualityObserved
    - WeatherObserved
    - TrafficFlowObserved
    - OffStreetParking
    - Streetlight
    - WaterQualityObserved
  - Há»— trá»£ Geo-queries (near, within)

- Entity Browser Page - Quáº£n lÃ½ NGSI-LD entity
  - Duyá»‡t táº¥t cáº£ entities vá»›i lá»c theo type
  - TÃ¬m kiáº¿m nÃ¢ng cao theo ID vÃ  type
  - JSON-LD viewer cho chi tiáº¿t entity
  - Thá»‘ng kÃª thá»i gian thá»±c

- Data Catalog Page - Danh má»¥c nguá»“n dá»¯ liá»‡u má»Ÿ
  - 6 nguá»“n dá»¯ liá»‡u tÃ­ch há»£p
  - Thá»‘ng kÃª entity theo type
  - GiÃ¡m sÃ¡t tráº¡ng thÃ¡i nguá»“n dá»¯ liá»‡u

- API Integration Page - TÃ i liá»‡u API tÆ°Æ¡ng tÃ¡c
  - 4 vÃ­ dá»¥ API vá»›i nhiá»u ngÃ´n ngá»¯ (cURL, JavaScript, Python)
  - Chá»©c nÄƒng copy-to-clipboard
  - VÃ­ dá»¥ code trá»±c tiáº¿p

### Thay Ä‘á»•i
- Thá»‘ng nháº¥t license thÃ nh GPL-3.0
- API Client - ThÃªm há»— trá»£ PATCH method
- Kiáº¿n trÃºc - Chuyá»ƒn sang Next.js 14 App Router

### XÃ³a bá»
- CÃ¡c trang chÆ°a hoÃ n thiá»‡n (ai-assistant, timeline-explorer, v.v.)

### Sá»­a lá»—i
- ENV variable prefix (VITE_* -> NEXT_PUBLIC_*)
- Xung Ä‘á»™t license MIT vÃ  GPL-3.0
- Lá»—i TypeScript trong API client

## 2025-11-24

### ThÃªm má»›i
- PhÃ¡t hÃ nh báº£n Ä‘áº§u
- Dashboard cÆ¡ báº£n vá»›i reports, facilities, analytics
- Hiá»ƒn thá»‹ báº£n Ä‘á»“ vá»›i Leaflet
- Quáº£n lÃ½ bÃ¡o cÃ¡o
- Quáº£n lÃ½ ngÆ°á»i dÃ¹ng
- Há»‡ thá»‘ng xÃ¡c thá»±c
- TÃ­ch há»£p REST API

---

[ChÆ°a phÃ¡t hÃ nh]: https://github.com/PKA-Open-Dynamics/HQC System/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/PKA-Open-Dynamics/HQC System/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/PKA-Open-Dynamics/HQC System/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/PKA-Open-Dynamics/HQC System/releases/tag/v1.0.0

