package com.chat.post.domain.repository;

import com.chat.post.domain.model.PostSave;
import java.util.Optional;

/** Persistence port for {@link com.chat.post.domain.model.PostSave} records. */
public interface PostSaveRepository {

  PostSave save(PostSave save);

  Optional<PostSave> findByPostIdAndUserId(String postId, String userId);

  long countByPostId(String postId);

  void delete(PostSave save);

  boolean existsByPostIdAndUserId(String postId, String userId);
}
