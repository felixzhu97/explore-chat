package com.chat.calls.infra;

import com.chat.calls.domain.model.VoiceCall;
import com.chat.calls.domain.repository.VoiceCallRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataVoiceCallRepository
    extends JpaRepository<VoiceCall, String>, VoiceCallRepository {

  @Query(
      """
      select c from VoiceCall c
      where c.callerId = :userId or c.calleeId = :userId
      order by c.createdAt desc
      """)
  List<VoiceCall> findForUser(@Param("userId") String userId);

  @Override
  default List<VoiceCall> findByParticipant(String userId) {
    return findForUser(userId);
  }
}
