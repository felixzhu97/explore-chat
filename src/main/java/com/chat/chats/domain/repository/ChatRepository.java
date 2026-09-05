package com.chat.chats.domain.repository;

import com.chat.chats.domain.model.Chat;
import java.util.Optional;

/** Persistence port for {@link com.chat.chats.domain.model.Chat} aggregates. */
public interface ChatRepository {

  Chat save(Chat chat);

  Optional<Chat> findById(String id);
}
