package com.chat.groups.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Membership of a user in a social group. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class GroupParticipant extends AbstractImmutable {

  private String groupId;
  private String userId;
  private String role;

  private GroupParticipant(
      String id, Instant createdAt, String groupId, String userId, String role) {
    super(id, createdAt);
    this.groupId = groupId;
    this.userId = userId;
    this.role = role;
  }

  /**
   * Adds a user to a group with the given role.
   *
   * @param groupId group id
   * @param userId participant user id
   * @param role participant role, defaults to {@code member}
   * @return a new {@code GroupParticipant}
   */
  public static GroupParticipant join(String groupId, String userId, String role) {
    return new GroupParticipant(
        UUID.randomUUID().toString(),
        Instant.now(),
        groupId,
        userId,
        role == null ? "member" : role);
  }
}
