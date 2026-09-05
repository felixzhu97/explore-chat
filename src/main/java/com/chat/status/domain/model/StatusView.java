package com.chat.status.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Immutable record that a user viewed a status. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class StatusView extends AbstractImmutable {

  private String statusId;
  private String viewerId;

  private StatusView(String id, Instant createdAt, String statusId, String viewerId) {
    super(id, createdAt);
    this.statusId = statusId;
    this.viewerId = viewerId;
  }

  /**
   * Creates a view receipt for a status.
   *
   * @param statusId viewed status id
   * @param viewerId viewer user id
   * @return a new {@code StatusView}
   */
  public static StatusView of(String statusId, String viewerId) {
    return new StatusView(UUID.randomUUID().toString(), Instant.now(), statusId, viewerId);
  }
}
