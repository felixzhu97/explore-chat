package com.chat.follow.domain.repository;

import com.chat.follow.domain.model.UserFollow;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.follow.domain.model.UserFollow} records. */
public interface UserFollowRepository {

  UserFollow save(UserFollow follow);

  Optional<UserFollow> findByFollowerIdAndFollowingId(String followerId, String followingId);

  List<UserFollow> findByFollowerId(String followerId);

  List<UserFollow> findByFollowingId(String followingId);

  void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
}
