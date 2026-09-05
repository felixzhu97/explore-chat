package com.chat.messages.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Immutable receipt that a user has read a message. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class MessageRead extends AbstractImmutable {

  private String messageId;
  private String userId;

  private MessageRead(String id, Instant createdAt, String messageId, String userId) {
    super(id, createdAt);
    this.messageId = messageId;
    this.userId = userId;
  }

  /**
   * Creates a read receipt for a message.
   *
   * @param messageId read message id
   * @param userId reader user id
   * @return a new {@code MessageRead}
   */
  public static MessageRead of(String messageId, String userId) {
    return new MessageRead(UUID.randomUUID().toString(), Instant.now(), messageId, userId);
  }
}
