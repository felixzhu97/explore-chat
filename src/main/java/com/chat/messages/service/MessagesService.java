package com.chat.messages.service;

import com.chat.chats.service.ChatsService;
import com.chat.common.aip.PageTokens;
import com.chat.messages.domain.model.Message;
import com.chat.messages.domain.model.MessageReaction;
import com.chat.messages.domain.model.MessageRead;
import com.chat.messages.domain.repository.MessageReactionRepository;
import com.chat.messages.domain.repository.MessageReadRepository;
import com.chat.messages.domain.repository.MessageRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MessagesService {

  private final MessageRepository messageRepository;
  private final MessageReactionRepository reactionRepository;
  private final MessageReadRepository readRepository;
  private final ChatsService chatsService;

  public MessagesService(
      MessageRepository messageRepository,
      MessageReactionRepository reactionRepository,
      MessageReadRepository readRepository,
      ChatsService chatsService) {
    this.messageRepository = messageRepository;
    this.reactionRepository = reactionRepository;
    this.readRepository = readRepository;
    this.chatsService = chatsService;
  }

  @Transactional
  public Map<String, Object> send(String chatId, String senderId, String content) {
    chatsService.ensureParticipant(chatId, senderId);
    Message message = messageRepository.save(Message.send(chatId, senderId, content));
    return toResponse(message);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> list(
      String chatId, String userId, Integer pageSize, String pageToken) {
    chatsService.ensureParticipant(chatId, userId);
    int size = PageTokens.clampPageSize(pageSize);
    int offset = PageTokens.offsetFrom(pageToken);
    List<Map<String, Object>> messages =
        messageRepository.findByChatId(chatId, offset, size).stream()
            .map(this::toResponse)
            .toList();
    boolean hasMore = offset + size < messageRepository.countByChatId(chatId);
    Map<String, Object> body = new HashMap<>();
    body.put("messages", messages);
    PageTokens.nextOffsetToken(offset, size, hasMore)
        .ifPresent(token -> body.put("next_page_token", token));
    return body;
  }

  @Transactional
  public Map<String, Object> edit(String messageId, String userId, String content) {
    Message message = requireOwned(messageId, userId);
    message.edit(content);
    return toResponse(messageRepository.save(message));
  }

  @Transactional
  public Map<String, Object> react(String messageId, String userId, String emoji) {
    Message message =
        messageRepository
            .findById(messageId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));
    chatsService.ensureParticipant(message.getChatId(), userId);
    String reactionEmoji = emoji == null || emoji.isBlank() ? "👍" : emoji;
    MessageReaction reaction =
        reactionRepository
            .findByMessageIdAndUserIdAndEmoji(messageId, userId, reactionEmoji)
            .orElseGet(
                () ->
                    reactionRepository.save(
                        MessageReaction.of(messageId, userId, reactionEmoji)));
    Map<String, Object> body = new HashMap<>();
    body.put("id", reaction.getId());
    body.put("messageId", messageId);
    body.put("userId", userId);
    body.put("emoji", reaction.getEmoji());
    body.put("chatId", message.getChatId());
    return body;
  }

  @Transactional
  public Map<String, Object> markRead(String messageId, String userId) {
    Message message =
        messageRepository
            .findById(messageId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));
    chatsService.ensureParticipant(message.getChatId(), userId);
    MessageRead read =
        readRepository
            .findByMessageIdAndUserId(messageId, userId)
            .orElseGet(() -> readRepository.save(MessageRead.of(messageId, userId)));
    return Map.of(
        "messageId",
        messageId,
        "userId",
        userId,
        "chatId",
        message.getChatId(),
        "readAt",
        read.getCreatedAt().toString());
  }

  @Transactional
  public void delete(String messageId, String userId) {
    Message message = requireOwned(messageId, userId);
    message.softDelete();
    messageRepository.save(message);
  }

  private Message requireOwned(String messageId, String userId) {
    Message message =
        messageRepository
            .findById(messageId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));
    if (!message.getSenderId().equals(userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not message sender");
    }
    return message;
  }

  private Map<String, Object> toResponse(Message message) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", message.getId());
    body.put("chatId", message.getChatId());
    body.put("senderId", message.getSenderId());
    body.put("type", message.getType());
    body.put("content", message.getContent());
    body.put("mediaUrl", message.getMediaUrl());
    body.put("createTime", message.getCreatedAt().toString());
    return body;
  }
}
