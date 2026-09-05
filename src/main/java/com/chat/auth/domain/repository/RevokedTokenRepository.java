package com.chat.auth.domain.repository;

import com.chat.auth.domain.model.RevokedToken;
import java.util.Optional;

/** Persistence port for {@link com.chat.auth.domain.model.RevokedToken} records. */
public interface RevokedTokenRepository {

  RevokedToken save(RevokedToken token);

  Optional<RevokedToken> findByJti(String jti);

  boolean existsByJti(String jti);
}
