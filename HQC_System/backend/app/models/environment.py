# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Environmental data models: Air quality, weather, traffic
Layer 2: Semi-dynamic data updated from external APIs
"""

from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB

from app.db.postgres import Base


class EnvironmentalData(Base):
    """Dá»¯ liá»‡u mÃ´i trÆ°á»ng: AQI, thá»i tiáº¿t, giao thÃ´ng"""
    __tablename__ = "environmental_data"

    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, nullable=True, index=True)
    
    data_type = Column(String(50), nullable=False, index=True,
                      comment="air_quality, weather, noise, traffic")
    
    # Value & unit
    value = Column(DECIMAL(10, 2), comment="GiÃ¡ trá»‹ Ä‘o Ä‘Æ°á»£c")
    unit = Column(String(20), comment="ÄÆ¡n vá»‹: Âµg/mÂ³, Â°C, dB, km/h")
    
    # Timestamp
    measured_at = Column(DateTime(timezone=True), nullable=False, index=True,
                        comment="Thá»i Ä‘iá»ƒm Ä‘o")
    
    # Source & additional data
    source = Column(String(50), comment="waqi, openweathermap, google_maps")
    properties = Column(JSONB, comment="ThÃ´ng tin chi tiáº¿t: PM2.5, PM10, humidity, etc.")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

