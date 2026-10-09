package com.chat.comments.domain.repository;

import com.chat.comments.domain.model.Comment;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.comments.domain.model.Comment} aggregates. */
public interface CommentRepository {

  Comment save(Comment comment);

  Optional<Comment> findById(String id);

  List<Comment> findByPostIdOrderByCreatedAtAsc(String postId);

  void delete(Comment comment);
}
