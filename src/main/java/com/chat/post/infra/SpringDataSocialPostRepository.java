package com.chat.post.infra;

import com.chat.post.domain.model.SocialPost;
import com.chat.post.domain.repository.SocialPostRepository;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataSocialPostRepository
    extends JpaRepository<SocialPost, String>, SocialPostRepository {

  @Query(
      """
      select p from SocialPost p
      where p.hidden = false
      order by p.createdAt desc
      """)
  List<SocialPost> findFeedPage(Pageable pageable);

  @Query(
      """
      select p from SocialPost p
      where p.authorId = :authorId and p.hidden = false
      order by p.createdAt desc
      """)
  List<SocialPost> findByAuthorPage(@Param("authorId") String authorId, Pageable pageable);

  @Query(
      """
      select p from SocialPost p
      where p.hidden = false and p.authorId in :authorIds
      order by p.createdAt desc
      """)
  List<SocialPost> findFeedForAuthorsPage(
      @Param("authorIds") Collection<String> authorIds, Pageable pageable);

  @Query(
      """
      select count(p) from SocialPost p
      where p.hidden = false and p.authorId in :authorIds
      """)
  long countFeedForAuthorsQuery(@Param("authorIds") Collection<String> authorIds);

  @Query(
      """
      select p from SocialPost p
      where p.hidden = false and p.authorId not in :authorIds
      order by p.likeCount desc, p.createdAt desc
      """)
  List<SocialPost> findExploreExcludingPage(
      @Param("authorIds") Collection<String> authorIds, Pageable pageable);

  @Query(
      """
      select count(p) from SocialPost p
      where p.hidden = false and p.authorId not in :authorIds
      """)
  long countExploreExcludingAuthors(@Param("authorIds") Collection<String> authorIds);

  @Query(
      """
      select p from SocialPost p
      where p.hidden = false
      order by p.likeCount desc, p.createdAt desc
      """)
  List<SocialPost> findExploreAllPage(Pageable pageable);

  @Query(
      """
      select count(p) from SocialPost p
      where p.hidden = false
      """)
  long countExploreAll();

  @Query(
      """
      select p from SocialPost p
      where p.hidden = false
        and (p.postType = 'VIDEO' or p.postType = 'REEL')
      order by p.createdAt desc
      """)
  List<SocialPost> findReelsPage(Pageable pageable);

  @Query(
      """
      select count(p) from SocialPost p
      where p.hidden = false
        and (p.postType = 'VIDEO' or p.postType = 'REEL')
      """)
  long countReelPosts();

  long countByAuthorId(String authorId);

  long countByHiddenFalse();

  @Override
  default List<SocialPost> listFeed(int offset, int limit) {
    int size = Math.max(limit, 1);
    return findFeedPage(PageRequest.of(offset / size, size));
  }

  @Override
  default List<SocialPost> listByAuthor(String authorId, int offset, int limit) {
    int size = Math.max(limit, 1);
    return findByAuthorPage(authorId, PageRequest.of(offset / size, size));
  }

  @Override
  default List<SocialPost> listFeedForAuthors(
      Collection<String> authorIds, int offset, int limit) {
    if (authorIds == null || authorIds.isEmpty()) {
      return List.of();
    }
    int size = Math.max(limit, 1);
    return findFeedForAuthorsPage(authorIds, PageRequest.of(offset / size, size));
  }

  @Override
  default List<SocialPost> listExploreExcluding(
      Collection<String> authorIds, int offset, int limit) {
    int size = Math.max(limit, 1);
    Pageable page = PageRequest.of(offset / size, size);
    if (authorIds == null || authorIds.isEmpty()) {
      return findExploreAllPage(page);
    }
    return findExploreExcludingPage(authorIds, page);
  }

  @Override
  default List<SocialPost> listReels(int offset, int limit) {
    int size = Math.max(limit, 1);
    return findReelsPage(PageRequest.of(offset / size, size));
  }

  @Override
  default long countAll() {
    return count();
  }

  @Override
  default long countVisible() {
    return countByHiddenFalse();
  }

  @Override
  default long countByAuthor(String authorId) {
    return countByAuthorId(authorId);
  }

  @Override
  default long countFeedForAuthors(Collection<String> authorIds) {
    if (authorIds == null || authorIds.isEmpty()) {
      return 0;
    }
    return countFeedForAuthorsQuery(authorIds);
  }

  @Override
  default long countExploreExcluding(Collection<String> authorIds) {
    if (authorIds == null || authorIds.isEmpty()) {
      return countExploreAll();
    }
    return countExploreExcludingAuthors(authorIds);
  }

  @Override
  default long countReels() {
    return countReelPosts();
  }

  @Override
  default void delete(SocialPost post) {
    deleteById(post.getId());
  }
}
