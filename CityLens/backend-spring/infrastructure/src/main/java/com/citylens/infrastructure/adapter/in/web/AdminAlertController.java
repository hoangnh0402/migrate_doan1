package com.citylens.infrastructure.adapter.in.web;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/alerts")
public class AdminAlertController {

    private final JdbcTemplate jdbcTemplate;

    public AdminAlertController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveAlerts(
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "50") int limit) {
        List<Map<String, Object>> alerts = new ArrayList<>();

        try {
            // Traffic congestion alerts
            String trafficSql = "SELECT id, location, intensity, \"averageVehicleSpeed\", \"congestionLevel\", " +
                    "\"dateObserved\" FROM \"TrafficFlowObserved\" " +
                    "WHERE \"dateObserved\" >= NOW() - INTERVAL '1 hour' AND intensity > 0.7 " +
                    "ORDER BY intensity DESC LIMIT 20";
            List<Map<String, Object>> trafficRows = jdbcTemplate.queryForList(trafficSql);
            for (Map<String, Object> row : trafficRows) {
                Double intensity = ((Number) row.get("intensity")).doubleValue();
                String alertSeverity = intensity > 0.9 ? "critical" : "warning";
                if (severity == null || severity.equals(alertSeverity)) {
                    Map<String, Object> alert = new LinkedHashMap<>();
                    alert.put("id", "traffic_" + row.get("id"));
                    alert.put("type", "traffic_congestion");
                    alert.put("severity", alertSeverity);
                    alert.put("title", "Heavy Traffic Detected");
                    alert.put("description", String.format("Traffic intensity at %.0f%% on %s", intensity * 100, row.get("location")));
                    alert.put("location", row.get("location"));
                    alert.put("timestamp", row.get("dateObserved"));
                    alert.put("status", "active");
                    alert.put("metadata", Map.of(
                            "intensity", intensity,
                            "average_speed", row.getOrDefault("averageVehicleSpeed", 0),
                            "congestion_level", row.getOrDefault("congestionLevel", "unknown")));
                    alerts.add(alert);
                }
            }

            // Air quality alerts
            String aqiSql = "SELECT id, location, address, aqi, \"airQualityIndex\", pm25, pm10, " +
                    "\"dateObserved\" FROM \"AirQualityObserved\" " +
                    "WHERE \"dateObserved\" >= NOW() - INTERVAL '1 hour' AND aqi > 100 " +
                    "ORDER BY aqi DESC LIMIT 20";
            List<Map<String, Object>> aqiRows = jdbcTemplate.queryForList(aqiSql);
            for (Map<String, Object> row : aqiRows) {
                int aqi = ((Number) row.get("aqi")).intValue();
                String alertSeverity = aqi > 200 ? "critical" : (aqi > 150 ? "warning" : "info");
                if (severity == null || severity.equals(alertSeverity)) {
                    Map<String, Object> alert = new LinkedHashMap<>();
                    alert.put("id", "aqi_" + row.get("id"));
                    alert.put("type", "air_quality");
                    alert.put("severity", alertSeverity);
                    alert.put("title", "Poor Air Quality - AQI " + aqi);
                    alert.put("description", row.get("airQualityIndex") + " air quality at " + row.get("address"));
                    alert.put("location", row.get("location"));
                    alert.put("timestamp", row.get("dateObserved"));
                    alert.put("status", "active");
                    alert.put("metadata", Map.of("aqi", aqi, "pm25", row.getOrDefault("pm25", 0), "pm10", row.getOrDefault("pm10", 0)));
                    alerts.add(alert);
                }
            }

            // Civic issue alerts
            String civicSql = "SELECT id, title, description, location, category, \"subCategory\", priority, status, " +
                    "\"dateCreated\" FROM \"CivicIssueTracking\" " +
                    "WHERE status IN ('open','in_progress') AND priority = 'high' " +
                    "ORDER BY \"dateCreated\" DESC LIMIT 20";
            List<Map<String, Object>> civicRows = jdbcTemplate.queryForList(civicSql);
            for (Map<String, Object> row : civicRows) {
                if (severity == null || "critical".equals(severity)) {
                    Map<String, Object> alert = new LinkedHashMap<>();
                    alert.put("id", "civic_" + row.get("id"));
                    alert.put("type", "civic_issue");
                    alert.put("severity", "critical");
                    alert.put("title", row.get("title"));
                    alert.put("description", row.getOrDefault("description", "High priority " + row.get("category") + " issue"));
                    alert.put("location", row.get("location"));
                    alert.put("timestamp", row.get("dateCreated"));
                    alert.put("status", "open");
                    alert.put("metadata", Map.of("category", row.getOrDefault("category", ""), "priority", row.getOrDefault("priority", "")));
                    alerts.add(alert);
                }
            }
        } catch (Exception e) {
            // Return empty list on error
        }

        alerts.sort((a, b) -> String.valueOf(b.get("timestamp")).compareTo(String.valueOf(a.get("timestamp"))));
        return ResponseEntity.ok(alerts.size() > limit ? alerts.subList(0, limit) : alerts);
    }

    @GetMapping("/history")
    @Cacheable(value = "admin-alerts", key = "'history_' + #days")
    public ResponseEntity<Map<String, Object>> getAlertHistory(
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(name = "alert_type", required = false) String alertType,
            @RequestParam(required = false) String severity) {

        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("period", "last_" + days + "_days");
        summary.put("start_date", startDate.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        summary.put("end_date", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        try {
            int trafficCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM \"TrafficFlowObserved\" WHERE \"dateObserved\" >= ? AND intensity > 0.7",
                    Integer.class, startDate);
            int aqiWarning = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM \"AirQualityObserved\" WHERE \"dateObserved\" >= ? AND aqi > 100 AND aqi <= 200",
                    Integer.class, startDate);
            int aqiCritical = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM \"AirQualityObserved\" WHERE \"dateObserved\" >= ? AND aqi > 200",
                    Integer.class, startDate);
            int civicHigh = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM \"CivicIssueTracking\" WHERE \"dateCreated\" >= ? AND priority = 'high'",
                    Integer.class, startDate);

            int total = trafficCount + aqiWarning + aqiCritical + civicHigh;
            summary.put("total_alerts", total);
            summary.put("by_type", Map.of("traffic_congestion", trafficCount, "air_quality", aqiWarning + aqiCritical, "civic_issue", civicHigh));
            summary.put("by_severity", Map.of("info", 0, "warning", trafficCount + aqiWarning, "critical", aqiCritical + civicHigh));
        } catch (Exception e) {
            summary.put("total_alerts", 0);
            summary.put("by_type", Map.of());
            summary.put("by_severity", Map.of("info", 0, "warning", 0, "critical", 0));
        }

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/acknowledge/{alertId}")
    public ResponseEntity<Map<String, Object>> acknowledgeAlert(
            @PathVariable String alertId,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;

        String[] parts = alertId.split("_", 2);
        if (parts.length != 2) {
            return ResponseEntity.badRequest().body(Map.of("detail", "Invalid alert ID format"));
        }

        if ("civic".equals(parts[0])) {
            try {
                jdbcTemplate.update(
                        "UPDATE \"CivicIssueTracking\" SET status = 'in_progress', \"dateUpdated\" = NOW() WHERE id = ? AND status = 'open'",
                        Integer.parseInt(parts[1]));
            } catch (Exception e) {
                // Ignore errors
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Alert acknowledged successfully");
        response.put("alert_id", alertId);
        response.put("acknowledged_at", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistics")
    @Cacheable(value = "admin-alerts", key = "'stats_' + #days")
    public ResponseEntity<Map<String, Object>> getAlertStatistics(
            @RequestParam(defaultValue = "30") int days) {

        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("period", "last_" + days + "_days");

        try {
            // Top congested locations
            List<Map<String, Object>> topCongested = jdbcTemplate.queryForList(
                    "SELECT location, COUNT(*) as count, AVG(intensity) as avg_intensity " +
                            "FROM \"TrafficFlowObserved\" WHERE \"dateObserved\" >= ? AND intensity > 0.7 " +
                            "GROUP BY location ORDER BY count DESC LIMIT 10", startDate);
            result.put("top_congested_locations", topCongested);

            // Worst AQI locations
            List<Map<String, Object>> worstAqi = jdbcTemplate.queryForList(
                    "SELECT address as location, COUNT(*) as count, AVG(aqi) as avg_aqi, MAX(aqi) as max_aqi " +
                            "FROM \"AirQualityObserved\" WHERE \"dateObserved\" >= ? AND aqi > 100 " +
                            "GROUP BY address ORDER BY avg_aqi DESC LIMIT 10", startDate);
            result.put("worst_air_quality_locations", worstAqi);

            // Civic issues by category
            List<Map<String, Object>> civicByCategory = jdbcTemplate.queryForList(
                    "SELECT category, COUNT(*) as count FROM \"CivicIssueTracking\" " +
                            "WHERE \"dateCreated\" >= ? AND priority = 'high' GROUP BY category", startDate);
            Map<String, Object> civicMap = new LinkedHashMap<>();
            for (Map<String, Object> row : civicByCategory) {
                civicMap.put(String.valueOf(row.get("category")), row.get("count"));
            }
            result.put("civic_issues_by_category", civicMap);
        } catch (Exception e) {
            result.put("top_congested_locations", Collections.emptyList());
            result.put("worst_air_quality_locations", Collections.emptyList());
            result.put("civic_issues_by_category", Map.of());
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/recommendations")
    @Cacheable(value = "admin-alerts", key = "'recommendations'")
    public ResponseEntity<Map<String, Object>> getAlertRecommendations() {
        List<Map<String, Object>> recommendations = new ArrayList<>();

        try {
            // Recurring congestion check
            List<Map<String, Object>> congested = jdbcTemplate.queryForList(
                    "SELECT location, COUNT(*) as count FROM \"TrafficFlowObserved\" " +
                            "WHERE \"dateObserved\" >= NOW() - INTERVAL '2 hours' AND intensity > 0.8 " +
                            "GROUP BY location HAVING COUNT(*) > 3");
            for (Map<String, Object> loc : congested) {
                recommendations.add(Map.of(
                        "type", "traffic_management",
                        "priority", "high",
                        "title", "Recurring Congestion at " + loc.get("location"),
                        "description", "Detected " + loc.get("count") + " high congestion events in the last 2 hours",
                        "action", "Consider traffic signal optimization or alternative route suggestions",
                        "location", String.valueOf(loc.get("location"))
                ));
            }

            // Poor AQI
            List<Map<String, Object>> poorAqi = jdbcTemplate.queryForList(
                    "SELECT address, AVG(aqi) as avg_aqi FROM \"AirQualityObserved\" " +
                            "WHERE \"dateObserved\" >= NOW() - INTERVAL '2 hours' GROUP BY address HAVING AVG(aqi) > 150");
            for (Map<String, Object> area : poorAqi) {
                recommendations.add(Map.of(
                        "type", "air_quality_management",
                        "priority", "critical",
                        "title", "Sustained Poor Air Quality in " + area.get("address"),
                        "description", String.format("Average AQI of %.0f detected", ((Number) area.get("avg_aqi")).doubleValue()),
                        "action", "Issue public health advisory and consider traffic restrictions",
                        "location", String.valueOf(area.get("address"))
                ));
            }

            // Unresolved high-priority civic issues (> 3 days old)
            int oldIssues = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM \"CivicIssueTracking\" WHERE status = 'open' AND priority = 'high' " +
                            "AND \"dateCreated\" < NOW() - INTERVAL '3 days'", Integer.class);
            if (oldIssues > 0) {
                recommendations.add(Map.of(
                        "type", "civic_issue_management",
                        "priority", "high",
                        "title", oldIssues + " High Priority Issues Unresolved",
                        "description", "Issues older than 3 days need attention",
                        "action", "Review and assign resources to pending high-priority civic issues",
                        "location", "citywide"
                ));
            }
        } catch (Exception e) {
            // Return empty recommendations on error
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("total_recommendations", recommendations.size());
        response.put("recommendations", recommendations);
        return ResponseEntity.ok(response);
    }
}
