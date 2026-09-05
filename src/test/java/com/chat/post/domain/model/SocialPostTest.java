package com.chat.post.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SocialPostTest {

  @Test
  @DisplayName("should increment and decrement likes when applyLike and removeLike")
  void shouldIncrementAndDecrementLikesWhenApplyLikeAndRemoveLike() {
    SocialPost post = SocialPost.create("u1", "hello", "[]");
    post.applyLike();
    post.applyLike();
    assertEquals(2, post.getLikeCount());
    post.removeLike();
    assertEquals(1, post.getLikeCount());
    post.removeLike();
    post.removeLike();
    assertEquals(0, post.getLikeCount());
  }

  @Test
  @DisplayName("should hide and unhide post")
  void shouldHideAndUnhidePost() {
    SocialPost post = SocialPost.create("u1", "hello", "[]");
    assertFalse(post.isHidden());
    post.hide();
    assertTrue(post.isHidden());
    post.unhide();
    assertFalse(post.isHidden());
  }

  @Test
  @DisplayName("should treat VIDEO and REEL as reel media")
  void shouldTreatVideoAndReelAsReelMedia() {
    assertTrue(SocialPost.create("u1", "v", "[]", "VIDEO", null, null).isReel());
    assertTrue(SocialPost.create("u1", "r", "[]", "REEL", null, null).isReel());
    assertFalse(SocialPost.create("u1", "t", "[]", "TEXT", null, null).isReel());
  }
}
