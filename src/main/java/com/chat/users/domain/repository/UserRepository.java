package com.chat.users.domain.repository;

import com.chat.users.domain.model.User;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.users.domain.model.User} aggregates. */
public interface UserRepository {

  User save(User user);

  Optional<User> findById(String id);

  Optional<User> findByEmail(String email);

  Optional<User> findByUsername(String username);

  List<User> findByUsernameContainingIgnoreCase(String query);

  List<User> listRecent(int limit);

  List<User> listAll(int limit);

  long countAll();
}
