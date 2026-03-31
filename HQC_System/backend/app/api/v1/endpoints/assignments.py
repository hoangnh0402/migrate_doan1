# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

"""
Assignment endpoints - PhÃ¢n cÃ´ng vÃ  quáº£n lÃ½ bÃ¡o cÃ¡o
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.db.postgres import get_db
from app.services.assignment_service import AssignmentService
from app.models.assignment import Department, ReportAssignment, AssignmentStatus
from app.models.user import User
from app.models.report import Report
from app.schemas.assignment import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentResponse,
    AssignmentListResponse,
    AssignmentAccept,
    AssignmentReject,
    AssignmentComplete,
    AssignmentNote,
    DepartmentStatsResponse
)

router = APIRouter()


# ============================================
# DEPARTMENT ENDPOINTS
# ============================================

@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    department_in: DepartmentCreate,
    db: Session = Depends(get_db)
):
    """
    Táº¡o department má»›i (Admin only)
    
    - **code**: MÃ£ department (unique)
    - **name_vi**: TÃªn tiáº¿ng Viá»‡t
    - **name_en**: TÃªn tiáº¿ng Anh
    - **categories**: Danh sÃ¡ch category codes phá»¥ trÃ¡ch
    - **districts**: Danh sÃ¡ch district IDs (optional)
    - **sla_response_hours**: Thá»i háº¡n pháº£n há»“i (máº·c Ä‘á»‹nh 24h)
    - **sla_resolution_hours**: Thá»i háº¡n giáº£i quyáº¿t (máº·c Ä‘á»‹nh 72h)
    """
    # Check unique code
    existing = db.query(Department).filter(Department.code == department_in.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department with code '{department_in.code}' already exists"
        )
    
    department = Department(**department_in.dict())
    db.add(department)
    db.commit()
    db.refresh(department)
    
    return department


@router.get("/departments", response_model=List[DepartmentResponse])
async def get_departments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    is_active: Optional[bool] = Query(None),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """
    Láº¥y danh sÃ¡ch departments
    
    - **is_active**: Lá»c theo tráº¡ng thÃ¡i active
    - **category**: Lá»c theo category phá»¥ trÃ¡ch
    """
    query = db.query(Department)
    
    if is_active is not None:
        query = query.filter(Department.is_active == is_active)
    
    if category:
        query = query.filter(Department.categories.contains([category]))
    
    departments = query.order_by(Department.name_vi).offset(skip).limit(limit).all()
    
    return departments


@router.get("/departments/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: int = Path(..., description="Department ID"),
    db: Session = Depends(get_db)
):
    """Láº¥y thÃ´ng tin chi tiáº¿t department"""
    department = db.query(Department).filter(Department.id == department_id).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    return department


@router.put("/departments/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: int = Path(..., description="Department ID"),
    department_update: DepartmentUpdate = ...,
    db: Session = Depends(get_db)
):
    """Cáº­p nháº­t department (Admin only)"""
    department = db.query(Department).filter(Department.id == department_id).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    # Update fields
    for key, value in department_update.dict(exclude_unset=True).items():
        setattr(department, key, value)
    
    db.commit()
    db.refresh(department)
    
    return department


@router.get("/departments/{department_id}/stats", response_model=DepartmentStatsResponse)
async def get_department_stats(
    department_id: int = Path(..., description="Department ID"),
    db: Session = Depends(get_db)
):
    """Thá»‘ng kÃª performance cá»§a department"""
    service = AssignmentService(db)
    
    try:
        stats = service.get_department_stats(department_id)
        return stats
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ============================================
# ASSIGNMENT ENDPOINTS
# ============================================

@router.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    assignment_in: AssignmentCreate,
    user_id: int = Query(..., description="User ID (assigned_by)"),
    db: Session = Depends(get_db)
):
    """
    Táº¡o phÃ¢n cÃ´ng má»›i
    
    - **report_id**: ID bÃ¡o cÃ¡o
    - **department_id**: ID department
    - **assigned_to**: ID cÃ¡ nhÃ¢n (optional)
    - **priority**: 1=urgent, 2=high, 3=normal, 4=low
    - **notes**: Ghi chÃº
    """
    # Check report exists
    report = db.query(Report).filter(Report.id == assignment_in.report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Check department exists
    department = db.query(Department).filter(Department.id == assignment_in.department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    service = AssignmentService(db)
    
    try:
        assignment = service.create_assignment(
            report_id=assignment_in.report_id,
            department_id=assignment_in.department_id,
            assigned_by=user_id,
            assigned_to=assignment_in.assigned_to,
            priority=assignment_in.priority,
            notes=assignment_in.notes
        )
        
        # Enrich response
        assignment.department_name = department.name_vi
        assignment.report_title = report.title
        
        return assignment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/reports/{report_id}/auto-assign")
async def auto_assign_report(
    report_id: int = Path(..., description="Report ID"),
    user_id: int = Query(..., description="User ID (system)"),
    db: Session = Depends(get_db)
):
    """
    Tá»± Ä‘á»™ng phÃ¢n cÃ´ng bÃ¡o cÃ¡o dá»±a trÃªn category vÃ  location
    
    Há»‡ thá»‘ng sáº½ tÃ¬m department phÃ¹ há»£p nháº¥t
    """
    service = AssignmentService(db)
    assignment = service.auto_assign_report(report_id, user_id)
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No suitable department found for this report"
        )
    
    return {
        "status": "success",
        "assignment_id": assignment.id,
        "department_id": assignment.department_id
    }


@router.post("/assignments/{assignment_id}/accept", response_model=AssignmentResponse)
async def accept_assignment(
    assignment_id: int = Path(..., description="Assignment ID"),
    accept_data: AssignmentAccept = ...,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Department tiáº¿p nháº­n phÃ¢n cÃ´ng
    
    - **estimated_completion**: Thá»i gian dá»± kiáº¿n hoÃ n thÃ nh
    - **notes**: Ghi chÃº
    """
    service = AssignmentService(db)
    
    try:
        assignment = service.accept_assignment(
            assignment_id=assignment_id,
            user_id=user_id,
            estimated_completion=accept_data.estimated_completion,
            notes=accept_data.notes
        )
        
        return assignment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/assignments/{assignment_id}/reject", response_model=AssignmentResponse)
async def reject_assignment(
    assignment_id: int = Path(..., description="Assignment ID"),
    reject_data: AssignmentReject = ...,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Department tá»« chá»‘i phÃ¢n cÃ´ng
    
    - **rejection_reason**: LÃ½ do tá»« chá»‘i (báº¯t buá»™c, min 10 kÃ½ tá»±)
    """
    service = AssignmentService(db)
    
    try:
        assignment = service.reject_assignment(
            assignment_id=assignment_id,
            user_id=user_id,
            rejection_reason=reject_data.rejection_reason
        )
        
        return assignment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/assignments/{assignment_id}/complete", response_model=AssignmentResponse)
async def complete_assignment(
    assignment_id: int = Path(..., description="Assignment ID"),
    complete_data: AssignmentComplete = ...,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    HoÃ n thÃ nh phÃ¢n cÃ´ng
    
    - **resolution_note**: BÃ¡o cÃ¡o káº¿t quáº£ (báº¯t buá»™c, min 10 kÃ½ tá»±)
    - **resolution_attachments**: Danh sÃ¡ch URL file Ä‘Ã­nh kÃ¨m
    """
    service = AssignmentService(db)
    
    try:
        assignment = service.complete_assignment(
            assignment_id=assignment_id,
            user_id=user_id,
            resolution_note=complete_data.resolution_note,
            resolution_attachments=complete_data.resolution_attachments
        )
        
        return assignment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/assignments/{assignment_id}/notes")
async def add_assignment_note(
    assignment_id: int = Path(..., description="Assignment ID"),
    note_data: AssignmentNote = ...,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    ThÃªm ghi chÃº vÃ o assignment
    
    - **note**: Ná»™i dung ghi chÃº
    - **note_type**: update, issue, solution, escalation
    """
    service = AssignmentService(db)
    
    try:
        assignment = service.add_note(
            assignment_id=assignment_id,
            user_id=user_id,
            note=note_data.note,
            note_type=note_data.note_type
        )
        
        return {
            "status": "success",
            "note_added": True,
            "total_notes": len(assignment.notes or [])
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(
    assignment_id: int = Path(..., description="Assignment ID"),
    db: Session = Depends(get_db)
):
    """Láº¥y chi tiáº¿t assignment"""
    assignment = db.query(ReportAssignment).filter(
        ReportAssignment.id == assignment_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Enrich with related data
    department = db.query(Department).filter(Department.id == assignment.department_id).first()
    report = db.query(Report).filter(Report.id == assignment.report_id).first()
    
    if department:
        assignment.department_name = department.name_vi
    if report:
        assignment.report_title = report.title
    if assignment.assigned_to:
        user = db.query(User).filter(User.id == assignment.assigned_to).first()
        if user:
            assignment.assigned_to_name = user.full_name or user.username
    
    return assignment


@router.get("/departments/{department_id}/assignments", response_model=AssignmentListResponse)
async def get_department_assignments(
    department_id: int = Path(..., description="Department ID"),
    status: Optional[AssignmentStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Láº¥y danh sÃ¡ch phÃ¢n cÃ´ng cá»§a department
    
    - **status**: Lá»c theo tráº¡ng thÃ¡i (assigned, accepted, working, completed, rejected)
    - **skip, limit**: PhÃ¢n trang
    """
    service = AssignmentService(db)
    assignments, total = service.get_department_assignments(
        department_id=department_id,
        status=status,
        skip=skip,
        limit=limit
    )
    
    return {
        "assignments": assignments,
        "total": total
    }


@router.get("/my-assignments", response_model=AssignmentListResponse)
async def get_my_assignments(
    user_id: int = Query(..., description="User ID"),
    status: Optional[AssignmentStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Láº¥y danh sÃ¡ch phÃ¢n cÃ´ng cá»§a user (government staff)
    
    - **status**: Lá»c theo tráº¡ng thÃ¡i
    - **skip, limit**: PhÃ¢n trang
    """
    service = AssignmentService(db)
    assignments, total = service.get_user_assignments(
        user_id=user_id,
        status=status,
        skip=skip,
        limit=limit
    )
    
    return {
        "assignments": assignments,
        "total": total
    }


@router.post("/assignments/check-overdue")
async def check_overdue_assignments(
    db: Session = Depends(get_db)
):
    """
    Kiá»ƒm tra vÃ  Ä‘Ã¡nh dáº¥u assignments quÃ¡ háº¡n
    
    Endpoint nÃ y nÃªn Ä‘Æ°á»£c gá»i Ä‘á»‹nh ká»³ (cron job)
    """
    service = AssignmentService(db)
    count = service.check_overdue_assignments()
    
    return {
        "status": "success",
        "overdue_count": count
    }

