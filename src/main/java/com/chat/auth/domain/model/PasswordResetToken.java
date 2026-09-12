package com.chat.auth.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** One-time token used to reset a user password. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class PasswordResetToken extends AbstractEntity {

  private String userId;
  private String token;
  private Instant expiresAt;
  private boolean used;

  private PasswordResetToken(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String userId,
      String token,
      Instant expiresAt) {
    super(id, createdAt, updatedAt);
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
    this.used = false;
  }

  /**
   * Issues a new unused reset token.
   *
   * @param userId owning user id
   * @param token opaque token value
   * @param expiresAt expiry instant
   * @return a new {@code PasswordResetToken}
   */
  public static PasswordResetToken issue(String userId, String token, Instant expiresAt) {
    Instant now = Instant.now();
    return new PasswordResetToken(
        UUID.randomUUID().toString(), now, now, userId, token, expiresAt);
  }

  /** Marks the token as consumed. */
  public void markUsed() {
    this.used = true;
    touch();
  }

  /**
   * Returns whether the token is unused and not expired at {@code now}.
   *
   * @param now evaluation instant
   * @return {@code true} when the token may still be used
   */
  public boolean isValid(Instant now) {
    return !used && now.isBefore(expiresAt);
  }
}
