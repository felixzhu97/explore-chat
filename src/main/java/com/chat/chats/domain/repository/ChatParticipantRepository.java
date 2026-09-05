package com.chat.chats.domain.repository;

import com.chat.chats.domain.model.ChatParticipant;
import java.util.List;

/** Persistence port for {@link com.chat.chats.domain.model.ChatParticipant} records. */
public interface ChatParticipantRepository {

  ChatParticipant save(ChatParticipant participant);

  List<ChatParticipant> findByUserId(String userId);

  List<ChatParticipant> findByChatId(String chatId);

  boolean existsByChatIdAndUserId(String chatId, String userId);
}
