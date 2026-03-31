package com.hqcsystem.notification.application.service;

import com.hqcsystem.notification.adapter.out.persistence.entity.NotificationEntity;
import com.hqcsystem.notification.adapter.out.persistence.entity.UserNotificationSettingsEntity;
import com.hqcsystem.notification.adapter.out.persistence.repository.NotificationJpaRepository;
import com.hqcsystem.notification.adapter.out.persistence.repository.UserNotificationSettingsJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class NotificationService {

    private final NotificationJpaRepository notificationRepo;
    private final UserNotificationSettingsJpaRepository settingsRepo;

    public NotificationService(NotificationJpaRepository notificationRepo,
                               UserNotificationSettingsJpaRepository settingsRepo) {
        this.notificationRepo = notificationRepo;
        this.settingsRepo = settingsRepo;
    }

    public Map<String, Object> getUserNotifications(UUID userId, int skip, int limit, boolean unreadOnly) {
        PageRequest pageable = PageRequest.of(skip / Math.max(limit, 1), limit);

        Page<NotificationEntity> page;
        if (unreadOnly) {
            page = notificationRepo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
        } else {
            page = notificationRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        long unreadCount = notificationRepo.countByUserIdAndIsReadFalse(userId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("notifications", page.getContent());
        result.put("total", page.getTotalElements());
        result.put("unread_count", unreadCount);
        return result;
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepo.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public int markAsRead(UUID userId, List<UUID> notificationIds) {
        return notificationRepo.markAsRead(userId, notificationIds, LocalDateTime.now());
    }

    @Transactional
    public int markAllAsRead(UUID userId) {
        return notificationRepo.markAllAsRead(userId, LocalDateTime.now());
    }

    @Transactional
    public boolean deleteNotification(UUID notificationId, UUID userId) {
        if (!notificationRepo.existsByIdAndUserId(notificationId, userId)) {
            return false;
        }
        notificationRepo.deleteByIdAndUserId(notificationId, userId);
        return true;
    }

    public Map<String, Object> getStats(UUID userId) {
        long total = notificationRepo.countByUserId(userId);
        long unread = notificationRepo.countByUserIdAndIsReadFalse(userId);

        Map<String, Long> byType = new LinkedHashMap<>();
        List<Object[]> typeCounts = notificationRepo.countByType(userId);
        for (Object[] row : typeCounts) {
            byType.put((String) row[0], (Long) row[1]);
        }

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long last7Days = notificationRepo.countByUserIdAndCreatedAtAfter(userId, sevenDaysAgo);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", total);
        stats.put("unread", unread);
        stats.put("by_type", byType);
        stats.put("last_7_days", last7Days);
        return stats;
    }

    public Optional<UserNotificationSettingsEntity> getUserSettings(UUID userId) {
        return settingsRepo.findByUserId(userId);
    }

    @Transactional
    public UserNotificationSettingsEntity updateUserSettings(UUID userId, Map<String, Object> settingsData) {
        UserNotificationSettingsEntity settings = settingsRepo.findByUserId(userId)
                .orElseGet(() -> {
                    UserNotificationSettingsEntity s = new UserNotificationSettingsEntity();
                    s.setUserId(userId);
                    return s;
                });

        if (settingsData.containsKey("enable_email")) {
            settings.setEnableEmail((Boolean) settingsData.get("enable_email"));
        }
        if (settingsData.containsKey("enable_push")) {
            settings.setEnablePush((Boolean) settingsData.get("enable_push"));
        }
        if (settingsData.containsKey("enable_sms")) {
            settings.setEnableSms((Boolean) settingsData.get("enable_sms"));
        }
        if (settingsData.containsKey("notify_status_update")) {
            settings.setNotifyStatusUpdate((Boolean) settingsData.get("notify_status_update"));
        }
        if (settingsData.containsKey("notify_comments")) {
            settings.setNotifyComments((Boolean) settingsData.get("notify_comments"));
        }
        if (settingsData.containsKey("notify_upvotes")) {
            settings.setNotifyUpvotes((Boolean) settingsData.get("notify_upvotes"));
        }
        if (settingsData.containsKey("notify_assignments")) {
            settings.setNotifyAssignments((Boolean) settingsData.get("notify_assignments"));
        }
        if (settingsData.containsKey("notify_announcements")) {
            settings.setNotifyAnnouncements((Boolean) settingsData.get("notify_announcements"));
        }
        if (settingsData.containsKey("quiet_hours_start")) {
            settings.setQuietHoursStart((String) settingsData.get("quiet_hours_start"));
        }
        if (settingsData.containsKey("quiet_hours_end")) {
            settings.setQuietHoursEnd((String) settingsData.get("quiet_hours_end"));
        }

        return settingsRepo.save(settings);
    }

    @Transactional
    public NotificationEntity createNotification(UUID userId, String type, String title, String message,
                                                  Map<String, Object> data) {
        NotificationEntity notification = new NotificationEntity();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setData(data);
        notification.setIsRead(false);
        return notificationRepo.save(notification);
    }
}

