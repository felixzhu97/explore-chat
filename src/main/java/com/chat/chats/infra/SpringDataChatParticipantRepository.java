package com.chat.chats.infra;

import com.chat.chats.domain.model.ChatParticipant;
import com.chat.chats.domain.repository.ChatParticipantRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataChatParticipantRepository
    extends JpaRepository<ChatParticipant, String>, ChatParticipantRepository {

  @Override
  List<ChatParticipant> findByUserId(String userId);

  @Override
  List<ChatParticipant> findByChatId(String chatId);

  @Override
  boolean existsByChatIdAndUserId(String chatId, String userId);
}
