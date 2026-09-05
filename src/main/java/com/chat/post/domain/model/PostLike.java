package com.chat.post.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Immutable record that a user liked a social post. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class PostLike extends AbstractImmutable {

  private String postId;
  private String userId;

  private PostLike(String id, Instant createdAt, String postId, String userId) {
    super(id, createdAt);
    this.postId = postId;
    this.userId = userId;
  }

  /**
   * Creates a like linking a user to a post.
   *
   * @param postId liked post id
   * @param userId liking user id
   * @return a new {@code PostLike}
   */
  public static PostLike of(String postId, String userId) {
    return new PostLike(UUID.randomUUID().toString(), Instant.now(), postId, userId);
  }
}
