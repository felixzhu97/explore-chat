package com.chat.post.infra;

import com.chat.post.domain.model.Hashtag;
import com.chat.post.domain.repository.HashtagRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataHashtagRepository
    extends JpaRepository<Hashtag, String>, HashtagRepository {

  @Override
  Optional<Hashtag> findByTag(String tag);

  @Override
  @Query(
      """
      select h from Hashtag h
      where lower(h.tag) like lower(concat('%', :query, '%'))
      order by h.postCount desc
      """)
  List<Hashtag> findByTagContainingIgnoreCase(@Param("query") String query);
}
