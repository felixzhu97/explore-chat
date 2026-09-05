package com.chat.post.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Hashtag label with a running count of linked posts. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class Hashtag extends AbstractImmutable {

  private String tag;
  private long postCount;

  private Hashtag(String id, Instant createdAt, String tag) {
    super(id, createdAt);
    this.tag = tag;
    this.postCount = 0;
  }

  /**
   * Creates a hashtag for the given tag text.
   *
   * @param tag hashtag text without requiring a leading {@code #}
   * @return a new {@code Hashtag}
   */
  public static Hashtag create(String tag) {
    return new Hashtag(UUID.randomUUID().toString(), Instant.now(), tag);
  }

  /** Increments the number of posts associated with this hashtag. */
  public void incrementPostCount() {
    postCount++;
  }
}
