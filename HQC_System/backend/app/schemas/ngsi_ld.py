# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Schema cho NGSI-LD entities
"""

from typing import Any, Dict, List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field


class GeoProperty(BaseModel):
    """GeoProperty theo chuáº©n NGSI-LD"""
    type: str = "GeoProperty"
    value: Dict[str, Any]


class Property(BaseModel):
    """Property theo chuáº©n NGSI-LD"""
    type: str = "Property"
    value: Any
    observedAt: Optional[datetime] = None
    unitCode: Optional[str] = None


class Relationship(BaseModel):
    """Relationship theo chuáº©n NGSI-LD"""
    type: str = "Relationship"
    object: str


class NGSILDEntity(BaseModel):
    """Entity chuáº©n NGSI-LD"""
    id: str = Field(..., description="URN cá»§a entity")
    type: str = Field(..., description="Loáº¡i entity")
    context: Optional[List[str]] = Field(
        default=["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"],
        alias="@context"
    )
    
    class Config:
        populate_by_name = True


class FloodSensor(NGSILDEntity):
    """Sensor ngáº­p nÆ°á»›c tá»« ngÆ°á»i dÃ¢n"""
    type: str = "FloodCrowdSensor"
    location: GeoProperty
    waterLevel: Property
    confidence: Property
    reportedBy: Relationship
    observedAt: str


class TrafficSensor(NGSILDEntity):
    """Sensor giao thÃ´ng tá»« ngÆ°á»i dÃ¢n"""
    type: str = "TrafficCrowdSensor"
    location: GeoProperty
    congestionLevel: Property
    vehicleCount: Optional[Property] = None
    confidence: Property
    reportedBy: Relationship
    observedAt: str


class AQISensor(NGSILDEntity):
    """Sensor cháº¥t lÆ°á»£ng khÃ´ng khÃ­"""
    type: str = "AirQualityObserved"
    location: GeoProperty
    aqi: Property
    pm25: Optional[Property] = None
    pm10: Optional[Property] = None
    source: Property
    observedAt: str

