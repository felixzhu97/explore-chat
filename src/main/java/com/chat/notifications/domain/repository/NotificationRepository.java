package com.chat.notifications.domain.repository;

import com.chat.notifications.domain.model.Notification;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.notifications.domain.model.Notification}. */
public interface NotificationRepository {

  Notification save(Notification notification);

  Optional<Notification> findById(String id);

  List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
}
