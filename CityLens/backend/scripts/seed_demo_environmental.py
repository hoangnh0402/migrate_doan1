#!/usr/bin/env python3
import asyncio
import sys
import os
from datetime import datetime, timedelta
from random import uniform, randint, choice

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.db_models import EntityDB

async def seed_env_data():
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("🌱 Seeding Environmental & Traffic stub data...")
        
        # 1. WeatherObserved
        weather_entity = {
            "id": "urn:ngsi-ld:WeatherObserved:Hanoi:001",
            "type": "WeatherObserved",
            "location": {
                "type": "GeoProperty",
                "value": {"type": "Point", "coordinates": [105.8542, 21.0285]}
            },
            "temperature": {"type": "Property", "value": 26.5},
            "relativeHumidity": {"type": "Property", "value": 75},
            "weatherType": {"type": "Property", "value": "Clouds"},
            "description": {"type": "Property", "value": "Nhiều mây"},
            "observedAt": {"type": "Property", "value": datetime.utcnow().isoformat() + "Z"}
        }
        
        # 2. AirQualityObserved
        aqi_entity = {
            "id": "urn:ngsi-ld:AirQualityObserved:Hanoi:001",
            "type": "AirQualityObserved",
            "location": {
                "type": "GeoProperty",
                "value": {"type": "Point", "coordinates": [105.8542, 21.0285]}
            },
            "aqi": {"type": "Property", "value": 85},
            "pm25": {"type": "Property", "value": 35.0},
            "pm10": {"type": "Property", "value": 55.0},
            "description": {"type": "Property", "value": "Trung bình"},
            "observedAt": {"type": "Property", "value": datetime.utcnow().isoformat() + "Z"}
        }
        
        # 3. TrafficFlowObserved
        traffic_entity = {
            "id": "urn:ngsi-ld:TrafficFlowObserved:Hanoi:001",
            "type": "TrafficFlowObserved",
            "location": {
                "type": "GeoProperty",
                "value": {"type": "Point", "coordinates": [105.8542, 21.0285]}
            },
            "intensity": {"type": "Property", "value": 0.65},
            "averageVehicleSpeed": {"type": "Property", "value": 35.0},
            "observedAt": {"type": "Property", "value": datetime.utcnow().isoformat() + "Z"}
        }

        for data in [weather_entity, aqi_entity, traffic_entity]:
            db_ent = EntityDB(
                id=data["id"],
                type=data["type"],
                data=data,
                location_geom=f"SRID=4326;POINT({data['location']['value']['coordinates'][0]} {data['location']['value']['coordinates'][1]})",
                created_at=datetime.utcnow()
            )
            # Check if exists
            from sqlalchemy import select
            res = await session.execute(select(EntityDB).where(EntityDB.id == data["id"]))
            if not res.scalar_one_or_none():
                session.add(db_ent)
                print(f"  ✓ Added {data['type']}")
        
        await session.commit()
    await engine.dispose()
    print("✅ Done!")

if __name__ == "__main__":
    asyncio.run(seed_env_data())
