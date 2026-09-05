package com.chat.post.domain.repository;

import com.chat.post.domain.model.PostHashtag;

/** Persistence port for {@link com.chat.post.domain.model.PostHashtag} links. */
public interface PostHashtagRepository {

  PostHashtag save(PostHashtag link);

  boolean existsByPostIdAndHashtagId(String postId, String hashtagId);
}
