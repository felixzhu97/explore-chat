package com.chat.auth.controller;

import com.chat.auth.controller.AuthRequests.ChangePasswordRequest;
import com.chat.auth.controller.AuthRequests.ForgotPasswordRequest;
import com.chat.auth.controller.AuthRequests.LoginRequest;
import com.chat.auth.controller.AuthRequests.RefreshTokenRequest;
import com.chat.auth.controller.AuthRequests.RegisterRequest;
import com.chat.auth.controller.AuthRequests.ResetPasswordRequest;
import com.chat.auth.controller.AuthRequests.UpdateProfileRequest;
import com.chat.auth.service.AuthService;
import com.chat.users.controller.UserResponse;
import com.chat.users.service.UsersService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final AuthService authService;
  private final UsersService usersService;

  public AuthController(AuthService authService, UsersService usersService) {
    this.authService = authService;
    this.usersService = usersService;
  }

  @PostMapping("register")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> register(@Valid @RequestBody RegisterRequest body) {
    return authService.register(body.email(), body.password(), body.username(), body.phone());
  }

  @PostMapping("login")
  public Map<String, Object> login(@Valid @RequestBody LoginRequest body) {
    return authService.login(body.email(), body.password());
  }

  @PostMapping("refreshToken")
  public Map<String, String> refresh(@Valid @RequestBody RefreshTokenRequest body) {
    return authService.refresh(body.refreshToken());
  }

  @PostMapping("logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void logout(HttpServletRequest request) {
    authService.logout(request.getHeader("Authorization"));
  }

  @PostMapping("changePassword")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void changePassword(
      Authentication authentication, @Valid @RequestBody ChangePasswordRequest body) {
    authService.changePassword(
        authentication.getName(), body.currentPassword(), body.newPassword());
  }

  @PostMapping("forgotPassword")
  public Map<String, Object> forgotPassword(@Valid @RequestBody ForgotPasswordRequest body) {
    return authService.forgotPassword(body.email());
  }

  @PostMapping("resetPassword")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void resetPassword(@Valid @RequestBody ResetPasswordRequest body) {
    authService.resetPassword(body.token(), body.newPassword());
  }

  @GetMapping("me")
  public Map<String, UserResponse> me(Authentication authentication) {
    return Map.of("user", usersService.getById(authentication.getName()));
  }

  @PatchMapping("profile")
  public Map<String, UserResponse> profile(
      Authentication authentication, @RequestBody UpdateProfileRequest body) {
    UserResponse user =
        usersService.updateProfile(
            authentication.getName(), body.username(), body.phone(), body.status(), body.avatar());
    return Map.of("user", user);
  }
}
