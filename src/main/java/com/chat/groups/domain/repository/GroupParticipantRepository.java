package com.chat.groups.domain.repository;

import com.chat.groups.domain.model.GroupParticipant;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.groups.domain.model.GroupParticipant} records. */
public interface GroupParticipantRepository {

  GroupParticipant save(GroupParticipant participant);

  Optional<GroupParticipant> findByGroupIdAndUserId(String groupId, String userId);

  List<GroupParticipant> findByGroupId(String groupId);

  void delete(GroupParticipant participant);
}
