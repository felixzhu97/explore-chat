package com.chat.post.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Join record linking a social post to a hashtag. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class PostHashtag extends AbstractImmutable {

  private String postId;
  private String hashtagId;

  private PostHashtag(String id, Instant createdAt, String postId, String hashtagId) {
    super(id, createdAt);
    this.postId = postId;
    this.hashtagId = hashtagId;
  }

  /**
   * Creates a post-hashtag association.
   *
   * @param postId post id
   * @param hashtagId hashtag id
   * @return a new {@code PostHashtag}
   */
  public static PostHashtag of(String postId, String hashtagId) {
    return new PostHashtag(UUID.randomUUID().toString(), Instant.now(), postId, hashtagId);
  }
}
