package com.citylens.report.adapter.in.web;

import com.citylens.report.adapter.out.persistence.repository.ReportMongoRepository;
import com.citylens.report.adapter.out.persistence.document.ReportDocument;
import com.citylens.infrastructure.event.EventPublisher;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/engagement")
public class EngagementController {

    private final ReportMongoRepository reportRepo;
    private final MongoTemplate mongoTemplate;
    private final EventPublisher eventPublisher;

    public EngagementController(ReportMongoRepository reportRepo, MongoTemplate mongoTemplate, EventPublisher eventPublisher) {
        this.reportRepo = reportRepo;
        this.mongoTemplate = mongoTemplate;
        this.eventPublisher = eventPublisher;
    }

    // ============ VOTE ENDPOINTS ============

    @PostMapping("/reports/{reportId}/vote")
    public ResponseEntity<Map<String, Object>> voteReport(
            @PathVariable String reportId,
            @RequestParam(name = "vote_type") String voteType,
            @RequestParam(name = "user_id") String userId) {

        if (!reportRepo.existsById(reportId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("detail", "Report not found"));
        }

        // Use MongoDB atomic operations to update vote counts
        Query query = new Query(Criteria.where("_id").is(reportId));
        Update update = new Update();
        if ("upvote".equals(voteType)) {
            update.inc("upvotes", 1);
        } else {
            update.inc("downvotes", 1);
        }
        mongoTemplate.updateFirst(query, update, ReportDocument.class);

        ReportDocument report = reportRepo.findById(reportId).orElse(null);
        int upvotes = report != null && report.getUpvotes() != null ? report.getUpvotes() : 0;
        int downvotes = report != null && report.getDownvotes() != null ? report.getDownvotes() : 0;

        // CQRS: Publish Report Voted Event for async processing (e.g. stats recalculation, badges)
        eventPublisher.publish("report.voted", Map.of(
            "report_id", reportId,
            "user_id", userId,
            "vote_type", voteType,
            "upvotes", upvotes,
            "downvotes", downvotes
        ));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("vote_type", voteType);
        response.put("upvotes", upvotes);
        response.put("downvotes", downvotes);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/reports/{reportId}/vote")
    public ResponseEntity<Void> removeVote(
            @PathVariable String reportId,
            @RequestParam(name = "user_id") String userId) {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports/{reportId}/votes")
    public ResponseEntity<Map<String, Object>> getReportVotes(@PathVariable String reportId) {
        Optional<ReportDocument> opt = reportRepo.findById(reportId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("detail", "Report not found"));
        }
        ReportDocument report = opt.get();
        int up = report.getUpvotes() != null ? report.getUpvotes() : 0;
        int down = report.getDownvotes() != null ? report.getDownvotes() : 0;

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("report_id", reportId);
        response.put("upvotes", up);
        response.put("downvotes", down);
        response.put("total", up + down);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports/{reportId}/my-vote")
    public ResponseEntity<Map<String, Object>> getMyVote(
            @PathVariable String reportId,
            @RequestParam(name = "user_id") String userId) {
        return ResponseEntity.ok(Map.of("vote_type", ""));
    }

    // ============ FOLLOW ENDPOINTS ============

    @PostMapping("/reports/{reportId}/follow")
    public ResponseEntity<Map<String, Object>> followReport(
            @PathVariable String reportId,
            @RequestParam(name = "user_id") String userId) {
        if (!reportRepo.existsById(reportId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("detail", "Report not found"));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("status", "success", "message", "Now following this report"));
    }

    @DeleteMapping("/reports/{reportId}/follow")
    public ResponseEntity<Void> unfollowReport(
            @PathVariable String reportId,
            @RequestParam(name = "user_id") String userId) {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports/{reportId}/is-following")
    public ResponseEntity<Map<String, Object>> checkFollowing(
            @PathVariable String reportId,
            @RequestParam(name = "user_id") String userId) {
        return ResponseEntity.ok(Map.of("is_following", false));
    }

    @GetMapping("/my-follows")
    public ResponseEntity<Map<String, Object>> getMyFollowedReports(
            @RequestParam(name = "user_id") String userId,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(Map.of("reports", Collections.emptyList(), "total", 0));
    }
}
