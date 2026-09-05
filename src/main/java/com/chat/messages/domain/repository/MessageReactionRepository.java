package com.chat.messages.domain.repository;

import com.chat.messages.domain.model.MessageReaction;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.messages.domain.model.MessageReaction} records. */
public interface MessageReactionRepository {

  MessageReaction save(MessageReaction reaction);

  Optional<MessageReaction> findByMessageIdAndUserIdAndEmoji(
      String messageId, String userId, String emoji);

  List<MessageReaction> findByMessageId(String messageId);
}
