package com.chat.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

  private final SecretKey accessKey;
  private final SecretKey refreshKey;
  private final long accessTtlSeconds;
  private final long refreshTtlSeconds;

  public JwtTokenService(
      @Value("${chat.jwt.access-secret:dev-access-secret-change-me-32bytes!!}") String accessSecret,
      @Value("${chat.jwt.refresh-secret:dev-refresh-secret-change-me-32byte}") String refreshSecret,
      @Value("${chat.jwt.access-ttl-seconds:3600}") long accessTtlSeconds,
      @Value("${chat.jwt.refresh-ttl-seconds:604800}") long refreshTtlSeconds) {
    this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
    this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
    this.accessTtlSeconds = accessTtlSeconds;
    this.refreshTtlSeconds = refreshTtlSeconds;
  }

  public String createAccessToken(String userId, String email, String username) {
    return build(accessKey, userId, email, username, accessTtlSeconds);
  }

  public String createRefreshToken(String userId, String email, String username) {
    return build(refreshKey, userId, email, username, refreshTtlSeconds);
  }

  public Claims parseAccess(String token) {
    return parse(accessKey, token);
  }

  public Claims parseRefresh(String token) {
    return parse(refreshKey, token);
  }

  private String build(
      SecretKey key, String userId, String email, String username, long ttlSeconds) {
    Instant now = Instant.now();
    return Jwts.builder()
        .id(UUID.randomUUID().toString())
        .subject(userId)
        .claim("userId", userId)
        .claim("email", email)
        .claim("username", username)
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusSeconds(ttlSeconds)))
        .signWith(key)
        .compact();
  }

  private Claims parse(SecretKey key, String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }
}
