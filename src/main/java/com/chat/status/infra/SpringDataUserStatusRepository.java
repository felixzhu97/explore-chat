package com.chat.status.infra;

import com.chat.status.domain.model.UserStatus;
import com.chat.status.domain.repository.UserStatusRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataUserStatusRepository
    extends JpaRepository<UserStatus, String>, UserStatusRepository {

  @Query(
      """
      select s from UserStatus s
      where s.expiresAt > :now
      order by s.createdAt desc
      """)
  List<UserStatus> findActiveQuery(@Param("now") Instant now);

  @Override
  default List<UserStatus> findActive(Instant now) {
    return findActiveQuery(now);
  }

  @Override
  default void delete(UserStatus status) {
    deleteById(status.getId());
  }
}
