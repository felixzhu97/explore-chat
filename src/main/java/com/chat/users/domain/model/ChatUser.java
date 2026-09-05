package com.chat.users.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Long-lived User identity used for login and social graph (maps to {@code chat_user}). */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class ChatUser extends AbstractEntity {

  private String username;
  private String email;
  private String phone;
  private String passwordHash;
  private String avatar;
  private String status;
  private boolean online;
  private Instant lastSeen;
  private boolean disabled;
  private boolean deleted;

  private ChatUser(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String username,
      String email,
      String passwordHash) {
    super(id, createdAt, updatedAt);
    this.username = Objects.requireNonNull(username);
    this.email = Objects.requireNonNull(email);
    this.passwordHash = Objects.requireNonNull(passwordHash);
    this.online = false;
    this.lastSeen = createdAt;
    this.disabled = false;
    this.deleted = false;
  }

  /**
   * Registers a new user with credentials.
   *
   * @param username unique username
   * @param email unique email
   * @param passwordHash encoded password
   * @return a new {@code ChatUser}
   */
  public static ChatUser register(String username, String email, String passwordHash) {
    Instant now = Instant.now();
    return new ChatUser(UUID.randomUUID().toString(), now, now, username, email, passwordHash);
  }

  /**
   * Updates mutable profile fields when non-null values are provided.
   *
   * @param username new username, or blank to keep current
   * @param phone new phone, or {@code null} to keep current
   * @param status new status text, or {@code null} to keep current
   * @param avatar new avatar URL, or {@code null} to keep current
   */
  public void updateProfile(String username, String phone, String status, String avatar) {
    if (username != null && !username.isBlank()) {
      this.username = username;
    }
    if (phone != null) {
      this.phone = phone;
    }
    if (status != null) {
      this.status = status;
    }
    if (avatar != null) {
      this.avatar = avatar;
    }
    touch();
  }

  /**
   * Verifies a raw password against the stored hash.
   *
   * @param raw plaintext password
   * @param hasher password matching strategy
   * @return {@code true} when the password matches
   */
  public boolean matchesPassword(String raw, PasswordHasher hasher) {
    return hasher.matches(raw, passwordHash);
  }

  /**
   * Replaces the stored password hash using the given encoder.
   *
   * @param raw plaintext password
   * @param encoder maps plaintext to a stored hash
   */
  public void changePassword(String raw, Function<String, String> encoder) {
    this.passwordHash = encoder.apply(raw);
    touch();
  }

  /** Marks the user as soft-deleted. */
  public void softDelete() {
    this.deleted = true;
    touch();
  }

  /** Disables login for this user. */
  public void disable() {
    this.disabled = true;
    touch();
  }

  /** Re-enables login for this user. */
  public void enable() {
    this.disabled = false;
    touch();
  }

  /**
   * Updates online presence and last-seen timestamp.
   *
   * @param online {@code true} when the user is online
   */
  public void markOnline(boolean online) {
    this.online = online;
    this.lastSeen = Instant.now();
    touch();
  }

  /** Strategy for comparing a raw password to a stored hash. */
  @FunctionalInterface
  public interface PasswordHasher {
    /**
     * Returns whether {@code raw} matches {@code hash}.
     *
     * @param raw plaintext password
     * @param hash stored password hash
     * @return {@code true} when credentials match
     */
    boolean matches(String raw, String hash);
  }
}
