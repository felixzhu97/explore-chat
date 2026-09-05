package com.chat.notifications.domain.repository;

import com.chat.notifications.domain.model.ActivityNotification;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.notifications.domain.model.ActivityNotification}. */
public interface ActivityNotificationRepository {

  ActivityNotification save(ActivityNotification notification);

  Optional<ActivityNotification> findById(String id);

  List<ActivityNotification> findByUserIdOrderByCreatedAtDesc(String userId);
}
