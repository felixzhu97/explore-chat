package com.chat.users.domain.repository;

import com.chat.users.domain.model.BlockedUser;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.users.domain.model.BlockedUser} records. */
public interface BlockedUserRepository {

  BlockedUser save(BlockedUser blocked);

  Optional<BlockedUser> findByBlockerIdAndBlockedId(String blockerId, String blockedId);

  List<BlockedUser> findByBlockerId(String blockerId);

  void delete(BlockedUser blocked);
}
