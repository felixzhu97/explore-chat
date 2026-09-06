package com.chat.post.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Social feed post with caption, media, and engagement counters. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class SocialPost extends AbstractEntity {

  private String authorId;
  private String caption;
  private String mediaUrls;
  private String postType;
  private String coverUrl;
  private String location;
  private boolean hidden;
  private long likeCount;
  private long commentCount;

  private SocialPost(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String authorId,
      String caption,
      String mediaUrls,
      String postType,
      String coverUrl,
      String location) {
    super(id, createdAt, updatedAt);
    this.authorId = authorId;
    this.caption = caption;
    this.mediaUrls = mediaUrls == null ? "[]" : mediaUrls;
    this.postType = postType == null || postType.isBlank() ? "TEXT" : postType;
    this.coverUrl = coverUrl;
    this.location = location;
    this.hidden = false;
    this.likeCount = 0;
    this.commentCount = 0;
  }

  /**
   * Creates a text post for the given author.
   *
   * @param authorId author user id
   * @param caption post caption
   * @param mediaUrlsJson JSON array of media URLs
   * @return a new {@code SocialPost}
   */
  public static SocialPost create(String authorId, String caption, String mediaUrlsJson) {
    return create(authorId, caption, mediaUrlsJson, "TEXT", null, null);
  }

  /**
   * Creates a post with an explicit type and optional cover.
   *
   * @param authorId author user id
   * @param caption post caption
   * @param mediaUrlsJson JSON array of media URLs
   * @param postType post type such as {@code TEXT} or {@code VIDEO}
   * @param coverUrl optional cover image URL
   * @return a new {@code SocialPost}
   */
  public static SocialPost create(
      String authorId, String caption, String mediaUrlsJson, String postType, String coverUrl) {
    return create(authorId, caption, mediaUrlsJson, postType, coverUrl, null);
  }

  /**
   * Creates a fully specified post including optional location.
   *
   * @param authorId author user id
   * @param caption post caption
   * @param mediaUrlsJson JSON array of media URLs
   * @param postType post type such as {@code TEXT} or {@code VIDEO}
   * @param coverUrl optional cover image URL
   * @param location optional location label
   * @return a new {@code SocialPost}
   */
  public static SocialPost create(
      String authorId,
      String caption,
      String mediaUrlsJson,
      String postType,
      String coverUrl,
      String location) {
    Instant now = Instant.now();
    return new SocialPost(
        UUID.randomUUID().toString(),
        now,
        now,
        authorId,
        caption,
        mediaUrlsJson,
        postType,
        coverUrl,
        location);
  }

  /** Increments the like counter. */
  public void applyLike() {
    likeCount++;
    touch();
  }

  /** Decrements the like counter when greater than zero. */
  public void removeLike() {
    if (likeCount > 0) {
      likeCount--;
    }
    touch();
  }

  /** Hides this post from public feeds. */
  public void hide() {
    this.hidden = true;
    touch();
  }

  /** Makes this post visible again. */
  public void unhide() {
    this.hidden = false;
    touch();
  }

  /** Increments the comment counter. */
  public void incrementComments() {
    commentCount++;
    touch();
  }

  /** Decrements the comment counter when greater than zero. */
  public void decrementComments() {
    if (commentCount > 0) {
      commentCount--;
    }
    touch();
  }

  /**
   * Returns whether this post is treated as a reel-style video.
   *
   * @return {@code true} when {@code postType} is {@code VIDEO} or {@code REEL}
   */
  public boolean isReel() {
    return "VIDEO".equalsIgnoreCase(postType) || "REEL".equalsIgnoreCase(postType);
  }

  /**
   * Replaces the caption used by demo enrichment.
   *
   * @param caption new caption text
   */
  public void rewriteCaption(String caption) {
    this.caption = caption;
    touch();
  }

  /**
   * Replaces media payload used by demo enrichment and admin repair.
   *
   * @param mediaUrlsJson JSON array of media URLs
   * @param postType post type such as {@code IMAGE} or {@code VIDEO}
   * @param coverUrl optional cover image URL
   */
  public void replaceMedia(String mediaUrlsJson, String postType, String coverUrl) {
    this.mediaUrls = mediaUrlsJson == null || mediaUrlsJson.isBlank() ? "[]" : mediaUrlsJson;
    if (postType != null && !postType.isBlank()) {
      this.postType = postType;
    }
    this.coverUrl = coverUrl;
    touch();
  }
}
