package com.chat.post.domain.repository;

import com.chat.post.domain.model.Hashtag;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.post.domain.model.Hashtag} aggregates. */
public interface HashtagRepository {

  Hashtag save(Hashtag hashtag);

  Optional<Hashtag> findByTag(String tag);

  List<Hashtag> findByTagContainingIgnoreCase(String query);
}
