# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Schema cho Report API
"""

from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.report import ReportStatus


class ReportBase(BaseModel):
    """Schema cÆ¡ báº£n cho Report"""
    title: str = Field(..., min_length=5, max_length=200)
    description: Optional[str] = None
    severity: int = Field(default=3, ge=1, le=5)
    address: Optional[str] = None
    district: Optional[str] = None


class ReportCreate(ReportBase):
    """Schema táº¡o Report má»›i"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    incident_time: datetime
    media_urls: Optional[List[str]] = None


class ReportUpdate(BaseModel):
    """Schema cáº­p nháº­t Report"""
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[int] = Field(None, ge=1, le=5)


class ReportInDB(ReportBase):
    """Schema Report trong database"""
    id: int
    user_id: int
    latitude: float
    longitude: float
    status: ReportStatus
    confidence_score: float
    verification_count: int
    incident_time: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ReportResponse(ReportInDB):
    """Schema response Report cho API"""
    user_username: Optional[str] = None
    distance: Optional[float] = None  # Khoáº£ng cÃ¡ch Ä‘áº¿n ngÆ°á»i dÃ¹ng (km)


class ReportVerify(BaseModel):
    """Schema xÃ¡c thá»±c bÃ¡o cÃ¡o (admin)"""
    status: ReportStatus
    admin_note: Optional[str] = None


class ReportStats(BaseModel):
    """Thá»‘ng kÃª bÃ¡o cÃ¡o"""
    total: int
    pending: int
    verified: int
    rejected: int
    resolved: int
    by_type: dict
    by_district: dict

