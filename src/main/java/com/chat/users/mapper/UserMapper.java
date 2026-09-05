package com.chat.users.mapper;

import com.chat.users.controller.UserResponse;
import com.chat.users.domain.model.ChatUser;

public final class UserMapper {

  private UserMapper() {}

  public static UserResponse toResponse(ChatUser user) {
    return new UserResponse(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getPhone(),
        user.getAvatar(),
        user.getStatus(),
        user.isOnline());
  }
}
