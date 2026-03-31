package com.hqcsystem.infrastructure.adapter.in.web;

import com.hqcsystem.infrastructure.persistence.entity.EntityDbEntry;
import com.hqcsystem.infrastructure.persistence.repository.EntityDbRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final EntityDbRepository entityDbRepository;
    private final ObjectMapper objectMapper;

    public AdminDashboardController(EntityDbRepository entityDbRepository) {
        this.entityDbRepository = entityDbRepository;
        this.objectMapper = new ObjectMapper();
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        LocalDateTime last24h = LocalDateTime.now().minus(24, ChronoUnit.HOURS);
        LocalDateTime last7d = LocalDateTime.now().minus(7, ChronoUnit.DAYS);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", Instant.now().toString());

        // Entity statistics
        Map<String, Object> entityStats = new LinkedHashMap<>();
        entityStats.put("weather", buildEntityStats("WeatherObserved", last24h, last7d));
        entityStats.put("air_quality", buildEntityStats("AirQualityObserved", last24h, last7d));
        entityStats.put("traffic", buildEntityStats("TrafficFlowObserved", last24h, last7d));
        entityStats.put("parking", Map.of("total", entityDbRepository.countByType("ParkingSpot"), "available", 0, "occupied", 0));
        entityStats.put("civic_issues", Map.of("total", entityDbRepository.countByType("CivicIssueTracking"), "open", 0, "closed", 0));
        response.put("entity_statistics", entityStats);

        // System health
        Map<String, String> systemHealth = new LinkedHashMap<>();
        systemHealth.put("database", "healthy");
        systemHealth.put("status", "healthy");
        response.put("system_health", systemHealth);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/real-time-metrics")
    public ResponseEntity<Map<String, Object>> getRealTimeMetrics() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", Instant.now().toString());

        // Latest weather
        response.put("weather", buildLatestMetric("WeatherObserved", List.of("temperature", "relativeHumidity", "weatherType")));

        // Latest AQI
        response.put("air_quality", buildLatestMetric("AirQualityObserved", List.of("aqi", "pm25", "pm10")));

        // Latest traffic
        response.put("traffic", buildLatestMetric("TrafficFlowObserved", List.of("intensity", "averageVehicleSpeed")));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/entity-counts")
    public ResponseEntity<Map<String, Object>> getEntityCounts() {
        List<Object[]> results = entityDbRepository.countGroupByType();
        Map<String, Object> counts = new LinkedHashMap<>();
        long total = 0;
        for (Object[] row : results) {
            String type = (String) row[0];
            Long count = (Long) row[1];
            counts.put(type, count);
            total += count;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", Instant.now().toString());
        response.put("entity_counts", counts);
        response.put("total_entities", total);
        return ResponseEntity.ok(response);
    }

    // =================== Helpers ===================

    private Map<String, Object> buildEntityStats(String type, LocalDateTime last24h, LocalDateTime last7d) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", entityDbRepository.countByType(type));
        stats.put("last_24h", entityDbRepository.countByTypeAndModifiedAtAfter(type, last24h));
        stats.put("last_7d", entityDbRepository.countByTypeAndModifiedAtAfter(type, last7d));
        return stats;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> buildLatestMetric(String type, List<String> fields) {
        Optional<EntityDbEntry> opt = entityDbRepository.findFirstByTypeOrderByModifiedAtDesc(type);
        Map<String, Object> latest = new LinkedHashMap<>();
        if (opt.isPresent()) {
            Map<String, Object> data = parseJsonb(opt.get().getData());
            for (String f : fields) {
                Object field = data.get(f);
                if (field instanceof Map) {
                    latest.put(f, ((Map<String, Object>) field).get("value"));
                }
            }
            latest.put("observed_at", opt.get().getModifiedAt());
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("latest", latest);
        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonb(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }
}

