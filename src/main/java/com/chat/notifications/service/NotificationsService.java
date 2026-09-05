package com.chat.notifications.service;

import com.chat.notifications.domain.model.ActivityNotification;
import com.chat.notifications.domain.repository.ActivityNotificationRepository;
import com.chat.websocket.infra.NotificationRealtimeGateway;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationsService {

  private final ActivityNotificationRepository notifications;
  private final ObjectProvider<NotificationRealtimeGateway> realtimeGateway;

  public NotificationsService(
      ActivityNotificationRepository notifications,
      ObjectProvider<NotificationRealtimeGateway> realtimeGateway) {
    this.notifications = notifications;
    this.realtimeGateway = realtimeGateway;
  }

  @Transactional
  public Map<String, Object> create(String userId, String type, String payload) {
    Map<String, Object> response =
        toResponse(notifications.save(ActivityNotification.create(userId, type, payload)));
    NotificationRealtimeGateway gateway = realtimeGateway.getIfAvailable();
    if (gateway != null) {
      gateway.publishNew(userId, response);
    }
    return response;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> list(String userId) {
    List<Map<String, Object>> items =
        notifications.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(this::toResponse)
            .toList();
    return Map.of("notifications", items);
  }

  @Transactional
  public void markRead(String id, String userId) {
    ActivityNotification notification =
        notifications
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    if (!notification.getUserId().equals(userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not notification owner");
    }
    notification.markRead();
    notifications.save(notification);
  }

  @Transactional
  public void markAllRead(String userId) {
    for (ActivityNotification notification :
        notifications.findByUserIdOrderByCreatedAtDesc(userId)) {
      notification.markRead();
      notifications.save(notification);
    }
  }

  @Transactional
  public void markBatchRead(String userId, List<String> ids) {
    for (String id : ids) {
      markRead(id, userId);
    }
  }

  private Map<String, Object> toResponse(ActivityNotification notification) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", notification.getId());
    body.put("type", notification.getType());
    body.put("payload", notification.getPayload());
    body.put("read", notification.isRead());
    body.put("createTime", notification.getCreatedAt().toString());
    return body;
  }
}
