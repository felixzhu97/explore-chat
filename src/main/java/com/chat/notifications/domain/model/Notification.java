package com.chat.notifications.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** In-app activity notification delivered to a user (maps to {@code activity_notification}). */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class Notification extends AbstractEntity {

  private String userId;
  private String type;
  private String payload;
  private boolean read;

  private Notification(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String userId,
      String type,
      String payload) {
    super(id, createdAt, updatedAt);
    this.userId = userId;
    this.type = type;
    this.payload = payload;
    this.read = false;
  }

  /**
   * Creates an unread notification for a user.
   *
   * @param userId recipient user id
   * @param type notification type
   * @param payload serialized notification payload
   * @return a new {@code Notification}
   */
  public static Notification create(String userId, String type, String payload) {
    Instant now = Instant.now();
    return new Notification(UUID.randomUUID().toString(), now, now, userId, type, payload);
  }

  /** Marks the notification as read. */
  public void markRead() {
    this.read = true;
    touch();
  }
}
