package com.citylens.report.adapter.in.web;

import com.citylens.report.application.dto.CreateReportCommand;
import com.citylens.report.application.dto.UpdateReportCommand;
import com.citylens.report.application.port.in.ReportUseCase;
import com.citylens.report.domain.model.Report;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/app/reports")
public class AppReportController {

    private final ReportUseCase reportUseCase;

    public AppReportController(ReportUseCase reportUseCase) {
        this.reportUseCase = reportUseCase;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createReport(@RequestBody CreateReportRequest request) {
        CreateReportCommand command = CreateReportCommand.builder()
                .reportType(request.reportType)
                .ward(request.ward)
                .addressDetail(request.addressDetail)
                .locationLat(request.location != null ? request.location.lat : null)
                .locationLng(request.location != null ? request.location.lng : null)
                .title(request.title)
                .content(request.content)
                .media(request.media)
                .userId(request.userId)
                .build();

        Report report = reportUseCase.createReport(command);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("data", toMap(report));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        List<Report> reports = reportUseCase.getReports(status, userId, limit, skip);
        long count = reportUseCase.getReportsCount(status, userId);

        List<Map<String, Object>> data = new ArrayList<>();
        for (Report r : reports) {
            data.add(toMap(r));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats/summary")
    public ResponseEntity<Map<String, Object>> getReportStats(@RequestParam(required = false) String userId) {
        Map<String, Long> stats = reportUseCase.getReportStats(userId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("data", stats);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<Map<String, Object>> getReport(@PathVariable String reportId) {
        return reportUseCase.getReportById(reportId)
                .map(report -> {
                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("success", true);
                    response.put("data", toMap(report));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<Map<String, Object>> updateReport(@PathVariable String reportId, @RequestBody UpdateReportCommand command) {
        Report report = reportUseCase.updateReport(reportId, command);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("data", toMap(report));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Map<String, Object>> deleteReport(@PathVariable String reportId) {
        boolean deleted = reportUseCase.deleteReport(reportId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", deleted);
        response.put("message", deleted ? "Report deleted successfully" : "Report not found");
        return deleted ? ResponseEntity.ok(response) : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    private Map<String, Object> toMap(Report report) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("_id", report.getId());
        map.put("reportType", report.getReportType());
        map.put("ward", report.getWard());
        map.put("addressDetail", report.getAddressDetail());
        if (report.getLocationLat() != null && report.getLocationLng() != null) {
            Map<String, Double> loc = new HashMap<>();
            loc.put("lat", report.getLocationLat());
            loc.put("lng", report.getLocationLng());
            map.put("location", loc);
        }
        map.put("title", report.getTitle());
        map.put("content", report.getContent());
        map.put("media", report.getMediaUrls());
        map.put("userId", report.getUserId());
        map.put("status", report.getStatus());
        map.put("adminNote", report.getAdminNote());
        map.put("createdAt", report.getCreatedAt());
        map.put("updatedAt", report.getUpdatedAt());
        return map;
    }

    public static class LocationData {
        public Double lat;
        public Double lng;
    }

    public static class CreateReportRequest {
        public String reportType;
        public String ward;
        public String addressDetail;
        public LocationData location;
        public String title;
        public String content;
        public List<Map<String, String>> media;
        public String userId;
    }
}
