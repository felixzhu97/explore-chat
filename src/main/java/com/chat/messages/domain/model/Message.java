package com.chat.messages.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Chat message content that can be edited or soft-deleted. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class Message extends AbstractEntity {

  private String chatId;
  private String senderId;
  private String type;
  private String content;
  private String mediaUrl;
  private boolean deleted;

  private Message(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String chatId,
      String senderId,
      String content) {
    super(id, createdAt, updatedAt);
    this.chatId = chatId;
    this.senderId = senderId;
    this.type = "TEXT";
    this.content = content;
    this.deleted = false;
  }

  /**
   * Creates a text message in a chat.
   *
   * @param chatId target chat id
   * @param senderId sender user id
   * @param content message body
   * @return a new {@code Message}
   */
  public static Message send(String chatId, String senderId, String content) {
    Instant now = Instant.now();
    return new Message(UUID.randomUUID().toString(), now, now, chatId, senderId, content);
  }

  /**
   * Replaces the message body.
   *
   * @param content new message body
   */
  public void edit(String content) {
    this.content = content;
    touch();
  }

  /** Marks the message deleted and clears its content. */
  public void softDelete() {
    this.deleted = true;
    this.content = "";
    touch();
  }
}
