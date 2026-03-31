package com.hqcsystem.assignment.application.service;

import com.hqcsystem.assignment.adapter.out.persistence.entity.DepartmentEntity;
import com.hqcsystem.assignment.adapter.out.persistence.entity.ReportAssignmentEntity;
import com.hqcsystem.assignment.adapter.out.persistence.repository.AssignmentJpaRepository;
import com.hqcsystem.assignment.adapter.out.persistence.repository.DepartmentJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AssignmentService {

    private final AssignmentJpaRepository assignmentRepo;
    private final DepartmentJpaRepository departmentRepo;

    public AssignmentService(AssignmentJpaRepository assignmentRepo, DepartmentJpaRepository departmentRepo) {
        this.assignmentRepo = assignmentRepo;
        this.departmentRepo = departmentRepo;
    }

    // ========= Department Operations =========

    @Transactional
    public DepartmentEntity createDepartment(DepartmentEntity department) {
        if (departmentRepo.existsByCode(department.getCode())) {
            throw new IllegalArgumentException("Department with code '" + department.getCode() + "' already exists");
        }
        return departmentRepo.save(department);
    }

    public List<DepartmentEntity> getDepartments(Boolean isActive) {
        if (Boolean.TRUE.equals(isActive)) {
            return departmentRepo.findByIsActiveTrueOrderByNameVi();
        }
        return departmentRepo.findAll();
    }

    public Optional<DepartmentEntity> getDepartment(Integer id) {
        return departmentRepo.findById(id);
    }

    @Transactional
    public DepartmentEntity updateDepartment(Integer id, Map<String, Object> updates) {
        DepartmentEntity dept = departmentRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Department not found"));

        if (updates.containsKey("name_vi")) dept.setNameVi((String) updates.get("name_vi"));
        if (updates.containsKey("name_en")) dept.setNameEn((String) updates.get("name_en"));
        if (updates.containsKey("description")) dept.setDescription((String) updates.get("description"));
        if (updates.containsKey("is_active")) dept.setIsActive((Boolean) updates.get("is_active"));
        if (updates.containsKey("sla_response_hours")) dept.setSlaResponseHours((Integer) updates.get("sla_response_hours"));
        if (updates.containsKey("sla_resolution_hours")) dept.setSlaResolutionHours((Integer) updates.get("sla_resolution_hours"));

        return departmentRepo.save(dept);
    }

    public Map<String, Object> getDepartmentStats(Integer departmentId) {
        DepartmentEntity dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new NoSuchElementException("Department not found"));

        long total = assignmentRepo.countByDepartmentId(departmentId);
        long completed = assignmentRepo.countByDepartmentIdAndStatus(departmentId, "completed");
        long inProgress = assignmentRepo.countByDepartmentIdAndStatus(departmentId, "accepted")
                + assignmentRepo.countByDepartmentIdAndStatus(departmentId, "working");
        long pending = assignmentRepo.countByDepartmentIdAndStatus(departmentId, "assigned");
        long rejected = assignmentRepo.countByDepartmentIdAndStatus(departmentId, "rejected");

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("department_id", departmentId);
        stats.put("department_name", dept.getNameVi());
        stats.put("total_assignments", total);
        stats.put("completed", completed);
        stats.put("in_progress", inProgress);
        stats.put("pending", pending);
        stats.put("rejected", rejected);
        stats.put("completion_rate", total > 0 ? (double) completed / total : 0.0);
        return stats;
    }

    // ========= Assignment Operations =========

    @Transactional
    public ReportAssignmentEntity createAssignment(ReportAssignmentEntity assignment) {
        return assignmentRepo.save(assignment);
    }

    public Optional<ReportAssignmentEntity> getAssignment(Integer id) {
        return assignmentRepo.findById(id);
    }

    public Map<String, Object> getDepartmentAssignments(Integer departmentId, String status, int skip, int limit) {
        PageRequest pageable = PageRequest.of(skip / Math.max(limit, 1), limit);
        Page<ReportAssignmentEntity> page;
        if (status != null && !status.isEmpty()) {
            page = assignmentRepo.findByDepartmentIdAndStatusOrderByCreatedAtDesc(departmentId, status, pageable);
        } else {
            page = assignmentRepo.findByDepartmentIdOrderByCreatedAtDesc(departmentId, pageable);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("assignments", page.getContent());
        result.put("total", page.getTotalElements());
        return result;
    }

    public Map<String, Object> getUserAssignments(Integer userId, String status, int skip, int limit) {
        PageRequest pageable = PageRequest.of(skip / Math.max(limit, 1), limit);
        Page<ReportAssignmentEntity> page;
        if (status != null && !status.isEmpty()) {
            page = assignmentRepo.findByAssignedToAndStatusOrderByCreatedAtDesc(userId, status, pageable);
        } else {
            page = assignmentRepo.findByAssignedToOrderByCreatedAtDesc(userId, pageable);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("assignments", page.getContent());
        result.put("total", page.getTotalElements());
        return result;
    }

    @Transactional
    public ReportAssignmentEntity acceptAssignment(Integer assignmentId, Integer userId, LocalDateTime estimatedCompletion, String notes) {
        ReportAssignmentEntity assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        if (!"assigned".equals(assignment.getStatus())) {
            throw new IllegalStateException("Assignment is not in 'assigned' status");
        }
        assignment.setStatus("accepted");
        assignment.setAssignedTo(userId);
        assignment.setAcceptedAt(LocalDateTime.now());
        assignment.setEstimatedCompletion(estimatedCompletion);
        if (notes != null) assignment.setNotes(notes);
        return assignmentRepo.save(assignment);
    }

    @Transactional
    public ReportAssignmentEntity rejectAssignment(Integer assignmentId, Integer userId, String rejectionReason) {
        ReportAssignmentEntity assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        assignment.setStatus("rejected");
        assignment.setRejectionReason(rejectionReason);
        return assignmentRepo.save(assignment);
    }

    @Transactional
    public ReportAssignmentEntity completeAssignment(Integer assignmentId, Integer userId, String resolutionNote, List<String> attachments) {
        ReportAssignmentEntity assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        assignment.setStatus("completed");
        assignment.setResolutionNote(resolutionNote);
        assignment.setResolutionAttachments(attachments);
        assignment.setCompletedAt(LocalDateTime.now());
        return assignmentRepo.save(assignment);
    }

    @Transactional
    public ReportAssignmentEntity addNote(Integer assignmentId, Integer userId, String note, String noteType) {
        ReportAssignmentEntity assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        List<Map<String, Object>> history = assignment.getNotesHistory();
        if (history == null) history = new ArrayList<>();
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("user_id", userId);
        entry.put("note", note);
        entry.put("type", noteType);
        entry.put("timestamp", LocalDateTime.now().toString());
        history.add(entry);
        assignment.setNotesHistory(history);
        return assignmentRepo.save(assignment);
    }

    @Transactional
    public int checkOverdueAssignments() {
        return assignmentRepo.markOverdueAssignments(LocalDateTime.now());
    }
}

