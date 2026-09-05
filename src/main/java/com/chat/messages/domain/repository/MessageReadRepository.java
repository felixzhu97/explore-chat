package com.chat.messages.domain.repository;

import com.chat.messages.domain.model.MessageRead;
import java.util.Optional;

/** Persistence port for {@link com.chat.messages.domain.model.MessageRead} records. */
public interface MessageReadRepository {

  MessageRead save(MessageRead read);

  Optional<MessageRead> findByMessageIdAndUserId(String messageId, String userId);
}
