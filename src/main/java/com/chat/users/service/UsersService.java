package com.chat.users.service;

import com.chat.follow.domain.model.UserFollow;
import com.chat.follow.domain.repository.UserFollowRepository;
import com.chat.users.controller.UserResponse;
import com.chat.users.domain.model.BlockedUser;
import com.chat.users.domain.model.ChatUser;
import com.chat.users.domain.repository.BlockedUserRepository;
import com.chat.users.domain.repository.UserRepository;
import com.chat.users.mapper.UserMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsersService {

  private final UserRepository userRepository;
  private final UserFollowRepository followRepository;
  private final BlockedUserRepository blockedUserRepository;

  public UsersService(
      UserRepository userRepository,
      UserFollowRepository followRepository,
      BlockedUserRepository blockedUserRepository) {
    this.userRepository = userRepository;
    this.followRepository = followRepository;
    this.blockedUserRepository = blockedUserRepository;
  }

  @Transactional(readOnly = true)
  public UserResponse getById(String id) {
    ChatUser user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    return UserMapper.toResponse(user);
  }

  @Transactional
  public UserResponse updateProfile(
      String id, String username, String phone, String status, String avatar) {
    ChatUser user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    user.updateProfile(username, phone, status, avatar);
    return UserMapper.toResponse(userRepository.save(user));
  }

  @Transactional(readOnly = true)
  public List<UserResponse> search(String query, int limit) {
    return userRepository.findByUsernameContainingIgnoreCase(query).stream()
        .filter(u -> !u.isDeleted())
        .limit(Math.max(limit, 1))
        .map(UserMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public Map<String, Object> suggestions(String viewerId, int limit) {
    Set<String> exclude = new HashSet<>();
    exclude.add(viewerId);
    followRepository.findByFollowerId(viewerId).stream()
        .map(UserFollow::getFollowingId)
        .forEach(exclude::add);
    blockedUserRepository.findByBlockerId(viewerId).stream()
        .map(BlockedUser::getBlockedId)
        .forEach(exclude::add);
    List<Map<String, Object>> users = new ArrayList<>();
    for (ChatUser u : userRepository.listRecent(Math.max(limit * 3, 10))) {
      if (exclude.contains(u.getId()) || u.isDeleted() || u.isDisabled()) {
        continue;
      }
      Map<String, Object> row = new HashMap<>();
      row.put("id", u.getId());
      row.put("username", u.getUsername());
      row.put("avatar", u.getAvatar());
      row.put("description", u.getStatus() == null ? "" : u.getStatus());
      users.add(row);
      if (users.size() >= Math.max(limit, 1)) {
        break;
      }
    }
    return Map.of("users", users);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> checkFollowing(String followerId, List<String> userIds) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (String userId : userIds) {
      boolean following =
          followRepository.findByFollowerIdAndFollowingId(followerId, userId).isPresent();
      results.add(Map.of("userId", userId, "isFollowing", following));
    }
    return Map.of("results", results);
  }

  @Transactional
  public void block(String blockerId, String blockedId) {
    if (blockerId.equals(blockedId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot block self");
    }
    userRepository
        .findById(blockedId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    if (blockedUserRepository.findByBlockerIdAndBlockedId(blockerId, blockedId).isEmpty()) {
      blockedUserRepository.save(BlockedUser.of(blockerId, blockedId));
    }
  }

  @Transactional
  public void unblock(String blockerId, String blockedId) {
    blockedUserRepository
        .findByBlockerIdAndBlockedId(blockerId, blockedId)
        .ifPresent(blockedUserRepository::delete);
  }

  @Transactional
  public void delete(String userId) {
    ChatUser user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    user.softDelete();
    userRepository.save(user);
  }
}
