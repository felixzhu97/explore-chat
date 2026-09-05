package com.chat.auth.domain.model;

import com.chat.base.domain.AbstractImmutable;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Revoked JWT identified by {@code jti} until its natural expiry. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class RevokedToken extends AbstractImmutable {

  private String jti;
  private Instant expiresAt;

  private RevokedToken(String id, Instant createdAt, String jti, Instant expiresAt) {
    super(id, createdAt);
    this.jti = jti;
    this.expiresAt = expiresAt;
  }

  /**
   * Records a revoked token id.
   *
   * @param jti JWT ID claim
   * @param expiresAt original token expiry
   * @return a new {@code RevokedToken}
   */
  public static RevokedToken of(String jti, Instant expiresAt) {
    return new RevokedToken(UUID.randomUUID().toString(), Instant.now(), jti, expiresAt);
  }
}
