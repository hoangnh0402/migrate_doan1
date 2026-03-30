package com.citylens.notification.adapter.in.event;

import com.citylens.notification.application.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class NotificationEventListener {

    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notifications.queue")
    public void handleNotificationEvent(Map<String, Object> envelope) {
        try {
            String type = (String) envelope.get("type");
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = (Map<String, Object>) envelope.get("payload");
            
            if ("report.created".equals(type)) {
                // Async push notification for new report
                UUID userId = UUID.fromString((String) payload.get("user_id"));
                notificationService.createNotification(
                        userId, 
                        "report_update", 
                        "Đã tạo báo cáo mới", 
                        "Báo cáo của bạn đã được ghi nhận vào hệ thống (Async RabbitMQ)", 
                        payload
                );
            } else if ("assignment.created".equals(type)) {
                @SuppressWarnings("unused")
                Integer assignedTo = (Integer) payload.get("assigned_to");
                // Need a real user ID here in production mapped from assignment, but this is proof of concept
                UUID systemUserId = UUID.fromString("00000000-0000-0000-0000-000000000000"); 
                notificationService.createNotification(
                        systemUserId, 
                        "assignment", 
                        "Nhiệm vụ mới", 
                        "Bạn vừa được phân công một báo cáo mới", 
                        payload
                );
            }
        } catch (Exception e) {
            System.err.println("Error processing async notification event: " + e.getMessage());
        }
    }
}
