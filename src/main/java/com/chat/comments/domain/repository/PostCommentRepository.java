package com.chat.comments.domain.repository;

import com.chat.comments.domain.model.PostComment;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.comments.domain.model.PostComment} aggregates. */
public interface PostCommentRepository {

  PostComment save(PostComment comment);

  Optional<PostComment> findById(String id);

  List<PostComment> findByPostIdOrderByCreatedAtAsc(String postId);

  void delete(PostComment comment);
}
