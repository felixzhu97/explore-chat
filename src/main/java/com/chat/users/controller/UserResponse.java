package com.chat.users.controller;

public record UserResponse(
    String id,
    String username,
    String email,
    String phone,
    String avatar,
    String status,
    boolean isOnline) {}
