package com.chat.analytics.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Immutable analytics event captured for a user action. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class AnalyticsEvent extends AbstractImmutable {

  private String userId;
  private String eventName;
  private String payload;

  private AnalyticsEvent(
      String id, Instant createdAt, String userId, String eventName, String payload) {
    super(id, createdAt);
    this.userId = userId;
    this.eventName = eventName;
    this.payload = payload;
  }

  /**
   * Records an analytics event.
   *
   * @param userId acting user id
   * @param eventName event name
   * @param payload serialized event payload
   * @return a new {@code AnalyticsEvent}
   */
  public static AnalyticsEvent record(String userId, String eventName, String payload) {
    return new AnalyticsEvent(
        UUID.randomUUID().toString(), Instant.now(), userId, eventName, payload);
  }
}
