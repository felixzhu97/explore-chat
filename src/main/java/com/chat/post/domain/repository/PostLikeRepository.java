package com.chat.post.domain.repository;

import com.chat.post.domain.model.PostLike;
import java.util.Optional;

/** Persistence port for {@link com.chat.post.domain.model.PostLike} records. */
public interface PostLikeRepository {

  PostLike save(PostLike like);

  Optional<PostLike> findByPostIdAndUserId(String postId, String userId);

  long countByPostId(String postId);

  void delete(PostLike like);

  boolean existsByPostIdAndUserId(String postId, String userId);
}
