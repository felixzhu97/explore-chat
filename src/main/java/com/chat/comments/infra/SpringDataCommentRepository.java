package com.chat.comments.infra;

import com.chat.comments.domain.model.Comment;
import com.chat.comments.domain.repository.CommentRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataCommentRepository
    extends JpaRepository<Comment, String>, CommentRepository {

  @Override
  List<Comment> findByPostIdOrderByCreatedAtAsc(String postId);

  @Override
  default void delete(Comment comment) {
    deleteById(comment.getId());
  }
}
