package com.chat.users.infra;

import com.chat.users.domain.model.ChatUser;
import com.chat.users.domain.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataUserRepository extends JpaRepository<ChatUser, String>, UserRepository {

  @Override
  Optional<ChatUser> findByEmail(String email);

  @Override
  Optional<ChatUser> findByUsername(String username);

  @Override
  @Query(
      """
      select u from ChatUser u
      where lower(u.username) like lower(concat('%', :query, '%'))
      """)
  List<ChatUser> findByUsernameContainingIgnoreCase(@Param("query") String query);

  @Override
  default List<ChatUser> listRecent(int limit) {
    return findAll(PageRequest.of(0, Math.max(limit, 1))).getContent();
  }

  @Override
  default List<ChatUser> listAll(int limit) {
    return findAll(PageRequest.of(0, Math.max(limit, 1))).getContent();
  }

  @Override
  default long countAll() {
    return count();
  }
}
