package com.chat.groups.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Social group owned by a user with optional description. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class SocialGroup extends AbstractEntity {

  private String name;
  private String description;
  private String avatar;
  private String ownerId;

  private SocialGroup(
      String id, Instant createdAt, Instant updatedAt, String name, String ownerId) {
    super(id, createdAt, updatedAt);
    this.name = Objects.requireNonNull(name);
    this.ownerId = Objects.requireNonNull(ownerId);
  }

  /**
   * Creates a group owned by the given user.
   *
   * @param name group name
   * @param ownerId owner user id
   * @param description optional description
   * @return a new {@code SocialGroup}
   */
  public static SocialGroup create(String name, String ownerId, String description) {
    Instant now = Instant.now();
    SocialGroup group = new SocialGroup(UUID.randomUUID().toString(), now, now, name, ownerId);
    group.description = description;
    return group;
  }

  /**
   * Renames the group when the new name is non-blank.
   *
   * @param name new group name
   */
  public void rename(String name) {
    if (name != null && !name.isBlank()) {
      this.name = name;
      touch();
    }
  }

  /**
   * Asserts that {@code userId} is the group owner.
   *
   * @param userId candidate owner id
   * @throws IllegalStateException when the user is not the owner
   */
  public void assertOwnedBy(String userId) {
    if (!ownerId.equals(userId)) {
      throw new IllegalStateException("Not group owner");
    }
  }
}
