package com.chat.messages.infra;

import com.chat.messages.domain.model.MessageRead;
import com.chat.messages.domain.repository.MessageReadRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataMessageReadRepository
    extends JpaRepository<MessageRead, String>, MessageReadRepository {

  @Override
  Optional<MessageRead> findByMessageIdAndUserId(String messageId, String userId);
}
