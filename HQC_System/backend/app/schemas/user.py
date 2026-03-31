# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
User Schemas for Dashboard Authentication & Authorization
"""

from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


# ==================== User Roles & Status ====================

class UserRole(str):
    """User role enumeration"""
    SUPER_ADMIN = "super_admin"  # CÃ³ thá»ƒ duyá»‡t táº¥t cáº£ user
    ADMIN = "admin"               # Quáº£n lÃ½ toÃ n bá»™ thÃ nh phá»‘
    MANAGER = "manager"           # Quáº£n lÃ½ khu vá»±c/chá»©c nÄƒng cá»¥ thá»ƒ
    ANALYST = "analyst"           # PhÃ¢n tÃ­ch dá»¯ liá»‡u, xem bÃ¡o cÃ¡o
    VIEWER = "viewer"             # Chá»‰ xem, khÃ´ng chá»‰nh sá»­a


class UserStatus(str):
    """User account status"""
    PENDING = "pending"           # Äang chá» duyá»‡t
    APPROVED = "approved"         # ÄÃ£ Ä‘Æ°á»£c duyá»‡t, hoáº¡t Ä‘á»™ng
    REJECTED = "rejected"         # Bá»‹ tá»« chá»‘i
    SUSPENDED = "suspended"       # Bá»‹ táº¡m ngÆ°ng
    INACTIVE = "inactive"         # KhÃ´ng hoáº¡t Ä‘á»™ng


# ==================== Request Schemas ====================

class UserRegister(BaseModel):
    """User registration request"""
    email: EmailStr = Field(..., description="Email Ä‘Äƒng nháº­p")
    password: str = Field(..., min_length=8, description="Máº­t kháº©u (tá»‘i thiá»ƒu 8 kÃ½ tá»±)")
    full_name: str = Field(..., min_length=2, max_length=100, description="Há» vÃ  tÃªn")
    phone: Optional[str] = Field(None, description="Sá»‘ Ä‘iá»‡n thoáº¡i")
    department: Optional[str] = Field(None, description="PhÃ²ng ban")
    position: Optional[str] = Field(None, description="Chá»©c vá»¥")
    reason: Optional[str] = Field(None, description="LÃ½ do Ä‘Äƒng kÃ½ sá»­ dá»¥ng há»‡ thá»‘ng")
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 8 kÃ½ tá»±')
        if not any(c.isdigit() for c in v):
            raise ValueError('Máº­t kháº©u pháº£i chá»©a Ã­t nháº¥t 1 chá»¯ sá»‘')
        if not any(c.isalpha() for c in v):
            raise ValueError('Máº­t kháº©u pháº£i chá»©a Ã­t nháº¥t 1 chá»¯ cÃ¡i')
        return v


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr = Field(..., description="Email Ä‘Äƒng nháº­p")
    password: str = Field(..., description="Máº­t kháº©u")


class UserUpdate(BaseModel):
    """User profile update request"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    avatar_url: Optional[str] = None


class PasswordChange(BaseModel):
    """Password change request"""
    old_password: str = Field(..., description="Máº­t kháº©u cÅ©")
    new_password: str = Field(..., min_length=8, description="Máº­t kháº©u má»›i")
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 8 kÃ½ tá»±')
        if not any(c.isdigit() for c in v):
            raise ValueError('Máº­t kháº©u pháº£i chá»©a Ã­t nháº¥t 1 chá»¯ sá»‘')
        if not any(c.isalpha() for c in v):
            raise ValueError('Máº­t kháº©u pháº£i chá»©a Ã­t nháº¥t 1 chá»¯ cÃ¡i')
        return v


class UserApproval(BaseModel):
    """Admin approval request"""
    status: Literal["approved", "rejected"] = Field(..., description="Quyáº¿t Ä‘á»‹nh duyá»‡t")
    role: Optional[Literal["admin", "manager", "analyst", "viewer"]] = Field(
        default="viewer",
        description="Vai trÃ² Ä‘Æ°á»£c gÃ¡n (náº¿u approved)"
    )
    rejection_reason: Optional[str] = Field(None, description="LÃ½ do tá»« chá»‘i (náº¿u rejected)")


# ==================== Response Schemas ====================

class UserBase(BaseModel):
    """User base information"""
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: str = Field(alias="_id", description="User ID")
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = Field(default=UserRole.VIEWER)
    status: str = Field(default=UserStatus.PENDING)
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None


class UserProfile(UserBase):
    """Full user profile (for authenticated user)"""
    reason: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None


class UserInDB(UserProfile):
    """User document in MongoDB (includes password hash)"""
    hashed_password: str


class UserPublic(UserBase):
    """Public user information (for admin listing)"""
    reason: Optional[str] = None


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiration in seconds")


class TokenData(BaseModel):
    """JWT token payload"""
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None


class LoginResponse(BaseModel):
    """Login success response"""
    user: UserBase
    token: Token
    message: str = "ÄÄƒng nháº­p thÃ nh cÃ´ng"


class RegisterResponse(BaseModel):
    """Registration success response"""
    user: UserBase
    message: str = "ÄÄƒng kÃ½ thÃ nh cÃ´ng. TÃ i khoáº£n Ä‘ang chá» duyá»‡t tá»« admin."


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    detail: Optional[str] = None


class UserStats(BaseModel):
    """Thá»‘ng kÃª ngÆ°á»i dÃ¹ng"""
    total_reports: int
    verified_reports: int
    accuracy_rate: float
    total_points: int
    current_level: int
    rank_in_district: Optional[int] = None
    rank_in_city: Optional[int] = None


class Token(BaseModel):
    """Schema JWT token"""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Payload trong JWT token"""
    sub: Optional[int] = None

