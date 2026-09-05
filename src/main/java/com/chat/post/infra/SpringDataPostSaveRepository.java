package com.chat.post.infra;

import com.chat.post.domain.model.PostSave;
import com.chat.post.domain.repository.PostSaveRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataPostSaveRepository
    extends JpaRepository<PostSave, String>, PostSaveRepository {

  @Override
  Optional<PostSave> findByPostIdAndUserId(String postId, String userId);

  @Override
  long countByPostId(String postId);

  @Override
  boolean existsByPostIdAndUserId(String postId, String userId);

  @Override
  default void delete(PostSave save) {
    deleteById(save.getId());
  }
}
