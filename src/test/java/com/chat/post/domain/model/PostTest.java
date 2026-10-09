package com.chat.post.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PostTest {

  @Test
  @DisplayName("should increment and decrement likes when addLike and removeLike")
  void shouldIncrementAndDecrementLikesWhenAddLikeAndRemoveLike() {
    Post post = Post.create("u1", "hello", "[]");
    post.addLike();
    post.addLike();
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
    Post post = Post.create("u1", "hello", "[]");
    assertFalse(post.isHidden());
    post.hide();
    assertTrue(post.isHidden());
    post.unhide();
    assertFalse(post.isHidden());
  }

  @Test
  @DisplayName("should treat VIDEO and REEL as reel media")
  void shouldTreatVideoAndReelAsReelMedia() {
    assertTrue(Post.create("u1", "v", "[]", "VIDEO", null, null).isReel());
    assertTrue(Post.create("u1", "r", "[]", "REEL", null, null).isReel());
    assertFalse(Post.create("u1", "t", "[]", "TEXT", null, null).isReel());
  }

  @Test
  @DisplayName("should default post type to TEXT when blank")
  void shouldDefaultPostTypeToTextWhenBlank() {
    Post post = Post.create("u1", "hello", "[]", "", null, null);
    assertEquals(MediaType.TEXT, post.getPostType());
  }
}
