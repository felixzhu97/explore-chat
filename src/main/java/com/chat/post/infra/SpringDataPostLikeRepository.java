package com.chat.post.infra;

import com.chat.post.domain.model.PostLike;
import com.chat.post.domain.repository.PostLikeRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataPostLikeRepository
    extends JpaRepository<PostLike, String>, PostLikeRepository {

  @Override
  Optional<PostLike> findByPostIdAndUserId(String postId, String userId);

  @Override
  long countByPostId(String postId);

  @Override
  boolean existsByPostIdAndUserId(String postId, String userId);

  @Override
  default void delete(PostLike like) {
    deleteById(like.getId());
  }
}
