package com.chat.chats.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Conversation container for private or group messaging. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class Chat extends AbstractEntity {

  @Enumerated(EnumType.STRING)
  private ChatType type;

  private String name;
  private String avatar;
  private boolean deleted;

  private Chat(String id, Instant createdAt, Instant updatedAt, ChatType type, String name) {
    super(id, createdAt, updatedAt);
    this.type = type;
    this.name = name;
    this.deleted = false;
  }

  /**
   * Creates a private one-to-one chat.
   *
   * @return a new private {@code Chat}
   */
  public static Chat createPrivate() {
    Instant now = Instant.now();
    return new Chat(UUID.randomUUID().toString(), now, now, ChatType.PRIVATE, null);
  }

  /**
   * Creates a named group chat.
   *
   * @param name group display name
   * @return a new group {@code Chat}
   */
  public static Chat createGroup(String name) {
    Instant now = Instant.now();
    return new Chat(UUID.randomUUID().toString(), now, now, ChatType.GROUP, name);
  }

  /**
   * Updates the chat display name.
   *
   * @param name new display name
   */
  public void rename(String name) {
    this.name = name;
    touch();
  }

  /** Marks the chat as soft-deleted. */
  public void softDelete() {
    this.deleted = true;
    touch();
  }
}
