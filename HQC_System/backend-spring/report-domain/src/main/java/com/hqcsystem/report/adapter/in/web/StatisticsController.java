package com.hqcsystem.report.adapter.in.web;

import com.hqcsystem.report.application.port.in.ReportUseCase;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsController {

    private final ReportUseCase reportUseCase;

    public StatisticsController(ReportUseCase reportUseCase) {
        this.reportUseCase = reportUseCase;
    }

    @GetMapping("/overview")
    @Cacheable(value = "statistics", key = "'overview'")
    public ResponseEntity<Map<String, Object>> getOverview() {
        Map<String, Long> stats = reportUseCase.getReportStats(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("total_reports", stats.getOrDefault("total", 0L));

        Map<String, Long> byStatus = new LinkedHashMap<>();
        byStatus.put("pending", stats.getOrDefault("pending", 0L));
        byStatus.put("processing", stats.getOrDefault("processing", 0L));
        byStatus.put("resolved", stats.getOrDefault("resolved", 0L));
        byStatus.put("rejected", stats.getOrDefault("rejected", 0L));
        response.put("reports_by_status", byStatus);

        long total = stats.getOrDefault("total", 0L);
        long resolved = stats.getOrDefault("resolved", 0L);
        response.put("resolution_rate", total > 0 ? (double) resolved / total : 0.0);
        response.put("avg_resolution_time_hours", 0.0);
        response.put("active_users_30d", 0);
        response.put("reports_today", 0);
        response.put("reports_this_week", 0);
        response.put("reports_this_month", total);
        response.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategoryDistribution() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("total", 0);
        response.put("categories", Collections.emptyList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/heatmap")
    public ResponseEntity<List<Object>> getHeatmapData(
            @RequestParam(required = false) Double north,
            @RequestParam(required = false) Double south,
            @RequestParam(required = false) Double east,
            @RequestParam(required = false) Double west,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<Object>> getTimeSeries(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(name = "group_by", defaultValue = "day") String groupBy) {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Object>> getDepartmentStats() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/top-reporters")
    public ResponseEntity<List<Object>> getTopReporters(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/quick-stats")
    @Cacheable(value = "statistics", key = "'quick-stats'")
    public ResponseEntity<Map<String, Object>> getQuickStats() {
        Map<String, Long> stats = reportUseCase.getReportStats(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("pending_reports", stats.getOrDefault("pending", 0L));
        response.put("urgent_reports", 0);
        response.put("my_reports", 0);
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}

