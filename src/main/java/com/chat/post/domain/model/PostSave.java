package com.chat.post.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Immutable record that a user saved a social post. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class PostSave extends AbstractImmutable {

  private String postId;
  private String userId;

  private PostSave(String id, Instant createdAt, String postId, String userId) {
    super(id, createdAt);
    this.postId = postId;
    this.userId = userId;
  }

  /**
   * Creates a save linking a user to a post.
   *
   * @param postId saved post id
   * @param userId saving user id
   * @return a new {@code PostSave}
   */
  public static PostSave of(String postId, String userId) {
    return new PostSave(UUID.randomUUID().toString(), Instant.now(), postId, userId);
  }
}
