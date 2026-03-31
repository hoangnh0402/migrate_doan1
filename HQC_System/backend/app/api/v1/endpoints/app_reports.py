# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Mobile App Report Endpoints
API routes for mobile app report submission and management
Uses MongoDB Atlas
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional

from app.db.mongodb_atlas import get_mongodb_atlas
from app.db.mongodb import get_mongodb
from app.services.app_report_service import AppReportService
from app.services.app_auth_service import AppAuthService
from app.api.deps import get_current_admin
from app.schemas.app_report import (
    AppReportCreate,
    AppReportResponse,
    AppReportListResponse,
    AppReportUpdate,
    AppCommentCreate,
    AppCommentResponse,
    AppCommentListResponse
)
from app.services.app_comment_service import AppCommentService

router = APIRouter()


@router.post("/", response_model=AppReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: AppReportCreate,
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    Táº¡o má»™t bÃ¡o cÃ¡o má»›i (Mobile App)
    
    - **reportType**: Loáº¡i pháº£n Ã¡nh
    - **ward**: XÃ£/phÆ°á»ng
    - **addressDetail**: Sá»‘ nhÃ , thÃ´n/xÃ³m, khu vá»±c (optional)
    - **location**: GPS coordinates (optional)
    - **title**: TiÃªu Ä‘á» (optional)
    - **content**: Ná»™i dung pháº£n Ã¡nh
    - **media**: Danh sÃ¡ch áº£nh/video (optional)
    - **userId**: ID ngÆ°á»i dÃ¹ng (optional, náº¿u Ä‘Ã£ Ä‘Äƒng nháº­p)
    """
    report_service = AppReportService(db)
    
    report = await report_service.create_report(report_data)
    
    return AppReportResponse(
        success=True,
        data=report.dict(by_alias=True)
    )


@router.post("/admin", response_model=AppReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report_admin(
    report_data: AppReportCreate,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    Táº¡o bÃ¡o cÃ¡o má»›i tá»« Admin Dashboard
    
    Requires admin authentication via Bearer token (MongoDB Docker)
    Creates report in MongoDB Atlas
    """
    report_service = AppReportService(db)
    
    # Set admin user ID if not provided
    if not report_data.userId:
        report_data.userId = str(current_admin.get("_id", "admin"))
    
    report = await report_service.create_report(report_data)
    
    return AppReportResponse(
        success=True,
        data=report.dict(by_alias=True)
    )


@router.get("/", response_model=AppReportListResponse)
async def get_reports(
    status: Optional[str] = Query(None, description="Filter by status: pending, processing, resolved, rejected"),
    userId: Optional[str] = Query(None, description="Filter by user ID"),
    limit: int = Query(20, ge=1, le=100, description="Number of reports to return"),
    skip: int = Query(0, ge=0, description="Number of reports to skip"),
    include_media: bool = Query(True, description="Include media URLs (set to false for faster list loading)"),
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    Láº¥y danh sÃ¡ch bÃ¡o cÃ¡o (Mobile App) - Optimized
    
    Supports filtering by status and userId, with pagination
    Set include_media=false for faster loading (useful for map view)
    """
    report_service = AppReportService(db)
    
    reports = await report_service.get_reports(
        status=status,
        user_id=userId,
        limit=limit,
        skip=skip,
        include_media=include_media
    )
    
    # Get total count for pagination
    total_count = await report_service.get_reports_count(
        status=status,
        user_id=userId
    )
    
    return AppReportListResponse(
        success=True,
        data=reports,
        count=total_count
    )


@router.get("/summary/all", response_model=AppReportListResponse)
async def get_reports_summary(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=500, description="Number of reports to return"),
    skip: int = Query(0, ge=0, description="Number of reports to skip"),
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    Láº¥y summary cá»§a bÃ¡o cÃ¡o (tá»‘i Æ°u cho báº£n Ä‘á»“ - khÃ´ng cÃ³ media)
    
    Optimized endpoint for map view - returns minimal data without media
    Much faster than full report list
    """
    report_service = AppReportService(db)
    
    reports = await report_service.get_reports_summary(
        status=status,
        limit=limit,
        skip=skip
    )
    
    return AppReportListResponse(
        success=True,
        data=reports,
        count=len(reports)
    )


@router.get("/{report_id}", response_model=AppReportResponse)
async def get_report(
    report_id: str,
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    Láº¥y má»™t bÃ¡o cÃ¡o cá»¥ thá»ƒ (Mobile App)
    """
    report_service = AppReportService(db)
    
    report = await report_service.get_report_by_id(report_id)
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return AppReportResponse(
        success=True,
        data=report
    )


@router.put("/{report_id}", response_model=AppReportResponse)
async def update_report(
    report_id: str,
    update_data: AppReportUpdate,
    token: Optional[str] = Query(None, description="Admin token (optional if using Authorization header)"),
    authorization: Optional[str] = Header(None, description="Bearer token in Authorization header"),
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    Cáº­p nháº­t tráº¡ng thÃ¡i bÃ¡o cÃ¡o (Admin only)
    
    Supports:
    - Bearer token in Authorization header (from web dashboard or mobile app)
    - Token as query parameter
    """
    from app.services.auth_service import auth_service as web_auth_service
    
    # Get token from header or query param
    access_token = token
    if not access_token and authorization:
        if authorization.startswith("Bearer "):
            access_token = authorization[7:]
        else:
            access_token = authorization
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token khÃ´ng Ä‘Æ°á»£c cung cáº¥p"
        )
    
    is_authorized = False
    
    # Try web dashboard token first
    try:
        token_data = web_auth_service.decode_token(access_token)
        if token_data and token_data.email:
            # Web dashboard admin token is valid
            is_authorized = True
    except Exception:
        pass
    
    # If not authorized, try mobile app token
    if not is_authorized:
        try:
            app_auth_service = AppAuthService(db)
            payload = app_auth_service.decode_token(access_token)
            user_id = payload.get("userId")
            
            if user_id:
                user = await app_auth_service.get_user_by_id(user_id)
                if user and user.is_admin:
                    is_authorized = True
        except Exception:
            pass
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token khÃ´ng há»£p lá»‡ hoáº·c khÃ´ng cÃ³ quyá»n admin"
        )
    
    # Update report
    report_service = AppReportService(db)
    report = await report_service.update_report_status(
        report_id=report_id,
        new_status=update_data.status,
        admin_note=update_data.adminNote,
        title=update_data.title,
        content=update_data.content,
        report_type=update_data.reportType,
        ward=update_data.ward,
        address_detail=update_data.addressDetail
    )
    
    return AppReportResponse(
        success=True,
        data=report
    )


@router.delete("/{report_id}", response_model=dict)
async def delete_report(
    report_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    XÃ³a bÃ¡o cÃ¡o (Admin only)
    
    Requires admin authentication via Bearer token
    """
    try:
        # Delete report from MongoDB Atlas
        report_service = AppReportService(db)
        deleted = await report_service.delete_report(report_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        return {
            "success": True,
            "message": "Report deleted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting report: {str(e)}"
        )


@router.get("/stats/summary", response_model=dict)
async def get_report_stats(
    userId: Optional[str] = Query(None, description="Filter by user ID"),
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    Láº¥y thá»‘ng kÃª bÃ¡o cÃ¡o (Mobile App)
    """
    report_service = AppReportService(db)
    
    total = await report_service.count_reports(user_id=userId)
    pending = await report_service.count_reports(status="pending", user_id=userId)
    processing = await report_service.count_reports(status="processing", user_id=userId)
    resolved = await report_service.count_reports(status="resolved", user_id=userId)
    rejected = await report_service.count_reports(status="rejected", user_id=userId)
    
    return {
        "success": True,
        "data": {
            "total": total,
            "pending": pending,
            "processing": processing,
            "resolved": resolved,
            "rejected": rejected
        }
    }


# ============================================
# COMMENT ENDPOINTS
# ============================================

@router.post("/{report_id}/comments", response_model=AppCommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    report_id: str,
    comment_data: AppCommentCreate,
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    ThÃªm bÃ¬nh luáº­n vÃ o bÃ¡o cÃ¡o (Mobile App)
    
    - **report_id**: ID bÃ¡o cÃ¡o
    - **content**: Ná»™i dung bÃ¬nh luáº­n
    - **userId**: ID ngÆ°á»i dÃ¹ng (optional)
    - **userName**: TÃªn ngÆ°á»i dÃ¹ng (optional)
    """
    comment_service = AppCommentService(db)
    
    comment = await comment_service.create_comment(
        report_id=report_id,
        content=comment_data.content,
        user_id=comment_data.userId,
        user_name=comment_data.userName
    )
    
    return AppCommentResponse(
        success=True,
        data=comment
    )


@router.get("/{report_id}/comments", response_model=AppCommentListResponse)
async def get_comments(
    report_id: str,
    limit: int = Query(50, ge=1, le=200, description="Number of comments to return"),
    skip: int = Query(0, ge=0, description="Number of comments to skip"),
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    Láº¥y danh sÃ¡ch bÃ¬nh luáº­n cá»§a bÃ¡o cÃ¡o (Mobile App)
    
    - **report_id**: ID bÃ¡o cÃ¡o
    - **limit**: Sá»‘ lÆ°á»£ng tá»‘i Ä‘a
    - **skip**: PhÃ¢n trang
    """
    comment_service = AppCommentService(db)
    
    comments = await comment_service.get_comments(
        report_id=report_id,
        limit=limit,
        skip=skip
    )
    
    return AppCommentListResponse(
        success=True,
        data=comments,
        count=len(comments)
    )


@router.delete("/comments/{comment_id}", response_model=dict)
async def delete_comment(
    comment_id: str,
    userId: Optional[str] = Query(None, description="User ID (required to verify ownership)"),
    db: AsyncIOMotorDatabase = Depends(get_mongodb_atlas)
):
    """
    XÃ³a bÃ¬nh luáº­n (Mobile App)
    
    - **comment_id**: ID bÃ¬nh luáº­n
    - **userId**: ID ngÆ°á»i dÃ¹ng (required Ä‘á»ƒ xÃ¡c minh quyá»n sá»Ÿ há»¯u)
    """
    comment_service = AppCommentService(db)
    
    deleted = await comment_service.delete_comment(
        comment_id=comment_id,
        user_id=userId
    )
    
    return {
        "success": True,
        "message": "Comment deleted successfully"
    }

