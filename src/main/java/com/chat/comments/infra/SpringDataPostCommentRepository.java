package com.chat.comments.infra;

import com.chat.comments.domain.model.PostComment;
import com.chat.comments.domain.repository.PostCommentRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataPostCommentRepository
    extends JpaRepository<PostComment, String>, PostCommentRepository {

  @Override
  List<PostComment> findByPostIdOrderByCreatedAtAsc(String postId);

  @Override
  default void delete(PostComment comment) {
    deleteById(comment.getId());
  }
}
