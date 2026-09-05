package com.chat.post.infra;

import com.chat.post.domain.model.PostHashtag;
import com.chat.post.domain.repository.PostHashtagRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataPostHashtagRepository
    extends JpaRepository<PostHashtag, String>, PostHashtagRepository {

  @Override
  boolean existsByPostIdAndHashtagId(String postId, String hashtagId);
}
