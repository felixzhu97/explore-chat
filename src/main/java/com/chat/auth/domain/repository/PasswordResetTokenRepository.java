package com.chat.auth.domain.repository;

import com.chat.auth.domain.model.PasswordResetToken;
import java.util.Optional;

/** Persistence port for {@link com.chat.auth.domain.model.PasswordResetToken} records. */
public interface PasswordResetTokenRepository {

  PasswordResetToken save(PasswordResetToken token);

  Optional<PasswordResetToken> findByToken(String token);
}
