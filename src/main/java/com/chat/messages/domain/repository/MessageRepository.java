package com.chat.messages.domain.repository;

import com.chat.messages.domain.model.Message;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.messages.domain.model.Message} aggregates. */
public interface MessageRepository {

  Message save(Message message);

  Optional<Message> findById(String id);

  List<Message> findByChatId(String chatId, int offset, int limit);

  long countByChatId(String chatId);

  long countAll();
}
