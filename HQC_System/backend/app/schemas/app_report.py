# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Mobile App Report Schema
Compatible with web-app/server Report model
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class MediaItem(BaseModel):
    """Media attachment (image or video)"""
    uri: str  # URL or base64
    type: str  # 'image' or 'video'
    filename: Optional[str] = None


class LocationData(BaseModel):
    """GPS coordinates"""
    lat: float
    lng: float


class AppReportCreate(BaseModel):
    """Mobile app report creation request"""
    reportType: str  # Loáº¡i pháº£n Ã¡nh
    ward: str  # XÃ£/phÆ°á»ng
    addressDetail: Optional[str] = ""  # Sá»‘ nhÃ , thÃ´n/xÃ³m, khu vá»±c
    location: Optional[LocationData] = None
    title: Optional[str] = ""  # TiÃªu Ä‘á»
    content: str  # Ná»™i dung pháº£n Ã¡nh
    media: List[MediaItem] = []
    userId: Optional[str] = None  # ID ngÆ°á»i dÃ¹ng


class AppReport(BaseModel):
    """Mobile app report (matches web-app/server model)"""
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    reportType: str
    ward: str
    addressDetail: str = ""
    location: Optional[LocationData] = None
    title: str = ""
    content: str
    media: List[MediaItem] = []
    userId: Optional[str] = None
    status: str = "pending"  # pending, processing, resolved, rejected
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class AppReportResponse(BaseModel):
    """API response for report"""
    success: bool = True
    data: dict


class AppReportListResponse(BaseModel):
    """API response for report list"""
    success: bool = True
    data: List[dict]
    count: int


class AppReportUpdate(BaseModel):
    """Update report (admin only)"""
    status: Optional[str] = None  # pending, processing, resolved, rejected
    adminNote: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    reportType: Optional[str] = None
    ward: Optional[str] = None
    addressDetail: Optional[str] = None


# Comment Schemas
class AppCommentCreate(BaseModel):
    """Create a new comment"""
    content: str  # Ná»™i dung bÃ¬nh luáº­n
    userId: Optional[str] = None  # ID ngÆ°á»i dÃ¹ng
    userName: Optional[str] = None  # TÃªn ngÆ°á»i dÃ¹ng


class AppCommentResponse(BaseModel):
    """API response for comment"""
    success: bool = True
    data: dict


class AppCommentListResponse(BaseModel):
    """API response for comment list"""
    success: bool = True
    data: List[dict]
    count: int
