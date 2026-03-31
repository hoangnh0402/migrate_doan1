package com.hqcsystem.report.adapter.in.web;

import com.hqcsystem.report.adapter.out.persistence.document.CommentDocument;
import com.hqcsystem.report.adapter.out.persistence.repository.CommentMongoRepository;
import com.hqcsystem.report.adapter.out.persistence.repository.ReportMongoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/app/reports/{reportId}/comments")
public class CommentController {

    private final CommentMongoRepository commentRepo;
    private final ReportMongoRepository reportRepo;

    public CommentController(CommentMongoRepository commentRepo, ReportMongoRepository reportRepo) {
        this.commentRepo = commentRepo;
        this.reportRepo = reportRepo;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createComment(
            @PathVariable String reportId,
            @RequestBody CreateCommentRequest request) {

        if (!reportRepo.existsById(reportId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Report khÃ´ng tá»“n táº¡i"));
        }

        CommentDocument doc = new CommentDocument();
        doc.setReportId(reportId);
        doc.setUserId(request.userId);
        doc.setUserName(request.userName != null ? request.userName : "NgÆ°á»i dÃ¹ng");
        doc.setContent(request.content);
        doc.setCreatedAt(Instant.now());
        doc.setUpdatedAt(Instant.now());

        CommentDocument saved = commentRepo.save(doc);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("data", toMap(saved));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getComments(
            @PathVariable String reportId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int skip) {

        List<CommentDocument> comments = commentRepo.findByReportId(reportId, Sort.by(Sort.Direction.ASC, "createdAt"));
        long total = commentRepo.countByReportId(reportId);

        int end = Math.min(skip + limit, comments.size());
        List<CommentDocument> paged = skip < comments.size() ? comments.subList(skip, end) : Collections.emptyList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("data", paged.stream().map(this::toMap).collect(Collectors.toList()));
        response.put("total", total);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(
            @PathVariable String reportId,
            @PathVariable String commentId) {

        if (!commentRepo.existsById(commentId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Comment khÃ´ng tá»“n táº¡i"));
        }

        commentRepo.deleteById(commentId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "ÄÃ£ xÃ³a comment");
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toMap(CommentDocument doc) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("_id", doc.getId());
        map.put("reportId", doc.getReportId());
        map.put("userId", doc.getUserId());
        map.put("userName", doc.getUserName());
        map.put("content", doc.getContent());
        map.put("createdAt", doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : null);
        map.put("updatedAt", doc.getUpdatedAt() != null ? doc.getUpdatedAt().toString() : null);
        return map;
    }

    public static class CreateCommentRequest {
        public String content;
        public String userId;
        public String userName;
    }
}

