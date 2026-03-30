package com.citylens.infrastructure.adapter.in.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/ai")
public class AIChatController {

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatWithAi(@RequestBody Map<String, Object> request) {
        String message = (String) request.getOrDefault("message", "");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("response", "AI Chat service chưa được cấu hình. Vui lòng thiết lập GEMINI_API_KEY.");
        response.put("sources", Collections.emptyList());
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("metadata", Map.of(
                "model", "not_configured",
                "message_received", message,
                "status", "service_unavailable"
        ));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getChatHistory(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(name = "user_id", required = false) String userId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Collections.emptyList(),
                "count", 0
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> aiChatHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "not_configured");
        health.put("gemini_configured", false);
        health.put("gemini_available", false);
        health.put("client_initialized", false);
        health.put("model_name", "none");
        health.put("message", "AI chat service is not yet configured. Set GEMINI_API_KEY to enable.");
        return ResponseEntity.ok(health);
    }
}
