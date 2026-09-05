package com.chat.auth.infra;

import com.chat.auth.domain.model.RevokedToken;
import com.chat.auth.domain.repository.RevokedTokenRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataRevokedTokenRepository
    extends JpaRepository<RevokedToken, String>, RevokedTokenRepository {

  @Override
  Optional<RevokedToken> findByJti(String jti);

  @Override
  boolean existsByJti(String jti);
}
