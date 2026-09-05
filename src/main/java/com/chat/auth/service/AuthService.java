package com.chat.auth.service;

import com.chat.auth.domain.model.PasswordResetToken;
import com.chat.auth.domain.model.RevokedToken;
import com.chat.auth.domain.repository.PasswordResetTokenRepository;
import com.chat.auth.domain.repository.RevokedTokenRepository;
import com.chat.users.controller.UserResponse;
import com.chat.users.domain.model.ChatUser;
import com.chat.users.domain.repository.UserRepository;
import com.chat.users.mapper.UserMapper;
import io.jsonwebtoken.Claims;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenService jwtTokenService;
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final RevokedTokenRepository revokedTokenRepository;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtTokenService jwtTokenService,
      PasswordResetTokenRepository passwordResetTokenRepository,
      RevokedTokenRepository revokedTokenRepository) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtTokenService = jwtTokenService;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.revokedTokenRepository = revokedTokenRepository;
  }

  @Transactional
  public Map<String, Object> register(
      String email, String password, String username, String phone) {
    if (userRepository.findByEmail(email).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists");
    }
    String name = username == null || username.isBlank() ? email : username;
    ChatUser user = ChatUser.register(name, email, passwordEncoder.encode(password));
    if (phone != null && !phone.isBlank()) {
      user.updateProfile(null, phone, null, null);
    }
    user = userRepository.save(user);
    return authBody(user);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> login(String email, String password) {
    ChatUser user =
        userRepository
            .findByEmail(email)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));
    if (user.isDeleted() || user.isDisabled()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account unavailable");
    }
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }
    return authBody(user);
  }

  @Transactional(readOnly = true)
  public Map<String, String> refresh(String refreshToken) {
    try {
      var claims = jwtTokenService.parseRefresh(refreshToken);
      if (isRevoked(claims)) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
      }
      String userId = claims.getSubject();
      ChatUser user =
          userRepository
              .findById(userId)
              .orElseThrow(
                  () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token"));
      return Map.of(
          "token",
          jwtTokenService.createAccessToken(user.getId(), user.getEmail(), user.getUsername()),
          "refreshToken",
          jwtTokenService.createRefreshToken(user.getId(), user.getEmail(), user.getUsername()));
    } catch (ResponseStatusException ex) {
      throw ex;
    } catch (RuntimeException ex) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
    }
  }

  @Transactional
  public void changePassword(String userId, String currentPassword, String newPassword) {
    ChatUser user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
    }
    user.changePassword(newPassword, passwordEncoder::encode);
    userRepository.save(user);
  }

  @Transactional
  public Map<String, Object> forgotPassword(String email) {
    ChatUser user =
        userRepository
            .findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    String token = UUID.randomUUID().toString().replace("-", "");
    PasswordResetToken reset =
        passwordResetTokenRepository.save(
            PasswordResetToken.issue(user.getId(), token, Instant.now().plus(1, ChronoUnit.HOURS)));
    Map<String, Object> body = new HashMap<>();
    body.put("ok", true);
    body.put("token", reset.getToken());
    return body;
  }

  @Transactional
  public void resetPassword(String token, String newPassword) {
    PasswordResetToken reset =
        passwordResetTokenRepository
            .findByToken(token)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset token"));
    if (!reset.isValid(Instant.now())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token expired");
    }
    ChatUser user =
        userRepository
            .findById(reset.getUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    user.changePassword(newPassword, passwordEncoder::encode);
    userRepository.save(user);
    reset.markUsed();
    passwordResetTokenRepository.save(reset);
  }

  @Transactional
  public void logout(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      return;
    }
    String token = authorizationHeader.substring(7);
    try {
      Claims claims = jwtTokenService.parseAccess(token);
      String jti = claims.getId();
      if (jti != null && !jti.isBlank() && !revokedTokenRepository.existsByJti(jti)) {
        Instant expires =
            claims.getExpiration() == null
                ? Instant.now().plus(1, ChronoUnit.HOURS)
                : claims.getExpiration().toInstant();
        revokedTokenRepository.save(RevokedToken.of(jti, expires));
      }
    } catch (RuntimeException ignored) {
      // best-effort logout
    }
  }

  private boolean isRevoked(Claims claims) {
    String jti = claims.getId();
    return jti != null && revokedTokenRepository.existsByJti(jti);
  }

  private Map<String, Object> authBody(ChatUser user) {
    UserResponse response = UserMapper.toResponse(user);
    return Map.of(
        "user",
        response,
        "token",
        jwtTokenService.createAccessToken(user.getId(), user.getEmail(), user.getUsername()),
        "refreshToken",
        jwtTokenService.createRefreshToken(user.getId(), user.getEmail(), user.getUsername()));
  }
}
