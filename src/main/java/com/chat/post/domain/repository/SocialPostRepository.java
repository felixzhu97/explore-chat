package com.chat.post.domain.repository;

import com.chat.post.domain.model.SocialPost;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.post.domain.model.SocialPost} aggregates. */
public interface SocialPostRepository {

  SocialPost save(SocialPost post);

  Optional<SocialPost> findById(String id);

  List<SocialPost> listFeed(int offset, int limit);

  List<SocialPost> listByAuthor(String authorId, int offset, int limit);

  List<SocialPost> listFeedForAuthors(Collection<String> authorIds, int offset, int limit);

  List<SocialPost> listExploreExcluding(Collection<String> authorIds, int offset, int limit);

  List<SocialPost> listReels(int offset, int limit);

  long countAll();

  long countVisible();

  long countByAuthor(String authorId);

  long countFeedForAuthors(Collection<String> authorIds);

  long countExploreExcluding(Collection<String> authorIds);

  long countReels();

  void delete(SocialPost post);
}
