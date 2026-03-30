package com.citylens.infrastructure.adapter.in.web;

import com.citylens.infrastructure.persistence.entity.EntityDbEntry;
import com.citylens.infrastructure.persistence.repository.EntityDbRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/realtime")
public class RealtimeController {

    private final EntityDbRepository entityDbRepository;
    private final ObjectMapper objectMapper;

    private static final double DEFAULT_LAT = 21.028511;
    private static final double DEFAULT_LON = 105.804817;

    public RealtimeController(EntityDbRepository entityDbRepository) {
        this.entityDbRepository = entityDbRepository;
        this.objectMapper = new ObjectMapper();
    }

    @GetMapping("/weather/latest")
    public ResponseEntity<Map<String, Object>> getLatestWeather(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "Hanoi") String city) {

        double lat = latitude != null ? latitude : DEFAULT_LAT;
        double lon = longitude != null ? longitude : DEFAULT_LON;

        Optional<EntityDbEntry> opt = entityDbRepository.findFirstByTypeOrderByCreatedAtDesc("WeatherObserved");
        if (opt.isPresent()) {
            Map<String, Object> ngsiData = parseJsonb(opt.get().getData());

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("timestamp", extractValue(ngsiData, "dateObserved", Instant.now().toString()));
            response.put("source", "database");
            response.put("location", buildLocation(lat, lon, city));
            response.put("weather", buildWeather(ngsiData));
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(buildWeatherStub(lat, lon, city));
    }

    @GetMapping("/aqi/latest")
    public ResponseEntity<Map<String, Object>> getLatestAqi(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "hanoi") String city) {

        double lat = latitude != null ? latitude : DEFAULT_LAT;
        double lon = longitude != null ? longitude : DEFAULT_LON;

        Optional<EntityDbEntry> opt = entityDbRepository.findFirstByTypeOrderByCreatedAtDesc("AirQualityObserved");
        if (opt.isPresent()) {
            Map<String, Object> ngsiData = parseJsonb(opt.get().getData());
            int aqiValue = extractIntValue(ngsiData, "airQualityIndex", 0);
            Map<String, Object> aqiInfo = getAqiLevel(aqiValue);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("timestamp", extractValue(ngsiData, "dateObserved", Instant.now().toString()));
            response.put("source", "database");
            response.put("location", buildAqiLocation(lat, lon, city, extractStringValue(ngsiData, "refPointOfInterest", "Stub Station")));

            Map<String, Object> aqi = new LinkedHashMap<>(aqiInfo);
            aqi.put("value", aqiValue);
            response.put("aqi", aqi);
            response.put("pollutants", buildPollutants(ngsiData));
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(buildAqiStub(lat, lon, city));
    }

    @GetMapping("/traffic/latest")
    public ResponseEntity<Map<String, Object>> getLatestTraffic(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {

        Optional<EntityDbEntry> opt = entityDbRepository.findFirstByTypeOrderByCreatedAtDesc("TrafficFlowObserved");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", Instant.now().toString());
        if (opt.isPresent()) {
            Map<String, Object> ngsiData = parseJsonb(opt.get().getData());
            Map<String, Object> traffic = new LinkedHashMap<>();
            traffic.put("intensity", extractValueObj(ngsiData, "intensity"));
            traffic.put("averageSpeed", extractValueObj(ngsiData, "averageVehicleSpeed"));
            traffic.put("observedAt", opt.get().getModifiedAt());
            response.put("source", "database");
            response.put("traffic", traffic);
        } else {
            response.put("source", "stub");
            response.put("traffic", Map.of("intensity", 0, "averageSpeed", 0));
        }
        return ResponseEntity.ok(response);
    }

    // =================== Helpers ===================

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonb(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    @SuppressWarnings("unchecked")
    private Object extractValue(Map<String, Object> data, String key, Object defaultVal) {
        Object field = data.get(key);
        if (field instanceof Map) return ((Map<String, Object>) field).getOrDefault("value", defaultVal);
        return defaultVal;
    }

    @SuppressWarnings("unchecked")
    private Object extractValueObj(Map<String, Object> data, String key) {
        Object field = data.get(key);
        if (field instanceof Map) return ((Map<String, Object>) field).get("value");
        return null;
    }

    @SuppressWarnings("unchecked")
    private int extractIntValue(Map<String, Object> data, String key, int defaultVal) {
        Object val = extractValue(data, key, defaultVal);
        if (val instanceof Number) return ((Number) val).intValue();
        return defaultVal;
    }

    @SuppressWarnings("unchecked")
    private String extractStringValue(Map<String, Object> data, String key, String defaultVal) {
        Object val = extractValue(data, key, defaultVal);
        return val != null ? val.toString() : defaultVal;
    }

    private Map<String, Object> buildLocation(double lat, double lon, String city) {
        Map<String, Object> loc = new LinkedHashMap<>();
        loc.put("latitude", lat);
        loc.put("longitude", lon);
        loc.put("city", city);
        loc.put("country", "Vietnam");
        return loc;
    }

    private Map<String, Object> buildAqiLocation(double lat, double lon, String city, String station) {
        Map<String, Object> loc = buildLocation(lat, lon, city);
        loc.put("station", station);
        return loc;
    }

    private Map<String, Object> buildWeather(Map<String, Object> data) {
        Map<String, Object> w = new LinkedHashMap<>();
        w.put("temperature", extractValueObj(data, "temperature"));
        w.put("feels_like", extractValueObj(data, "feelsLikeTemperature"));
        w.put("humidity", extractValueObj(data, "humidity"));
        w.put("pressure", extractValueObj(data, "pressure"));
        w.put("description", extractValueObj(data, "description"));
        w.put("wind_speed", extractValueObj(data, "windSpeed"));
        w.put("clouds", extractValueObj(data, "clouds"));
        w.put("visibility", extractValueObj(data, "visibility"));
        return w;
    }

    private Map<String, Object> buildWeatherStub(double lat, double lon, String city) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", Instant.now().toString());
        response.put("source", "stub");
        response.put("api_status", "API key not configured or unavailable");
        response.put("location", buildLocation(lat, lon, city));
        Map<String, Object> w = new LinkedHashMap<>();
        w.put("temperature", 28.5);
        w.put("feels_like", 30.2);
        w.put("humidity", 75);
        w.put("pressure", 1012);
        w.put("description", "Partly cloudy");
        w.put("icon", "02d");
        w.put("wind_speed", 3.5);
        w.put("wind_direction", 180);
        w.put("clouds", 40);
        w.put("visibility", 10000);
        response.put("weather", w);
        return response;
    }

    private Map<String, Object> buildAqiStub(double lat, double lon, String city) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", Instant.now().toString());
        response.put("source", "stub");
        response.put("location", buildAqiLocation(lat, lon, city, "Stub Station"));
        response.put("aqi", Map.of("value", 75, "level", "Moderate", "color", "#FFFF00"));
        return response;
    }

    private Map<String, Object> buildPollutants(Map<String, Object> data) {
        Map<String, Object> pollutants = new LinkedHashMap<>();
        pollutants.put("pm25", Map.of("value", extractValueObj(data, "pm25") != null ? extractValueObj(data, "pm25") : 0, "unit", "µg/m³"));
        pollutants.put("pm10", Map.of("value", extractValueObj(data, "pm10") != null ? extractValueObj(data, "pm10") : 0, "unit", "µg/m³"));
        pollutants.put("o3", Map.of("value", extractValueObj(data, "o3") != null ? extractValueObj(data, "o3") : 0, "unit", "µg/m³"));
        pollutants.put("no2", Map.of("value", extractValueObj(data, "no2") != null ? extractValueObj(data, "no2") : 0, "unit", "µg/m³"));
        pollutants.put("so2", Map.of("value", extractValueObj(data, "so2") != null ? extractValueObj(data, "so2") : 0, "unit", "µg/m³"));
        pollutants.put("co", Map.of("value", extractValueObj(data, "co") != null ? extractValueObj(data, "co") : 0, "unit", "mg/m³"));
        return pollutants;
    }

    private Map<String, Object> getAqiLevel(int aqi) {
        Map<String, Object> info = new LinkedHashMap<>();
        if (aqi <= 50) {
            info.put("level", "Good"); info.put("color", "#00E400");
        } else if (aqi <= 100) {
            info.put("level", "Moderate"); info.put("color", "#FFFF00");
        } else if (aqi <= 150) {
            info.put("level", "Unhealthy for Sensitive Groups"); info.put("color", "#FF7E00");
        } else if (aqi <= 200) {
            info.put("level", "Unhealthy"); info.put("color", "#FF0000");
        } else if (aqi <= 300) {
            info.put("level", "Very Unhealthy"); info.put("color", "#8F3F97");
        } else {
            info.put("level", "Hazardous"); info.put("color", "#7E0023");
        }
        return info;
    }
}
