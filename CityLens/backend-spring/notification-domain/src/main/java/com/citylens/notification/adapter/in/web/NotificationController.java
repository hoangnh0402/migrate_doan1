package com.citylens.notification.adapter.in.web;

import com.citylens.notification.adapter.out.persistence.entity.UserNotificationSettingsEntity;
import com.citylens.notification.application.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(name = "user_id") UUID userId,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(name = "unread_only", defaultValue = "false") boolean unreadOnly) {
        Map<String, Object> result = notificationService.getUserNotifications(userId, skip, limit, unreadOnly);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@RequestParam(name = "user_id") UUID userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unread_count", count));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam(name = "user_id") UUID userId) {
        Map<String, Object> stats = notificationService.getStats(userId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/mark-read")
    public ResponseEntity<Map<String, Object>> markRead(
            @RequestParam(name = "user_id") UUID userId,
            @RequestBody MarkReadRequest request) {
        int count = notificationService.markAsRead(userId, request.notificationIds);
        return ResponseEntity.ok(Map.of("status", "success", "marked", count));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllRead(@RequestParam(name = "user_id") UUID userId) {
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("status", "success", "marked", count));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, Object>> deleteNotification(
            @PathVariable UUID notificationId,
            @RequestParam(name = "user_id") UUID userId) {
        boolean deleted = notificationService.deleteNotification(notificationId, userId);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("detail", "Notification not found"));
        }
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(@RequestParam(name = "user_id") UUID userId) {
        Optional<UserNotificationSettingsEntity> settings = notificationService.getUserSettings(userId);
        if (settings.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("detail", "Settings not found"));
        }
        return ResponseEntity.ok(settings.get());
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(
            @RequestParam(name = "user_id") UUID userId,
            @RequestBody Map<String, Object> settingsData) {
        UserNotificationSettingsEntity settings = notificationService.updateUserSettings(userId, settingsData);
        return ResponseEntity.ok(settings);
    }

    @PostMapping("/test/create")
    public ResponseEntity<Map<String, Object>> createTestNotification(
            @RequestParam(name = "user_id") UUID userId,
            @RequestParam(defaultValue = "Test Notification") String title,
            @RequestParam(defaultValue = "This is a test notification") String message) {
        var notification = notificationService.createNotification(
                userId, "system_announcement", title, message, null);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("notification_id", notification.getId());
        response.put("message", "Test notification created");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/device-token")
    public ResponseEntity<Map<String, Object>> registerDeviceToken(
            @RequestParam(name = "user_id") UUID userId,
            @RequestBody DeviceTokenRequest tokenData) {
        // Store token in settings (simplified - in production use a dedicated table)
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("enable_push", true);
        notificationService.updateUserSettings(userId, data);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @DeleteMapping("/device-token")
    public ResponseEntity<Map<String, Object>> unregisterDeviceToken(
            @RequestParam(name = "user_id") UUID userId,
            @RequestParam String token,
            @RequestParam String platform) {
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    public static class MarkReadRequest {
        public List<UUID> notificationIds;

        public List<UUID> getNotificationIds() { return notificationIds; }
        public void setNotificationIds(List<UUID> notificationIds) { this.notificationIds = notificationIds; }
    }

    public static class DeviceTokenRequest {
        public String token;
        public String platform;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }
    }
}
