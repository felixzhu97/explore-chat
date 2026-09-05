package com.chat.messages.infra;

import com.chat.messages.domain.model.MessageReaction;
import com.chat.messages.domain.repository.MessageReactionRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataMessageReactionRepository
    extends JpaRepository<MessageReaction, String>, MessageReactionRepository {

  @Override
  Optional<MessageReaction> findByMessageIdAndUserIdAndEmoji(
      String messageId, String userId, String emoji);

  @Override
  List<MessageReaction> findByMessageId(String messageId);
}
