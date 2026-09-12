package com.chat.chats.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Membership of a user in a chat with archive and mute flags. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class ChatParticipant extends AbstractEntity {

  private String chatId;
  private String userId;
  private String role;
  private boolean archived;
  private boolean muted;

  private ChatParticipant(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String chatId,
      String userId,
      String role) {
    super(id, createdAt, updatedAt);
    this.chatId = chatId;
    this.userId = userId;
    this.role = role;
    this.archived = false;
    this.muted = false;
  }

  /**
   * Adds a user to a chat with the given role.
   *
   * @param chatId chat id
   * @param userId participant user id
   * @param role participant role
   * @return a new {@code ChatParticipant}
   */
  public static ChatParticipant join(String chatId, String userId, String role) {
    Instant now = Instant.now();
    return new ChatParticipant(
        UUID.randomUUID().toString(), now, now, chatId, userId, role);
  }

  /**
   * Sets whether this chat is archived for the participant.
   *
   * @param archived {@code true} to archive
   */
  public void archive(boolean archived) {
    this.archived = archived;
    touch();
  }

  /**
   * Sets whether notifications are muted for the participant.
   *
   * @param muted {@code true} to mute
   */
  public void mute(boolean muted) {
    this.muted = muted;
    touch();
  }
}
