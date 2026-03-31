# HQC System Backend - Dependencies

TÃ i liá»‡u nÃ y liá»‡t kÃª táº¥t cáº£ cÃ¡c thÆ° viá»‡n vÃ  gÃ³i pháº§n má»m Ä‘Æ°á»£c sá»­ dá»¥ng trong dá»± Ã¡n HQC System Backend.

## PhiÃªn báº£n Python

- **Python**: 3.11+ (khuyáº¿n nghá»‹ 3.11 hoáº·c 3.12)

## ThÆ° viá»‡n chÃ­nh

### Core Framework

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.109.0 | MIT | Web framework hiá»‡n Ä‘áº¡i cho Python |
| [Uvicorn](https://www.uvicorn.org/) | 0.27.0 | BSD-3-Clause | ASGI server |
| [Pydantic](https://pydantic-docs.helpmanual.io/) | 2.6.0 | MIT | Data validation |
| [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) | 2.1.0 | MIT | Settings management |

### Database - PostgreSQL + PostGIS

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0.25 | MIT | SQL toolkit vÃ  ORM |
| [GeoAlchemy2](https://geoalchemy-2.readthedocs.io/) | 0.14.3 | MIT | Spatial extension cho SQLAlchemy |
| [asyncpg](https://magicstack.github.io/asyncpg/) | 0.29.0 | Apache-2.0 | Async PostgreSQL driver |
| [psycopg2-binary](https://www.psycopg.org/) | 2.9.9 | LGPL | PostgreSQL adapter |
| [Alembic](https://alembic.sqlalchemy.org/) | 1.13.1 | MIT | Database migrations |

### Database - MongoDB

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [PyMongo](https://pymongo.readthedocs.io/) | 4.6.1 | Apache-2.0 | MongoDB driver |
| [Motor](https://motor.readthedocs.io/) | 3.3.2 | Apache-2.0 | Async MongoDB driver |

### Database - Redis

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [redis](https://redis-py.readthedocs.io/) | 5.0.1 | MIT | Redis client |

### Authentication & Security

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [python-jose](https://python-jose.readthedocs.io/) | 3.3.0 | MIT | JWT implementation |
| [passlib](https://passlib.readthedocs.io/) | 1.7.4 | BSD | Password hashing |
| [email-validator](https://github.com/JoshData/python-email-validator) | 2.1.0 | CC0-1.0 | Email validation |

### File Upload & Media

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [python-multipart](https://github.com/andrew-d/python-multipart) | 0.0.6 | Apache-2.0 | Multipart form data |
| [Pillow](https://pillow.readthedocs.io/) | 10.2.0 | HPND | Image processing |
| [cloudinary](https://cloudinary.com/documentation/python_integration) | 1.37.0 | MIT | Cloud media storage |

### HTTP Client

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [httpx](https://www.python-httpx.org/) | 0.26.0 | BSD-3-Clause | Async HTTP client |
| [requests](https://requests.readthedocs.io/) | 2.31.0 | Apache-2.0 | HTTP library |

### GIS & Geospatial

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [Shapely](https://shapely.readthedocs.io/) | 2.0.2 | BSD-3-Clause | Geometric operations |
| [NumPy](https://numpy.org/) | 1.26.3 | BSD-3-Clause | Numerical computing |
| [osmium](https://osmcode.org/pyosmium/) | 3.7.0 | BSD-2-Clause | OSM data processing |

### Linked Open Data (Optional)

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [RDFLib](https://rdflib.readthedocs.io/) | 7.0.0 | BSD-3-Clause | RDF library |
| [SPARQLWrapper](https://sparqlwrapper.readthedocs.io/) | 2.0.0 | W3C | SPARQL endpoint access |

### System Monitoring

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [psutil](https://psutil.readthedocs.io/) | 5.9.8 | BSD-3-Clause | System utilities |

### Environment

| ThÆ° viá»‡n | PhiÃªn báº£n | Giáº¥y phÃ©p | MÃ´ táº£ |
|----------|-----------|-----------|-------|
| [python-dotenv](https://pypi.org/project/python-dotenv/) | 1.0.0 | BSD-3-Clause | Environment variables |

## Dá»‹ch vá»¥ bÃªn ngoÃ i (External Services)

Dá»± Ã¡n sá»­ dá»¥ng cÃ¡c API bÃªn ngoÃ i Ä‘á»ƒ thu tháº­p dá»¯ liá»‡u thÃ nh phá»‘ thÃ´ng minh:

| Dá»‹ch vá»¥ | Má»¥c Ä‘Ã­ch | Giáº¥y phÃ©p API |
|---------|----------|---------------|
| [OpenWeatherMap](https://openweathermap.org/) | Dá»¯ liá»‡u thá»i tiáº¿t | Free tier available |
| [AQICN](https://aqicn.org/) | Chá»‰ sá»‘ cháº¥t lÆ°á»£ng khÃ´ng khÃ­ | Free tier available |
| [TomTom](https://developer.tomtom.com/) | Dá»¯ liá»‡u giao thÃ´ng | Free tier available |
| [OpenStreetMap](https://www.openstreetmap.org/) | Dá»¯ liá»‡u báº£n Ä‘á»“ | ODbL |

## CÃ i Ä‘áº·t

```bash
# Táº¡o virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoáº·c
venv\Scripts\activate     # Windows

# CÃ i Ä‘áº·t táº¥t cáº£ dependencies
pip install -r requirements.txt
```

## TÆ°Æ¡ng thÃ­ch giáº¥y phÃ©p

Táº¥t cáº£ cÃ¡c thÆ° viá»‡n Ä‘Æ°á»£c sá»­ dá»¥ng Ä‘á»u cÃ³ giáº¥y phÃ©p tÆ°Æ¡ng thÃ­ch vá»›i GPL-3.0:
- MIT License âœ“
- BSD Licenses (2-Clause, 3-Clause) âœ“
- Apache-2.0 âœ“
- LGPL âœ“

Dá»± Ã¡n HQC System Backend Ä‘Æ°á»£c phÃ¡t hÃ nh theo giáº¥y phÃ©p **GNU General Public License v3.0 (GPL-3.0)**.

