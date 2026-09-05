package com.chat.groups.infra;

import com.chat.groups.domain.model.GroupParticipant;
import com.chat.groups.domain.repository.GroupParticipantRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataGroupParticipantRepository
    extends JpaRepository<GroupParticipant, String>, GroupParticipantRepository {

  @Override
  Optional<GroupParticipant> findByGroupIdAndUserId(String groupId, String userId);

  @Override
  List<GroupParticipant> findByGroupId(String groupId);

  @Override
  default void delete(GroupParticipant participant) {
    deleteById(participant.getId());
  }
}
