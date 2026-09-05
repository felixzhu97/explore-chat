package com.chat.notifications.infra;

import com.chat.notifications.domain.model.ActivityNotification;
import com.chat.notifications.domain.repository.ActivityNotificationRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataActivityNotificationRepository
    extends JpaRepository<ActivityNotification, String>, ActivityNotificationRepository {

  @Override
  List<ActivityNotification> findByUserIdOrderByCreatedAtDesc(String userId);
}
