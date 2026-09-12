package com.chat.messages.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

  @NotBlank
  private String chatId;

  @NotBlank
  private String senderId;

  @NotNull
  @Enumerated(EnumType.STRING)
  private MessageType type;

  @Size(max = 4096)
  private String content;

  @Size(max = 1024)
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
    this.type = MessageType.TEXT;
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
