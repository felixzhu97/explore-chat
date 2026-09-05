package com.chat.chats.service;

import com.chat.chats.domain.model.Chat;
import com.chat.chats.domain.model.ChatParticipant;
import com.chat.chats.domain.model.ChatType;
import com.chat.chats.domain.repository.ChatParticipantRepository;
import com.chat.chats.domain.repository.ChatRepository;
import com.chat.groups.domain.model.GroupParticipant;
import com.chat.groups.domain.model.SocialGroup;
import com.chat.groups.domain.repository.GroupParticipantRepository;
import com.chat.groups.domain.repository.SocialGroupRepository;
import com.chat.messages.domain.model.Message;
import com.chat.messages.domain.repository.MessageRepository;
import com.chat.users.domain.repository.UserRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ChatsService {

  private final ChatRepository chatRepository;
  private final ChatParticipantRepository participantRepository;
  private final SocialGroupRepository socialGroupRepository;
  private final GroupParticipantRepository groupParticipantRepository;
  private final UserRepository userRepository;
  private final MessageRepository messageRepository;

  public ChatsService(
      ChatRepository chatRepository,
      ChatParticipantRepository participantRepository,
      SocialGroupRepository socialGroupRepository,
      GroupParticipantRepository groupParticipantRepository,
      UserRepository userRepository,
      MessageRepository messageRepository) {
    this.chatRepository = chatRepository;
    this.participantRepository = participantRepository;
    this.socialGroupRepository = socialGroupRepository;
    this.groupParticipantRepository = groupParticipantRepository;
    this.userRepository = userRepository;
    this.messageRepository = messageRepository;
  }

  @Transactional
  public Map<String, Object> createPrivate(String creatorId, String peerUserId) {
    Chat chat = chatRepository.save(Chat.createPrivate());
    participantRepository.save(ChatParticipant.join(chat.getId(), creatorId, "MEMBER"));
    participantRepository.save(ChatParticipant.join(chat.getId(), peerUserId, "MEMBER"));
    return toResponse(chat, creatorId);
  }

  @Transactional
  public Map<String, Object> createGroupChat(
      String creatorId, String name, List<String> memberIds) {
    Chat chat = chatRepository.save(Chat.createGroup(name));
    participantRepository.save(ChatParticipant.join(chat.getId(), creatorId, "OWNER"));
    SocialGroup group =
        socialGroupRepository.save(SocialGroup.create(name, creatorId, null));
    groupParticipantRepository.save(GroupParticipant.join(group.getId(), creatorId, "owner"));
    if (memberIds != null) {
      for (String memberId : memberIds) {
        if (memberId == null || memberId.equals(creatorId)) {
          continue;
        }
        participantRepository.save(ChatParticipant.join(chat.getId(), memberId, "MEMBER"));
        groupParticipantRepository.save(GroupParticipant.join(group.getId(), memberId, "member"));
      }
    }
    Map<String, Object> body = toResponse(chat, creatorId);
    body.put("groupId", group.getId());
    return body;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> listForUser(String userId) {
    List<Map<String, Object>> chats =
        participantRepository.findByUserId(userId).stream()
            .map(ChatParticipant::getChatId)
            .distinct()
            .map(
                id ->
                    chatRepository
                        .findById(id)
                        .filter(c -> !c.isDeleted())
                        .map(c -> toResponse(c, userId))
                        .orElse(null))
            .filter(m -> m != null)
            .toList();
    return Map.of("chats", chats);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> get(String chatId, String userId) {
    ensureParticipant(chatId, userId);
    Chat chat =
        chatRepository
            .findById(chatId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
    if (chat.isDeleted()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found");
    }
    return toResponse(chat, userId);
  }

  @Transactional
  public Map<String, Object> patch(String chatId, String userId, String name) {
    ensureParticipant(chatId, userId);
    Chat chat =
        chatRepository
            .findById(chatId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
    if (name != null) {
      chat.rename(name);
    }
    return toResponse(chatRepository.save(chat), userId);
  }

  @Transactional
  public void archive(String chatId, String userId) {
    ensureParticipant(chatId, userId);
    participantRepository.findByChatId(chatId).stream()
        .filter(p -> p.getUserId().equals(userId))
        .findFirst()
        .ifPresent(
            p -> {
              p.archive(true);
              participantRepository.save(p);
            });
  }

  @Transactional
  public void mute(String chatId, String userId, boolean muted) {
    ensureParticipant(chatId, userId);
    participantRepository.findByChatId(chatId).stream()
        .filter(p -> p.getUserId().equals(userId))
        .findFirst()
        .ifPresent(
            p -> {
              p.mute(muted);
              participantRepository.save(p);
            });
  }

  @Transactional
  public void delete(String chatId, String userId) {
    ensureParticipant(chatId, userId);
    Chat chat =
        chatRepository
            .findById(chatId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
    chat.softDelete();
    chatRepository.save(chat);
  }

  public void ensureParticipant(String chatId, String userId) {
    if (!participantRepository.existsByChatIdAndUserId(chatId, userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a chat participant");
    }
  }

  private Map<String, Object> toResponse(Chat chat, String viewerId) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", chat.getId());
    body.put("type", chat.getType().name());
    body.put("name", chat.getName());
    body.put("avatar", chat.getAvatar());
    body.put("deleted", chat.isDeleted());
    body.put("createdAt", chat.getCreatedAt().toString());
    body.put("createTime", chat.getCreatedAt().toString());
    if (chat.getType() == ChatType.PRIVATE && viewerId != null) {
      participantRepository.findByChatId(chat.getId()).stream()
          .map(ChatParticipant::getUserId)
          .filter(id -> !id.equals(viewerId))
          .findFirst()
          .flatMap(userRepository::findById)
          .ifPresent(
              peer -> {
                body.put("name", peer.getUsername());
                body.put("avatar", peer.getAvatar());
                body.put("peerUserId", peer.getId());
              });
    }
    List<Message> latest = messageRepository.findByChatId(chat.getId(), 0, 1);
    if (!latest.isEmpty()) {
      Message message = latest.get(0);
      Map<String, Object> last = new HashMap<>();
      last.put("id", message.getId());
      last.put("chatId", message.getChatId());
      last.put("senderId", message.getSenderId());
      last.put("type", message.getType());
      last.put("content", message.getContent());
      last.put("createdAt", message.getCreatedAt().toString());
      body.put("lastMessage", last);
    }
    return body;
  }
}
