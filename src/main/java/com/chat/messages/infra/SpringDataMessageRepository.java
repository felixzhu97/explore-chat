package com.chat.messages.infra;

import com.chat.messages.domain.model.Message;
import com.chat.messages.domain.repository.MessageRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataMessageRepository
    extends JpaRepository<Message, String>, MessageRepository {

  @Query(
      """
      select m from Message m
      where m.chatId = :chatId
      order by m.createdAt desc
      """)
  List<Message> findPageByChatId(@Param("chatId") String chatId, Pageable pageable);

  @Override
  long countByChatId(String chatId);

  @Override
  default long countAll() {
    return count();
  }

  @Override
  default List<Message> findByChatId(String chatId, int offset, int limit) {
    int size = Math.max(limit, 1);
    int page = offset / size;
    return findPageByChatId(chatId, PageRequest.of(page, size));
  }
}
