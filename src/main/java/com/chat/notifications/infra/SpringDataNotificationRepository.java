package com.chat.notifications.infra;

import com.chat.notifications.domain.model.Notification;
import com.chat.notifications.domain.repository.NotificationRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataNotificationRepository
    extends JpaRepository<Notification, String>, NotificationRepository {

  @Override
  List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
}
