package com.chat.users.infra;

import com.chat.users.domain.model.BlockedUser;
import com.chat.users.domain.repository.BlockedUserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataBlockedUserRepository
    extends JpaRepository<BlockedUser, String>, BlockedUserRepository {

  @Override
  Optional<BlockedUser> findByBlockerIdAndBlockedId(String blockerId, String blockedId);

  @Override
  List<BlockedUser> findByBlockerId(String blockerId);

  @Override
  default void delete(BlockedUser blocked) {
    deleteById(blocked.getId());
  }
}
