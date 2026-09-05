package com.chat.comments.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Comment left by a user on a social post. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class PostComment extends AbstractEntity {

  private String postId;
  private String authorId;
  private String content;

  private PostComment(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String postId,
      String authorId,
      String content) {
    super(id, createdAt, updatedAt);
    this.postId = postId;
    this.authorId = authorId;
    this.content = content;
  }

  /**
   * Creates a comment on a post.
   *
   * @param postId target post id
   * @param authorId author user id
   * @param content comment body
   * @return a new {@code PostComment}
   */
  public static PostComment create(String postId, String authorId, String content) {
    Instant now = Instant.now();
    return new PostComment(UUID.randomUUID().toString(), now, now, postId, authorId, content);
  }
}
