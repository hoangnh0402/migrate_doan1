# HQC System Backend - HÆ°á»›ng dáº«n Import Database

HÆ°á»›ng dáº«n import database vá»›i 487,000+ OpenStreetMap entities vÃ o HQC System Backend.

---

## YÃªu cáº§u

- Backend Ä‘ang cháº¡y (Ä‘Ã£ cháº¡y `./start.sh`)
- Database dump file (`.sql`)
- PostgreSQL container Ä‘ang hoáº¡t Ä‘á»™ng

---

## CÃ¡ch 1: Import tá»« file SQL dump

### BÆ°á»›c 1: Chuáº©n bá»‹ file dump

Náº¿u báº¡n chÆ°a cÃ³ file dump, liÃªn há»‡ team Ä‘á»ƒ nháº­n:
- File: `HQC System_dump.sql`
- Dung lÆ°á»£ng: khoáº£ng 50-100MB
- Chá»©a: 487,000+ OSM entities (buildings, roads, POIs)

### BÆ°á»›c 2: Import vÃ o database

```bash
# Import trá»±c tiáº¿p vÃ o container Ä‘ang cháº¡y
docker exec -i HQC System-postgres-prod psql -U HQC System -d HQC System_db < HQC System_dump.sql
```

### BÆ°á»›c 3: Kiá»ƒm tra

```bash
# Kiá»ƒm tra sá»‘ lÆ°á»£ng entities
docker exec HQC System-postgres-prod psql -U HQC System -d HQC System_db -c "SELECT COUNT(*) FROM osm_entities;"

# Xem breakdown theo type
docker exec HQC System-postgres-prod psql -U HQC System -d HQC System_db -c "SELECT entity_type, COUNT(*) FROM osm_entities GROUP BY entity_type;"
```

---

## CÃ¡ch 2: Import tá»« OpenStreetMap trá»±c tiáº¿p

Náº¿u báº¡n muá»‘n tá»± import dá»¯ liá»‡u OSM má»›i:

### BÆ°á»›c 1: Download OSM data

```bash
# Táº£i Vietnam OSM data
wget https://download.geofabrik.de/asia/vietnam-latest.osm.pbf
```

### BÆ°á»›c 2: Cháº¡y script import

```bash
# Tá»« backend directory
python scripts/import_osm.py --file vietnam-latest.osm.pbf --area hanoi
```

Chi tiáº¿t tham sá»‘:
- `--file`: ÄÆ°á»ng dáº«n Ä‘áº¿n file .osm.pbf
- `--area`: Khu vá»±c muá»‘n import (hanoi, hochiminhcity, danang, etc.)
- `--entity-types`: Loáº¡i entities (building, highway, amenity) - máº·c Ä‘á»‹nh lÃ  táº¥t cáº£

---

## Export database hiá»‡n táº¡i

Náº¿u báº¡n muá»‘n táº¡o backup hoáº·c chia sáº» database:

```bash
# Export tá»« container
docker exec HQC System-postgres-prod pg_dump -U HQC System HQC System_db > HQC System_backup_$(date +%Y%m%d).sql

# Hoáº·c dÃ¹ng script
./scripts/export_database.sh
```

---

## Troubleshooting

### Lá»—i: "database does not exist"

```bash
# Táº¡o database
docker exec HQC System-postgres-prod psql -U HQC System -c "CREATE DATABASE HQC System_db;"
docker exec HQC System-postgres-prod psql -U HQC System -d HQC System_db -c "CREATE EXTENSION postgis;"
```

### Lá»—i: "connection refused"

```bash
# Kiá»ƒm tra PostgreSQL Ä‘ang cháº¡y
docker ps | grep postgres

# Khá»Ÿi Ä‘á»™ng láº¡i náº¿u cáº§n
docker-compose up -d postgres
```

### Import quÃ¡ lÃ¢u

File dump lá»›n cÃ³ thá»ƒ máº¥t thá»i gian. Theo dÃµi progress:

```bash
# Xem logs PostgreSQL
docker-compose logs -f postgres

# Kiá»ƒm tra disk usage
docker exec HQC System-postgres-prod df -h
```

### XÃ³a dá»¯ liá»‡u vÃ  import láº¡i

```bash
# Drop táº¥t cáº£ tables
docker exec HQC System-postgres-prod psql -U HQC System -d HQC System_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Import láº¡i
docker exec -i HQC System-postgres-prod psql -U HQC System -d HQC System_db < HQC System_dump.sql
```

---

## ThÃ´ng tin Database

Sau khi import thÃ nh cÃ´ng, database sáº½ cÃ³:

### Tables chÃ­nh

- `osm_entities`: Táº¥t cáº£ entities tá»« OpenStreetMap
- `citizen_reports`: BÃ¡o cÃ¡o tá»« ngÆ°á»i dÃ¢n
- `users`: Quáº£n lÃ½ ngÆ°á»i dÃ¹ng
- `spatial_ref_sys`: PostGIS spatial reference systems

### Extensions

- PostGIS: Xá»­ lÃ½ dá»¯ liá»‡u Ä‘á»‹a lÃ½
- pg_trgm: Full-text search
- uuid-ossp: Generate UUIDs

### Statistics

- Tá»•ng entities: 487,000+
- Buildings: ~350,000
- Roads: ~80,000
- POIs: ~57,000
- Dung lÆ°á»£ng: ~2-3GB

---

## Há»— trá»£

- GitHub Issues: https://github.com/PKA-Open-Dynamics/HQC System/issues
- Documentation: README.md

---

Copyright (c) 2025 HQC System Contributors
GNU General Public License v3.0

