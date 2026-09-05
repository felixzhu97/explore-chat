package com.chat.auth.infra;

import com.chat.auth.domain.model.PasswordResetToken;
import com.chat.auth.domain.repository.PasswordResetTokenRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataPasswordResetTokenRepository
    extends JpaRepository<PasswordResetToken, String>, PasswordResetTokenRepository {

  @Override
  Optional<PasswordResetToken> findByToken(String token);
}
