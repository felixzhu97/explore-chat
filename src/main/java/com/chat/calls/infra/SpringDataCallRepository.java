package com.chat.calls.infra;

import com.chat.calls.domain.model.Call;
import com.chat.calls.domain.repository.CallRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataCallRepository extends JpaRepository<Call, String>, CallRepository {

  @Query(
      """
      select c from Call c
      where c.callerId = :userId or c.calleeId = :userId
      order by c.createdAt desc
      """)
  List<Call> findForUser(@Param("userId") String userId);

  @Override
  default List<Call> findByParticipant(String userId) {
    return findForUser(userId);
  }
}
