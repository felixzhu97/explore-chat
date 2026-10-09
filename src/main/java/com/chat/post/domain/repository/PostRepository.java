package com.chat.post.domain.repository;

import com.chat.post.domain.model.Post;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.post.domain.model.Post} aggregates. */
public interface PostRepository {

  Post save(Post post);

  Optional<Post> findById(String id);

  List<Post> listFeed(int offset, int limit);

  List<Post> listByAuthor(String authorId, int offset, int limit);

  List<Post> listFeedForAuthors(Collection<String> authorIds, int offset, int limit);

  List<Post> listExploreExcluding(Collection<String> authorIds, int offset, int limit);

  List<Post> listReels(int offset, int limit);

  long countAll();

  long countVisible();

  long countByAuthor(String authorId);

  long countFeedForAuthors(Collection<String> authorIds);

  long countExploreExcluding(Collection<String> authorIds);

  long countReels();

  void delete(Post post);
}
