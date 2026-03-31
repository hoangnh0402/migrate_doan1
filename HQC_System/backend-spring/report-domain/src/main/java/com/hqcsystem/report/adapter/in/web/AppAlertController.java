package com.hqcsystem.report.adapter.in.web;

import com.hqcsystem.report.adapter.out.persistence.document.AlertDocument;
import com.hqcsystem.report.adapter.out.persistence.repository.AlertMongoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/app/alerts")
public class AppAlertController {

    private final AlertMongoRepository alertRepo;

    public AppAlertController(AlertMongoRepository alertRepo) {
        this.alertRepo = alertRepo;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAlert(@RequestBody CreateAlertRequest request) {
        AlertDocument doc = new AlertDocument();
        doc.setType(request.type);
        doc.setSeverity(request.severity);
        doc.setTitle(request.title);
        doc.setDescription(request.description);
        doc.setWard(request.ward);
        doc.setRecommendation(request.recommendation);
        doc.setImpact(request.impact);
        doc.setAffectedPopulation(request.affectedPopulation);
        doc.setIsAIGenerated(request.isAIGenerated != null ? request.isAIGenerated : false);
        doc.setStatus("active");
        doc.setCreatedAt(Instant.now());
        doc.setUpdatedAt(Instant.now());
        doc.setCreatedBy("system");

        AlertDocument saved = alertRepo.save(doc);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", toMap(saved), "message", "ÄÃ£ táº¡o cáº£nh bÃ¡o thÃ nh cÃ´ng"));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String ward,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int skip) {

        List<AlertDocument> alerts = alertRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Map<String, Object>> filtered = alerts.stream()
                .filter(a -> status == null || status.equals(a.getStatus()))
                .filter(a -> severity == null || severity.equals(a.getSeverity()))
                .filter(a -> ward == null || (a.getWard() != null && a.getWard().toLowerCase().contains(ward.toLowerCase())))
                .skip(skip).limit(limit)
                .map(this::toMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", filtered, "count", filtered.size()));
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveAlerts(
            @RequestParam(required = false) String ward,
            @RequestParam(defaultValue = "20") int limit) {
        List<AlertDocument> alerts = alertRepo.findByStatus("active", Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Map<String, Object>> result = alerts.stream()
                .filter(a -> ward == null || (a.getWard() != null && a.getWard().toLowerCase().contains(ward.toLowerCase())))
                .limit(limit)
                .map(this::toMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", result, "count", result.size()));
    }

    @PutMapping("/{alertId}")
    public ResponseEntity<Map<String, Object>> updateAlert(@PathVariable String alertId, @RequestBody CreateAlertRequest request) {
        Optional<AlertDocument> opt = alertRepo.findById(alertId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        AlertDocument doc = opt.get();
        doc.setType(request.type);
        doc.setSeverity(request.severity);
        doc.setTitle(request.title);
        doc.setDescription(request.description);
        doc.setWard(request.ward);
        doc.setRecommendation(request.recommendation);
        doc.setUpdatedAt(Instant.now());
        alertRepo.save(doc);

        return ResponseEntity.ok(Map.of("success", true, "message", "ÄÃ£ cáº­p nháº­t cáº£nh bÃ¡o"));
    }

    @PutMapping("/{alertId}/status")
    public ResponseEntity<Map<String, Object>> updateAlertStatus(@PathVariable String alertId, @RequestParam("new_status") String newStatus) {
        Optional<AlertDocument> opt = alertRepo.findById(alertId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        AlertDocument doc = opt.get();
        doc.setStatus(newStatus);
        doc.setUpdatedAt(Instant.now());
        alertRepo.save(doc);

        return ResponseEntity.ok(Map.of("success", true, "message", "ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i thÃ nh " + newStatus));
    }

    @DeleteMapping("/{alertId}")
    public ResponseEntity<Map<String, Object>> deleteAlert(@PathVariable String alertId) {
        if (!alertRepo.existsById(alertId)) return ResponseEntity.notFound().build();
        alertRepo.deleteById(alertId);
        return ResponseEntity.ok(Map.of("success", true, "message", "ÄÃ£ xÃ³a cáº£nh bÃ¡o"));
    }

    private Map<String, Object> toMap(AlertDocument doc) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("_id", doc.getId());
        map.put("type", doc.getType());
        map.put("severity", doc.getSeverity());
        map.put("title", doc.getTitle());
        map.put("description", doc.getDescription());
        map.put("ward", doc.getWard());
        map.put("recommendation", doc.getRecommendation());
        map.put("impact", doc.getImpact());
        map.put("affectedPopulation", doc.getAffectedPopulation());
        map.put("isAIGenerated", doc.getIsAIGenerated());
        map.put("status", doc.getStatus());
        map.put("createdAt", doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : null);
        map.put("updatedAt", doc.getUpdatedAt() != null ? doc.getUpdatedAt().toString() : null);
        return map;
    }

    public static class CreateAlertRequest {
        public String type;
        public String severity;
        public String title;
        public String description;
        public String ward;
        public String recommendation;
        public String impact;
        public String affectedPopulation;
        public Boolean isAIGenerated;
    }
}

