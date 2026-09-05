package com.chat.users.domain.repository;

import com.chat.users.domain.model.ChatUser;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.users.domain.model.ChatUser} aggregates. */
public interface UserRepository {

  ChatUser save(ChatUser user);

  Optional<ChatUser> findById(String id);

  Optional<ChatUser> findByEmail(String email);

  Optional<ChatUser> findByUsername(String username);

  List<ChatUser> findByUsernameContainingIgnoreCase(String query);

  List<ChatUser> listRecent(int limit);

  List<ChatUser> listAll(int limit);

  long countAll();
}
