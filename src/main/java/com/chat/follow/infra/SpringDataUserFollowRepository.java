package com.chat.follow.infra;

import com.chat.follow.domain.model.UserFollow;
import com.chat.follow.domain.repository.UserFollowRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataUserFollowRepository
    extends JpaRepository<UserFollow, String>, UserFollowRepository {

  @Override
  Optional<UserFollow> findByFollowerIdAndFollowingId(String followerId, String followingId);

  @Override
  List<UserFollow> findByFollowerId(String followerId);

  @Override
  List<UserFollow> findByFollowingId(String followingId);

  @Override
  void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
}
