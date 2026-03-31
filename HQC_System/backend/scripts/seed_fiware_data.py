#!/usr/bin/env python3
# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Seed Demo Data - FiWARE Smart Data Models
Táº¡o dá»¯ liá»‡u má»Ÿ demo theo chuáº©n NGSI-LD tá»« nguá»“n thá»±c táº¿ Viá»‡t Nam
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
from random import uniform, randint, choice
import json

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.services.ngsi_ld_service import NGSILDEntityService
from app.schemas.fiware.civic_issue import CivicIssueTrackingCreate, IssueStatus, IssuePriority
from app.schemas.fiware.parking import ParkingSpotCreate


# Hanoi districts and their coordinates
HANOI_LOCATIONS = [
    {"name": "Ba ÄÃ¬nh", "lat": 21.0355, "lon": 105.8198},
    {"name": "HoÃ n Kiáº¿m", "lat": 21.0285, "lon": 105.8542},
    {"name": "Hai BÃ  TrÆ°ng", "lat": 21.0069, "lon": 105.8523},
    {"name": "Äá»‘ng Äa", "lat": 21.0169, "lon": 105.8341},
    {"name": "Thanh XuÃ¢n", "lat": 20.9947, "lon": 105.8045},
    {"name": "Cáº§u Giáº¥y", "lat": 21.0333, "lon": 105.7944},
    {"name": "TÃ¢y Há»“", "lat": 21.0658, "lon": 105.8194},
    {"name": "HoÃ ng Mai", "lat": 20.9745, "lon": 105.8516},
    {"name": "Long BiÃªn", "lat": 21.0505, "lon": 105.8970},
    {"name": "HÃ  ÄÃ´ng", "lat": 20.9719, "lon": 105.7795},
]

# Civic issue categories from Vietnam
CIVIC_ISSUES_DATA = [
    {
        "category": "streetLighting",
        "subCategory": "brokenLight",
        "title": "ÄÃ¨n Ä‘Æ°á»ng há»ng trÃªn Ä‘Æ°á»ng {street}",
        "description": "ÄÃ¨n Ä‘Æ°á»ng táº¡i vá»‹ trÃ­ nÃ y Ä‘Ã£ há»ng trong vÃ i ngÃ y qua, gÃ¢y nguy hiá»ƒm cho ngÆ°á»i Ä‘i Ä‘Æ°á»ng vÃ o ban Ä‘Ãªm. Cáº§n sá»­a chá»¯a kháº©n cáº¥p."
    },
    {
        "category": "roadDamage",
        "subCategory": "pothole",
        "title": "á»” gÃ  lá»›n trÃªn Ä‘Æ°á»ng {street}",
        "description": "CÃ³ á»• gÃ  sÃ¢u khoáº£ng 20cm, nguy hiá»ƒm cho xe mÃ¡y. Nhiá»u ngÆ°á»i Ä‘Ã£ bá»‹ ngÃ£ táº¡i vá»‹ trÃ­ nÃ y."
    },
    {
        "category": "roadDamage",
        "subCategory": "floodedRoad",
        "title": "ÄÆ°á»ng ngáº­p nÆ°á»›c sau mÆ°a táº¡i {street}",
        "description": "Má»—i khi mÆ°a, khu vá»±c nÃ y bá»‹ ngáº­p sÃ¢u 30-40cm do há»‡ thá»‘ng thoÃ¡t nÆ°á»›c kÃ©m. GÃ¢y khÃ³ khÄƒn cho viá»‡c di chuyá»ƒn."
    },
    {
        "category": "waste",
        "subCategory": "overflowingBin",
        "title": "ThÃ¹ng rÃ¡c trÃ n lan táº¡i {street}",
        "description": "ThÃ¹ng rÃ¡c cÃ´ng cá»™ng Ä‘Ã£ Ä‘áº§y nhÆ°ng khÃ´ng Ä‘Æ°á»£c thu gom ká»‹p thá»i, rÃ¡c trÃ n ra Ä‘Æ°á»ng gÃ¢y Ã´ nhiá»…m vÃ  mÃ¹i hÃ´i."
    },
    {
        "category": "drainage",
        "subCategory": "blockedDrain",
        "title": "Cá»‘ng thoÃ¡t nÆ°á»›c bá»‹ táº¯c ngháº½n táº¡i {street}",
        "description": "Cá»‘ng thoÃ¡t nÆ°á»›c bá»‹ rÃ¡c vÃ  bÃ¹n Ä‘áº¥t lÃ m táº¯c ngháº½n, nÆ°á»›c khÃ´ng thoÃ¡t Ä‘Æ°á»£c khi mÆ°a."
    },
    {
        "category": "sidewalk",
        "subCategory": "brokenPavement",
        "title": "Vá»‰a hÃ¨ hÆ° há»ng táº¡i {street}",
        "description": "Gáº¡ch vá»‰a hÃ¨ bá»‹ vá»¡, lÃºn, nguy hiá»ƒm cho ngÆ°á»i Ä‘i bá»™ Ä‘áº·c biá»‡t lÃ  ngÆ°á»i giÃ  vÃ  tráº» em."
    },
    {
        "category": "publicSpace",
        "subCategory": "illegalParking",
        "title": "Xe láº¥n chiáº¿m lÃ²ng Ä‘Æ°á»ng táº¡i {street}",
        "description": "Nhiá»u xe Ã´ tÃ´, xe mÃ¡y Ä‘á»— trÃªn vá»‰a hÃ¨ vÃ  lÃ²ng Ä‘Æ°á»ng, gÃ¢y cáº£n trá»Ÿ giao thÃ´ng."
    },
    {
        "category": "environment",
        "subCategory": "airPollution",
        "title": "Ã” nhiá»…m khÃ´ng khÃ­ nghiÃªm trá»ng gáº§n {street}",
        "description": "KhÃ³i bá»¥i tá»« cÃ´ng trÆ°á»ng xÃ¢y dá»±ng gÃ¢y Ã´ nhiá»…m khÃ´ng khÃ­ nghiÃªm trá»ng, áº£nh hÆ°á»Ÿng Ä‘áº¿n sá»©c khá»e ngÆ°á»i dÃ¢n."
    },
    {
        "category": "publicFacility",
        "subCategory": "damagedBench",
        "title": "Gháº¿ cÃ´ng viÃªn hÆ° há»ng táº¡i {street}",
        "description": "Gháº¿ ngá»“i trong cÃ´ng viÃªn bá»‹ gÃ£y, cáº§n sá»­a chá»¯a hoáº·c thay tháº¿."
    },
    {
        "category": "vegetation",
        "subCategory": "overgrown",
        "title": "CÃ¢y cá»‘i má»c quÃ¡ táº§m che máº¥t táº§m nhÃ¬n táº¡i {street}",
        "description": "CÃ¢y xanh má»c quÃ¡ táº§m, che khuáº¥t biá»ƒn bÃ¡o vÃ  táº§m nhÃ¬n ngÆ°á»i Ä‘iá»u khiá»ƒn phÆ°Æ¡ng tiá»‡n."
    }
]

# Vietnamese street names
STREET_NAMES = [
    "Giáº£i PhÃ³ng", "LÃ¡ng Háº¡", "Nguyá»…n TrÃ£i", "XÃ£ ÄÃ n", 
    "Kim MÃ£", "Pháº¡m Ngá»c Tháº¡ch", "TÃ´n Äá»©c Tháº¯ng", "Tráº§n HÆ°ng Äáº¡o",
    "LÃ½ ThÆ°á»ng Kiá»‡t", "BÃ  Triá»‡u", "Äiá»‡n BiÃªn Phá»§", "Nguyá»…n ChÃ­ Thanh",
    "HoÃ ng Quá»‘c Viá»‡t", "Cáº§u Giáº¥y", "XuÃ¢n Thá»§y", "Tráº§n Duy HÆ°ng"
]

# Reporter names (Vietnamese)
REPORTER_NAMES = [
    "Nguyá»…n VÄƒn An", "Tráº§n Thá»‹ BÃ¬nh", "LÃª VÄƒn CÆ°á»ng", "Pháº¡m Thá»‹ Dung",
    "HoÃ ng VÄƒn Em", "VÅ© Thá»‹ Hoa", "Äáº·ng VÄƒn KhÃ¡nh", "BÃ¹i Thá»‹ Lan",
    "NgÃ´ VÄƒn Minh", "Phan Thá»‹ Nga"
]


async def seed_civic_issues(service: NGSILDEntityService, count: int = 50):
    """Seed civic issue tracking entities"""
    print(f"\nðŸ™ï¸  Seeding {count} civic issues...")
    
    for i in range(count):
        # Random location in Hanoi
        loc = choice(HANOI_LOCATIONS)
        lat = loc["lat"] + uniform(-0.01, 0.01)
        lon = loc["lon"] + uniform(-0.01, 0.01)
        
        # Random issue template
        issue_template = choice(CIVIC_ISSUES_DATA)
        street = choice(STREET_NAMES)
        
        # Random dates
        days_ago = randint(1, 30)
        created = datetime.utcnow() - timedelta(days=days_ago)
        
        # Random status
        statuses = [IssueStatus.OPEN, IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED, IssueStatus.CLOSED]
        status = choice(statuses)
        
        # Create entity
        issue = CivicIssueTrackingCreate(
            location={"type": "Point", "coordinates": [lon, lat]},
            address={
                "streetAddress": street,
                "addressLocality": loc["name"],
                "addressRegion": "Hanoi",
                "addressCountry": "VN"
            },
            title=issue_template["title"].format(street=street),
            description=issue_template["description"],
            category=issue_template["category"],
            subCategory=issue_template["subCategory"],
            status=status,
            priority=choice([IssuePriority.LOW, IssuePriority.MEDIUM, IssuePriority.HIGH]),
            reportedBy=choice(REPORTER_NAMES),
            reporterEmail=f"reporter{i}@example.com",
            upvotes=randint(0, 50),
            downvotes=randint(0, 10),
            comments=randint(0, 20),
            dateCreated=created,
            dateModified=created + timedelta(days=randint(0, days_ago)) if status != IssueStatus.OPEN else None,
            dateResolved=created + timedelta(days=randint(days_ago, days_ago+5)) if status == IssueStatus.RESOLVED else None
        )
        
        # Convert to NGSI-LD and store
        from app.schemas.fiware.civic_issue import to_ngsi_ld_entity
        entity_id = f"urn:ngsi-ld:CivicIssueTracking:Hanoi:{created.strftime('%Y%m%d')}-{i:03d}"
        entity = to_ngsi_ld_entity(issue, entity_id)
        
        await service.store_entity(entity)
        
        if (i + 1) % 10 == 0:
            print(f"  âœ“ Created {i + 1}/{count} civic issues")
    
    print(f"Successfully seeded {count} civic issues")


async def seed_parking_spots(service: NGSILDEntityService, count: int = 100):
    """Seed parking spot entities"""
    print(f"\nðŸ…¿Seeding {count} parking spots...")
    
    parking_sites = [
        "Times City", "Royal City", "Vincom Center", "Lotte Center",
        "Big C", "Aeon Mall", "Parkson", "Landmark 72"
    ]
    
    for i in range(count):
        # Random location in Hanoi
        loc = choice(HANOI_LOCATIONS)
        lat = loc["lat"] + uniform(-0.005, 0.005)
        lon = loc["lon"] + uniform(-0.005, 0.005)
        
        site = choice(parking_sites)
        floor = choice(["B1", "B2", "B3", "G", "1", "2"])
        
        parking = ParkingSpotCreate(
            location={"type": "Point", "coordinates": [lon, lat]},
            address={
                "addressLocality": loc["name"],
                "addressRegion": "Hanoi",
                "addressCountry": "VN"
            },
            name=f"Spot {floor}-{i:03d}",
            category="offStreet",
            status=choice(["free", "occupied", "free", "free"]),  # 75% free
            allowedVehicleType=choice(["car", "motorcycle"]),
            refParkingSite=f"urn:ngsi-ld:ParkingSite:Hanoi:{site.replace(' ', '')}",
            dateModified=datetime.utcnow()
        )
        
        # Convert to NGSI-LD and store
        from app.schemas.fiware.parking import to_ngsi_ld_entity
        entity_id = f"urn:ngsi-ld:ParkingSpot:Hanoi:{site.replace(' ', '')}-{floor}-{i:03d}"
        entity = to_ngsi_ld_entity(parking, entity_id)
        
        await service.store_entity(entity)
        
        if (i + 1) % 20 == 0:
            print(f"  âœ“ Created {i + 1}/{count} parking spots")
    
    print(f"Successfully seeded {count} parking spots")


async def seed_realtime_data(service: NGSILDEntityService):
    """Seed current real-time weather and air quality data"""
    print("\nFetching and storing real-time data...")
    
    try:
        # Sync weather data for Hanoi
        print("Fetching weather data...")
        await service.sync_weather_data(21.028511, 105.804817, "Hanoi")
        print("  âœ“ Weather data stored")
        
        # Sync air quality data
        print("Fetching air quality data...")
        await service.sync_air_quality_data("hanoi")
        print("  âœ“ Air quality data stored")
        
        print("Real-time data synchronized")
    except Exception as e:
        print(f"Warning: Could not sync real-time data: {e}")


async def main():
    """Main seeding function"""
    print("=" * 60)
    print("  HQC System - FiWARE Smart Data Models Demo Seeder")
    print("  Dá»¯ liá»‡u má»Ÿ theo chuáº©n NGSI-LD tá»« thá»±c táº¿ Viá»‡t Nam")
    print("=" * 60)
    
    # Create async engine
    engine = create_async_engine(
        settings.ASYNC_DATABASE_URL,
        echo=False
    )
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        service = NGSILDEntityService(session)
        
        # Seed civic issues (BÃ¡o cÃ¡o tá»« ngÆ°á»i dÃ¢n)
        await seed_civic_issues(service, count=50)
        
        # Seed parking spots
        await seed_parking_spots(service, count=100)
        
        # Sync real-time data
        await seed_realtime_data(service)
    
    await engine.dispose()
    
    print("\n" + "=" * 60)
    print("Demo data seeding completed!")
    print("Access NGSI-LD API: http://localhost:8000/api/v1/ngsi-ld/v1/entities")
    print("API Docs: http://localhost:8000/docs")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

