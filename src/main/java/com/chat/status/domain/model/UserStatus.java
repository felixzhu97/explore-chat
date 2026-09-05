package com.chat.status.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Ephemeral user status that expires after a fixed lifetime. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class UserStatus extends AbstractEntity {

  private String authorId;
  private String content;
  private String mediaUrl;
  private String statusType;
  private Instant expiresAt;

  private UserStatus(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String authorId,
      String content,
      String mediaUrl,
      String statusType,
      Instant expiresAt) {
    super(id, createdAt, updatedAt);
    this.authorId = authorId;
    this.content = content;
    this.mediaUrl = mediaUrl;
    this.statusType = statusType == null || statusType.isBlank() ? "TEXT" : statusType;
    this.expiresAt = expiresAt;
  }

  /**
   * Creates a status that expires 24 hours after creation.
   *
   * @param authorId author user id
   * @param content status text
   * @param mediaUrl optional media URL
   * @param statusType status type such as {@code TEXT}
   * @return a new {@code UserStatus}
   */
  public static UserStatus create(
      String authorId, String content, String mediaUrl, String statusType) {
    Instant now = Instant.now();
    return new UserStatus(
        UUID.randomUUID().toString(),
        now,
        now,
        authorId,
        content,
        mediaUrl,
        statusType,
        now.plus(24, ChronoUnit.HOURS));
  }

  /**
   * Returns whether the status has passed its expiry time.
   *
   * @return {@code true} when expired
   */
  public boolean isExpired() {
    return Instant.now().isAfter(expiresAt);
  }
}
