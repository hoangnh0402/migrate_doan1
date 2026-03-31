# HÆ°á»›ng dáº«n ÄÃ³ng gÃ³p cho HQC System Backend

Cáº£m Æ¡n báº¡n quan tÃ¢m Ä‘áº¿n viá»‡c Ä‘Ã³ng gÃ³p cho dá»± Ã¡n HQC System Backend! TÃ i liá»‡u nÃ y cung cáº¥p hÆ°á»›ng dáº«n Ä‘á»ƒ Ä‘Ã³ng gÃ³p vÃ o backend API.

## Má»¥c lá»¥c

- [Quy táº¯c á»©ng xá»­](#quy-táº¯c-á»©ng-xá»­)
- [Thiáº¿t láº­p mÃ´i trÆ°á»ng](#thiáº¿t-láº­p-mÃ´i-trÆ°á»ng)
- [Cáº¥u trÃºc dá»± Ã¡n](#cáº¥u-trÃºc-dá»±-Ã¡n)
- [Chuáº©n code](#chuáº©n-code)
- [Quy trÃ¬nh Pull Request](#quy-trÃ¬nh-pull-request)

## Quy táº¯c á»©ng xá»­

Dá»± Ã¡n nÃ y tuÃ¢n theo [Quy táº¯c á»©ng xá»­](../CODE_OF_CONDUCT.md) cá»§a HQC System.

## Thiáº¿t láº­p mÃ´i trÆ°á»ng

### YÃªu cáº§u

- Python 3.11+
- PostgreSQL 15+ vá»›i PostGIS
- Redis 7+ (optional)
- MongoDB 7+ (optional)

### CÃ i Ä‘áº·t

```bash
# Clone repository
git clone https://github.com/PKA-Open-Dynamics/HQC System.git
cd HQC System/backend

# Táº¡o virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoáº·c: venv\Scripts\activate  # Windows

# CÃ i Ä‘áº·t dependencies
pip install -r requirements.txt

# Copy vÃ  cáº¥u hÃ¬nh environment
cp .env.example .env
# Chá»‰nh sá»­a .env vá»›i thÃ´ng tin database cá»§a báº¡n

# Cháº¡y migrations
alembic upgrade head

# Cháº¡y server
uvicorn app.main:app --reload
```

## Cáº¥u trÃºc dá»± Ã¡n

```
backend/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ api/v1/          # API endpoints
â”‚   â”‚   â””â”€â”€ endpoints/   # Route handlers
â”‚   â”œâ”€â”€ adapters/        # External service adapters
â”‚   â”œâ”€â”€ core/            # Configuration & security
â”‚   â”œâ”€â”€ db/              # Database connections
â”‚   â”œâ”€â”€ models/          # SQLAlchemy models
â”‚   â”œâ”€â”€ schemas/         # Pydantic schemas
â”‚   â”œâ”€â”€ services/        # Business logic
â”‚   â””â”€â”€ main.py          # Application entry
â”œâ”€â”€ alembic/             # Database migrations
â”œâ”€â”€ scripts/             # Utility scripts
â”œâ”€â”€ graphdb/             # LOD ontology & context
â””â”€â”€ requirements.txt     # Dependencies
```

## Chuáº©n code

### Python Style

- **PEP 8**: TuÃ¢n thá»§ PEP 8 style guide
- **Black**: Sá»­ dá»¥ng Black formatter (line length 100)
- **Type hints**: Sá»­ dá»¥ng type annotations
- **Docstrings**: Google-style docstrings

### License Header

Má»—i file Python pháº£i cÃ³ license header:

```python
# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)
```

### API Conventions

- RESTful endpoints vá»›i prefix `/api/v1/`
- NGSI-LD endpoints vá»›i prefix `/ngsi-ld/v1/`
- Sá»­ dá»¥ng Pydantic schemas cho validation
- HTTP status codes chuáº©n

### Database

- Migrations vá»›i Alembic
- Models káº¿ thá»«a tá»« `Base`
- PostGIS geometries vá»›i GeoAlchemy2

## Quy trÃ¬nh Pull Request

1. Fork repository
2. Táº¡o branch: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: mÃ´ táº£"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Táº¡o Pull Request

### Commit Message Format

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Testing

```bash
# Cháº¡y tests
pytest

# Vá»›i coverage
pytest --cov=app
```

## LiÃªn há»‡

- Issues: [GitHub Issues](https://github.com/PKA-Open-Dynamics/HQC System/issues)
- Email: HQC System@example.com

