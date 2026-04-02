# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.mongodb import mongodb
from app.db.mongodb_atlas import mongodb_atlas
from app.db.init_db import init_db
import asyncio

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""HQC System Smart City Platform - REST API for urban data management with FiWARE NGSI-LD
...
...
""",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "HQC System Team",
        "email": "contact@hqcsystem.vn",
    },
    license_info={
        "name": "GNU General Public License v3.0",
        "url": "https://www.gnu.org/licenses/gpl-3.0.html",
    }
)

@app.on_event("startup")
async def startup_event():
    """Startup events: Connect DBs and launch auto-seeding"""
    # Connect to MongoDB
    await mongodb.connect_db()
    await mongodb_atlas.connect()

    # Launch auto-seeding in background
    logger.info("[Main] Launching automatic database initialization task...")
    asyncio.create_task(init_db())

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown events: Close connections"""
    await mongodb.close_db()
    await mongodb_atlas.close()

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add cache control middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class CacheControlMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Add cache headers for GET requests to reports and media endpoints
        if request.method == "GET":
            path = request.url.path
            
            # Cache reports list for 2 minutes
            if "/app/reports" in path or "/app/alerts" in path:
                response.headers["Cache-Control"] = "public, max-age=120"
                response.headers["Vary"] = "Accept-Encoding"
            
            # Cache geographic data for 5 minutes
            elif "/geographic" in path:
                response.headers["Cache-Control"] = "public, max-age=300"
                response.headers["Vary"] = "Accept-Encoding"
            
            # Cache static/media for 1 day
            elif "/media" in path or "/uploads" in path or path.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                response.headers["Cache-Control"] = "public, max-age=86400, immutable"
                response.headers["Vary"] = "Accept-Encoding"
        
        return response

app.add_middleware(CacheControlMiddleware)

@app.get("/")
def root():
    return {
        "message": "Welcome to HQC System NGSI-LD Context Broker",
        "version": settings.VERSION,
        "docs": "/docs",
        "features": [
            "FiWARE NGSI-LD Smart Data Models",
            "Web Dashboard Authentication & Authorization (MongoDB Docker)",
            "Mobile App Authentication & Reports (MongoDB Atlas)",
            "Real-time Urban Data Management"
        ]
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "hqc-system-backend",
        "version": settings.VERSION
    }

# Use the new API v1 router with all endpoints
from app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

