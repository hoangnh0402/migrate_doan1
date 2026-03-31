package com.hqcsystem.notification.adapter.in.event;

import com.hqcsystem.notification.application.service.NotificationService;
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
                        "ÄÃ£ táº¡o bÃ¡o cÃ¡o má»›i", 
                        "BÃ¡o cÃ¡o cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c ghi nháº­n vÃ o há»‡ thá»‘ng (Async RabbitMQ)", 
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
                        "Nhiá»‡m vá»¥ má»›i", 
                        "Báº¡n vá»«a Ä‘Æ°á»£c phÃ¢n cÃ´ng má»™t bÃ¡o cÃ¡o má»›i", 
                        payload
                );
            }
        } catch (Exception e) {
            System.err.println("Error processing async notification event: " + e.getMessage());
        }
    }
}

