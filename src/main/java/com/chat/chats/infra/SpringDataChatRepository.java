package com.chat.chats.infra;

import com.chat.chats.domain.model.Chat;
import com.chat.chats.domain.repository.ChatRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataChatRepository extends JpaRepository<Chat, String>, ChatRepository {}
