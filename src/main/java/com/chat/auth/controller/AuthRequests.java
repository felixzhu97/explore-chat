package com.chat.auth.controller;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthRequests {

  private AuthRequests() {}

  public record RegisterRequest(
      @NotBlank @Email String email,
      @NotBlank String password,
      String username,
      String phone) {}

  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

  public record RefreshTokenRequest(@NotBlank String refreshToken) {}

  public record UpdateProfileRequest(String username, String phone, String status, String avatar) {}

  public record ChangePasswordRequest(
      @NotBlank String currentPassword, @NotBlank String newPassword) {}

  public record ForgotPasswordRequest(@NotBlank @Email String email) {}

  public record ResetPasswordRequest(@NotBlank String token, @NotBlank String newPassword) {}
}
