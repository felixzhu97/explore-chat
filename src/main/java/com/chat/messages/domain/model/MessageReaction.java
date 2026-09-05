package com.chat.messages.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Immutable emoji reaction applied by a user to a message. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class MessageReaction extends AbstractImmutable {

  private String messageId;
  private String userId;
  private String emoji;

  private MessageReaction(
      String id, Instant createdAt, String messageId, String userId, String emoji) {
    super(id, createdAt);
    this.messageId = messageId;
    this.userId = userId;
    this.emoji = emoji;
  }

  /**
   * Creates a reaction for a message.
   *
   * @param messageId target message id
   * @param userId reacting user id
   * @param emoji reaction emoji
   * @return a new {@code MessageReaction}
   */
  public static MessageReaction of(String messageId, String userId, String emoji) {
    return new MessageReaction(
        UUID.randomUUID().toString(), Instant.now(), messageId, userId, emoji);
  }
}
