# Copyright (c) 2025 CityLens Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Statistics API Endpoints
Dashboard analytics, heatmaps, trends, performance metrics
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.services.statistics_service import get_statistics_service


router = APIRouter(prefix="/statistics", tags=["Statistics"])


# ============================================================================
# SCHEMAS
# ============================================================================

class OverviewStatsResponse(BaseModel):
    total_reports: int
    reports_by_status: Dict[str, int]
    resolution_rate: float
    avg_resolution_time_hours: float
    active_users_30d: int
    reports_today: int
    reports_this_week: int
    reports_this_month: int
    timestamp: str


class CategoryStats(BaseModel):
    category: str
    count: int
    percentage: float


class CategoryDistributionResponse(BaseModel):
    total: int
    categories: List[CategoryStats]


class HeatmapPoint(BaseModel):
    id: int
    lat: float
    lon: float
    intensity: float
    status: Optional[str]
    category: str


class TimeSeriesPoint(BaseModel):
    date: str
    total: int
    resolved: int
    pending: int
    resolution_rate: float


class DepartmentStats(BaseModel):
    department_id: int
    department_name: str
    total_assigned: int
    completed: int
    in_progress: int
    overdue: int
    avg_response_time_hours: float
    avg_resolution_time_hours: float
    completion_rate: float


class TopReporter(BaseModel):
    user_id: int
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    report_count: int
    reputation_score: float


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/overview", response_model=OverviewStatsResponse)
async def get_overview_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get high-level overview statistics for dashboard
    """
    try:
        stats_service = get_statistics_service(db)
        stats = stats_service.get_overview_stats()
        return OverviewStatsResponse(**stats)
    except Exception as e:
        # Return safe defaults when Report tables/columns are unavailable
        return OverviewStatsResponse(
            total_reports=0,
            reports_by_status={},
            resolution_rate=0.0,
            avg_resolution_time_hours=0.0,
            active_users_30d=0,
            reports_today=0,
            reports_this_week=0,
            reports_this_month=0,
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/categories", response_model=CategoryDistributionResponse)
async def get_category_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get report distribution by category
    """
    try:
        stats_service = get_statistics_service(db)
        distribution = stats_service.get_category_distribution()
        return CategoryDistributionResponse(**distribution)
    except Exception:
        return CategoryDistributionResponse(total=0, categories=[])


@router.get("/heatmap", response_model=List[HeatmapPoint])
async def get_heatmap_data(
    north: Optional[float] = Query(None, description="North bound latitude"),
    south: Optional[float] = Query(None, description="South bound latitude"),
    east: Optional[float] = Query(None, description="East bound longitude"),
    west: Optional[float] = Query(None, description="West bound longitude"),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    days: int = Query(30, ge=1, le=365, description="Number of days to include"),
    db: Session = Depends(get_db)
):
    """
    Get heatmap data for geographic visualization
    """
    try:
        stats_service = get_statistics_service(db)
        bounds = None
        if all([north, south, east, west]):
            bounds = {"north": north, "south": south, "east": east, "west": west}
        points = stats_service.get_heatmap_data(bounds=bounds, status=status, category=category, days=days)
        return [HeatmapPoint(**p) for p in points]
    except Exception:
        return []


@router.get("/trends", response_model=List[TimeSeriesPoint])
async def get_time_series_trends(
    days: int = Query(30, ge=7, le=365, description="Number of days"),
    group_by: str = Query("day", regex="^(day|week|month)$", description="Grouping interval"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get time series data for trend analysis
    """
    try:
        stats_service = get_statistics_service(db)
        data = stats_service.get_time_series(days=days, group_by=group_by)
        return [TimeSeriesPoint(**point) for point in data]
    except Exception:
        return []


@router.get("/departments", response_model=List[DepartmentStats])
async def get_department_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get performance statistics by department
    """
    try:
        stats_service = get_statistics_service(db)
        stats = stats_service.get_department_stats()
        return [DepartmentStats(**dept) for dept in stats]
    except Exception:
        return []


@router.get("/top-reporters", response_model=List[TopReporter])
async def get_top_reporters(
    limit: int = Query(10, ge=1, le=50, description="Number of top reporters"),
    db: Session = Depends(get_db)
):
    """
    Get users with most reports (leaderboard)
    """
    try:
        stats_service = get_statistics_service(db)
        reporters = stats_service.get_top_reporters(limit=limit)
        return [TopReporter(**r) for r in reporters]
    except Exception:
        return []


@router.get("/quick-stats")
async def get_quick_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get quick stats for header/navbar display
    """
    try:
        from app.models.report import Report, ReportStatus, ReportPriority

        pending_count = db.query(Report).filter(
            Report.status == ReportStatus.PENDING
        ).count()

        urgent_count = db.query(Report).filter(
            Report.priority == ReportPriority.URGENT,
            Report.status.in_([ReportStatus.PENDING, ReportStatus.VERIFIED])
        ).count()

        return {
            "pending_reports": pending_count,
            "urgent_reports": urgent_count,
            "my_reports": 0,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception:
        return {
            "pending_reports": 0,
            "urgent_reports": 0,
            "my_reports": 0,
            "timestamp": datetime.utcnow().isoformat()
        }
