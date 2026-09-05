package com.chat.follow.service;

import com.chat.follow.domain.model.UserFollow;
import com.chat.follow.domain.repository.UserFollowRepository;
import com.chat.notifications.service.NotificationsService;
import com.chat.users.domain.repository.UserRepository;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FollowService {

  private final UserFollowRepository follows;
  private final UserRepository users;
  private final NotificationsService notificationsService;

  public FollowService(
      UserFollowRepository follows,
      UserRepository users,
      NotificationsService notificationsService) {
    this.follows = follows;
    this.users = users;
    this.notificationsService = notificationsService;
  }

  @Transactional
  public Map<String, Object> follow(String followerId, String followingId) {
    if (followerId.equals(followingId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot follow self");
    }
    users
        .findById(followingId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    if (follows.findByFollowerIdAndFollowingId(followerId, followingId).isEmpty()) {
      follows.save(UserFollow.of(followerId, followingId));
      notificationsService.create(followingId, "FOLLOW", "{\"userId\":\"" + followerId + "\"}");
    }
    return Map.of("following", true, "userId", followingId);
  }

  @Transactional
  public void unfollow(String followerId, String followingId) {
    follows.deleteByFollowerIdAndFollowingId(followerId, followingId);
  }

  @Transactional(readOnly = true)
  public Map<String, List<String>> followers(String userId) {
    List<String> ids =
        follows.findByFollowingId(userId).stream().map(UserFollow::getFollowerId).toList();
    return Map.of("followers", ids);
  }

  @Transactional(readOnly = true)
  public Map<String, List<String>> following(String userId) {
    List<String> ids =
        follows.findByFollowerId(userId).stream().map(UserFollow::getFollowingId).toList();
    return Map.of("following", ids);
  }
}
