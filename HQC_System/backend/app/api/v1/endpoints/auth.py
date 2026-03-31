# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Authentication API Endpoints
User registration, login, profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta

from app.db.mongodb import get_mongodb
from app.api.deps import get_current_user, get_current_active_user
from app.services.auth_service import auth_service
from app.services.user_service import UserService
from app.schemas.user import (
    UserRegister, UserLogin, UserUpdate, PasswordChange,
    RegisterResponse, LoginResponse, UserBase, UserProfile,
    Token, MessageResponse
)
from app.core.config import settings

router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db = Depends(get_mongodb)
):
    """
    ÄÄƒng kÃ½ tÃ i khoáº£n má»›i cho web-dashboard
    
    - **email**: Email Ä‘Äƒng nháº­p (@HQC System.com hoáº·c email cÆ¡ quan nhÃ  nÆ°á»›c)
    - **password**: Máº­t kháº©u (tá»‘i thiá»ƒu 8 kÃ½ tá»±, cÃ³ chá»¯ vÃ  sá»‘)
    - **full_name**: Há» vÃ  tÃªn Ä‘áº§y Ä‘á»§
    - **phone**: Sá»‘ Ä‘iá»‡n thoáº¡i liÃªn há»‡
    - **department**: PhÃ²ng ban (Sá»Ÿ GTVT, Sá»Ÿ XD, UBND, ...)
    - **position**: Chá»©c vá»¥ (ChuyÃªn viÃªn, PhÃ³ giÃ¡m Ä‘á»‘c, ...)
    - **reason**: LÃ½ do cáº§n sá»­ dá»¥ng há»‡ thá»‘ng
    
    Sau khi Ä‘Äƒng kÃ½, tÃ i khoáº£n sáº½ á»Ÿ tráº¡ng thÃ¡i **PENDING** vÃ  cáº§n admin duyá»‡t.
    """
    user_service = UserService(db)
    
    # Create user
    new_user = await user_service.create_user(user_data)
    
    # Remove password from response
    new_user.pop("hashed_password", None)
    
    return {
        "user": new_user,
        "message": "ÄÄƒng kÃ½ thÃ nh cÃ´ng. TÃ i khoáº£n Ä‘ang chá» duyá»‡t tá»« admin."
    }


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: UserLogin,
    db = Depends(get_mongodb)
):
    """
    ÄÄƒng nháº­p vÃ o web-dashboard
    
    - **email**: Email Ä‘Ã£ Ä‘Äƒng kÃ½
    - **password**: Máº­t kháº©u
    
    Tráº£ vá» access token vÃ  refresh token Ä‘á»ƒ sá»­ dá»¥ng cho cÃ¡c request sau.
    """
    user_service = UserService(db)
    
    # Authenticate user
    user = await user_service.authenticate_user(credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoáº·c máº­t kháº©u khÃ´ng Ä‘Ãºng"
        )
    
    # Create tokens
    token_data = {
        "sub": user["email"],
        "user_id": user["_id"],
        "role": user["role"]
    }
    
    access_token = auth_service.create_access_token(
        data=token_data,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    refresh_token = auth_service.create_refresh_token(data=token_data)
    
    # Remove password from response
    user.pop("hashed_password", None)
    
    return {
        "user": user,
        "token": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        },
        "message": "ÄÄƒng nháº­p thÃ nh cÃ´ng"
    }


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_active_user)
):
    """
    Láº¥y thÃ´ng tin profile cá»§a user Ä‘ang Ä‘Äƒng nháº­p
    """
    # Remove password from response
    current_user.pop("hashed_password", None)
    
    return UserProfile(**current_user)


@router.put("/me", response_model=UserProfile)
async def update_current_user_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_active_user),
    db = Depends(get_mongodb)
):
    """
    Cáº­p nháº­t thÃ´ng tin profile cá»§a user Ä‘ang Ä‘Äƒng nháº­p
    
    - **full_name**: Há» vÃ  tÃªn
    - **phone**: Sá»‘ Ä‘iá»‡n thoáº¡i
    - **department**: PhÃ²ng ban
    - **position**: Chá»©c vá»¥
    - **avatar_url**: URL áº£nh Ä‘áº¡i diá»‡n
    """
    user_service = UserService(db)
    
    updated_user = await user_service.update_user_profile(
        current_user["_id"],
        update_data
    )
    
    # Remove password from response
    updated_user.pop("hashed_password", None)
    
    return UserProfile(**updated_user)


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_active_user),
    db = Depends(get_mongodb)
):
    """
    Äá»•i máº­t kháº©u
    
    - **old_password**: Máº­t kháº©u cÅ©
    - **new_password**: Máº­t kháº©u má»›i (tá»‘i thiá»ƒu 8 kÃ½ tá»±, cÃ³ chá»¯ vÃ  sá»‘)
    """
    user_service = UserService(db)
    
    await user_service.change_password(
        current_user["_id"],
        password_data.old_password,
        password_data.new_password
    )
    
    return MessageResponse(
        message="Äá»•i máº­t kháº©u thÃ nh cÃ´ng"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db = Depends(get_mongodb)
):
    """
    LÃ m má»›i access token báº±ng refresh token
    
    - **refresh_token**: Refresh token nháº­n Ä‘Æ°á»£c khi Ä‘Äƒng nháº­p
    """
    # Decode refresh token
    try:
        token_data = auth_service.decode_token(refresh_token)
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token khÃ´ng há»£p lá»‡"
        )
    
    # Verify user still exists and is active
    user_service = UserService(db)
    user = await user_service.get_user_by_id(token_data.user_id)
    
    if not user or user["status"] != "approved":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User khÃ´ng há»£p lá»‡"
        )
    
    # Create new tokens
    new_token_data = {
        "sub": user["email"],
        "user_id": user["_id"],
        "role": user["role"]
    }
    
    new_access_token = auth_service.create_access_token(
        data=new_token_data,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    new_refresh_token = auth_service.create_refresh_token(data=new_token_data)
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

