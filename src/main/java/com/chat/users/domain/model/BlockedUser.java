package com.chat.users.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Immutable record that one user has blocked another. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class BlockedUser extends AbstractImmutable {

  private String blockerId;
  private String blockedId;

  private BlockedUser(String id, Instant createdAt, String blockerId, String blockedId) {
    super(id, createdAt);
    this.blockerId = blockerId;
    this.blockedId = blockedId;
  }

  /**
   * Creates a block relationship.
   *
   * @param blockerId user who blocks
   * @param blockedId user being blocked
   * @return a new {@code BlockedUser}
   */
  public static BlockedUser of(String blockerId, String blockedId) {
    return new BlockedUser(UUID.randomUUID().toString(), Instant.now(), blockerId, blockedId);
  }
}
