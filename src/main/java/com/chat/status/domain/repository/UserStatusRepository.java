package com.chat.status.domain.repository;

import com.chat.status.domain.model.UserStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.status.domain.model.UserStatus} aggregates. */
public interface UserStatusRepository {

  UserStatus save(UserStatus status);

  Optional<UserStatus> findById(String id);

  List<UserStatus> findActive(Instant now);

  void delete(UserStatus status);
}
