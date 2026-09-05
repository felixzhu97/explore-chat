package com.chat.follow.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Immutable follow edge from one user to another. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class UserFollow extends AbstractImmutable {

  private String followerId;
  private String followingId;

  private UserFollow(String id, Instant createdAt, String followerId, String followingId) {
    super(id, createdAt);
    this.followerId = followerId;
    this.followingId = followingId;
  }

  /**
   * Creates a follow relationship.
   *
   * @param followerId follower user id
   * @param followingId followed user id
   * @return a new {@code UserFollow}
   */
  public static UserFollow of(String followerId, String followingId) {
    return new UserFollow(UUID.randomUUID().toString(), Instant.now(), followerId, followingId);
  }
}
