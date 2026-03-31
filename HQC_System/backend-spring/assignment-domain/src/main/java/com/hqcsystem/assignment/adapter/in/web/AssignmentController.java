package com.hqcsystem.assignment.adapter.in.web;

import com.hqcsystem.assignment.adapter.out.persistence.entity.DepartmentEntity;
import com.hqcsystem.assignment.adapter.out.persistence.entity.ReportAssignmentEntity;
import com.hqcsystem.assignment.application.service.AssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // ========= Department Endpoints =========

    @PostMapping("/departments")
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, Object> body) {
        try {
            DepartmentEntity dept = new DepartmentEntity();
            dept.setCode((String) body.get("code"));
            dept.setNameVi((String) body.get("name_vi"));
            dept.setNameEn((String) body.get("name_en"));
            dept.setDescription((String) body.get("description"));
            if (body.containsKey("sla_response_hours")) dept.setSlaResponseHours((Integer) body.get("sla_response_hours"));
            if (body.containsKey("sla_resolution_hours")) dept.setSlaResolutionHours((Integer) body.get("sla_resolution_hours"));
            DepartmentEntity created = assignmentService.createDepartment(dept);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentEntity>> getDepartments(
            @RequestParam(name = "is_active", required = false) Boolean isActive) {
        return ResponseEntity.ok(assignmentService.getDepartments(isActive));
    }

    @GetMapping("/departments/{departmentId}")
    public ResponseEntity<?> getDepartment(@PathVariable Integer departmentId) {
        return assignmentService.getDepartment(departmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/departments/{departmentId}")
    public ResponseEntity<?> updateDepartment(
            @PathVariable Integer departmentId,
            @RequestBody Map<String, Object> body) {
        try {
            DepartmentEntity updated = assignmentService.updateDepartment(departmentId, body);
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "Department not found"));
        }
    }

    @GetMapping("/departments/{departmentId}/stats")
    public ResponseEntity<?> getDepartmentStats(@PathVariable Integer departmentId) {
        try {
            return ResponseEntity.ok(assignmentService.getDepartmentStats(departmentId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "Department not found"));
        }
    }

    @GetMapping("/departments/{departmentId}/assignments")
    public ResponseEntity<Map<String, Object>> getDepartmentAssignments(
            @PathVariable Integer departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(assignmentService.getDepartmentAssignments(departmentId, status, skip, limit));
    }

    // ========= Assignment Endpoints =========

    @PostMapping
    public ResponseEntity<?> createAssignment(
            @RequestBody Map<String, Object> body,
            @RequestParam(name = "user_id") Integer userId) {
        ReportAssignmentEntity assignment = new ReportAssignmentEntity();
        assignment.setReportId(UUID.fromString((String) body.get("report_id")));
        assignment.setDepartmentId((Integer) body.get("department_id"));
        assignment.setAssignedBy(userId);
        if (body.containsKey("assigned_to")) assignment.setAssignedTo((Integer) body.get("assigned_to"));
        if (body.containsKey("priority")) assignment.setPriority((Integer) body.get("priority"));
        if (body.containsKey("notes")) assignment.setNotes((String) body.get("notes"));

        ReportAssignmentEntity created = assignmentService.createAssignment(assignment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/reports/{reportId}/auto-assign")
    public ResponseEntity<Map<String, Object>> autoAssignReport(
            @PathVariable String reportId,
            @RequestParam(name = "user_id") Integer userId) {
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Auto-assignment not yet implemented - requires category-to-department mapping"
        ));
    }

    @GetMapping("/{assignmentId}")
    public ResponseEntity<?> getAssignment(@PathVariable Integer assignmentId) {
        return assignmentService.getAssignment(assignmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{assignmentId}/accept")
    public ResponseEntity<?> acceptAssignment(
            @PathVariable Integer assignmentId,
            @RequestBody Map<String, Object> body,
            @RequestParam(name = "user_id") Integer userId) {
        try {
            LocalDateTime estimated = body.containsKey("estimated_completion")
                    ? LocalDateTime.parse((String) body.get("estimated_completion"))
                    : null;
            ReportAssignmentEntity result = assignmentService.acceptAssignment(
                    assignmentId, userId, estimated, (String) body.get("notes"));
            return ResponseEntity.ok(result);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "Assignment not found"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }

    @PostMapping("/{assignmentId}/reject")
    public ResponseEntity<?> rejectAssignment(
            @PathVariable Integer assignmentId,
            @RequestBody Map<String, Object> body,
            @RequestParam(name = "user_id") Integer userId) {
        try {
            ReportAssignmentEntity result = assignmentService.rejectAssignment(
                    assignmentId, userId, (String) body.get("rejection_reason"));
            return ResponseEntity.ok(result);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "Assignment not found"));
        }
    }

    @PostMapping("/{assignmentId}/complete")
    public ResponseEntity<?> completeAssignment(
            @PathVariable Integer assignmentId,
            @RequestBody Map<String, Object> body,
            @RequestParam(name = "user_id") Integer userId) {
        try {
            @SuppressWarnings("unchecked")
            List<String> attachments = (List<String>) body.get("resolution_attachments");
            ReportAssignmentEntity result = assignmentService.completeAssignment(
                    assignmentId, userId, (String) body.get("resolution_note"), attachments);
            return ResponseEntity.ok(result);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "Assignment not found"));
        }
    }

    @PostMapping("/{assignmentId}/notes")
    public ResponseEntity<?> addNote(
            @PathVariable Integer assignmentId,
            @RequestBody Map<String, Object> body,
            @RequestParam(name = "user_id") Integer userId) {
        try {
            assignmentService.addNote(assignmentId, userId,
                    (String) body.get("note"), (String) body.getOrDefault("note_type", "update"));
            return ResponseEntity.ok(Map.of("status", "success", "note_added", true));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "Assignment not found"));
        }
    }

    @GetMapping("/my-assignments")
    public ResponseEntity<Map<String, Object>> getMyAssignments(
            @RequestParam(name = "user_id") Integer userId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(assignmentService.getUserAssignments(userId, status, skip, limit));
    }

    @PostMapping("/check-overdue")
    public ResponseEntity<Map<String, Object>> checkOverdue() {
        int count = assignmentService.checkOverdueAssignments();
        return ResponseEntity.ok(Map.of("status", "success", "overdue_count", count));
    }
}

