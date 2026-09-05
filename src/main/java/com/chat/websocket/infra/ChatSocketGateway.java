package com.chat.websocket.infra;

import com.chat.auth.service.JwtTokenService;
import com.chat.calls.service.CallsService;
import com.chat.common.messaging.ChatEventPublisher;
import com.chat.messages.service.MessagesService;
import com.chat.status.service.StatusService;
import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.annotation.PostConstruct;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

/** Socket.IO gateway mirroring Nest chat.gateway event names. */
@Component
@ConditionalOnBean(SocketIOServer.class)
public class ChatSocketGateway {

  private final SocketIOServer server;
  private final JwtTokenService jwtTokenService;
  private final MessagesService messagesService;
  private final CallsService callsService;
  private final StatusService statusService;
  private final ChatEventPublisher chatEventPublisher;
  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

  public ChatSocketGateway(
      SocketIOServer server,
      JwtTokenService jwtTokenService,
      MessagesService messagesService,
      CallsService callsService,
      StatusService statusService,
      ChatEventPublisher chatEventPublisher) {
    this.server = server;
    this.jwtTokenService = jwtTokenService;
    this.messagesService = messagesService;
    this.callsService = callsService;
    this.statusService = statusService;
    this.chatEventPublisher = chatEventPublisher;
  }

  @PostConstruct
  void register() {
    server.addConnectListener(onConnect());
    server.addDisconnectListener(onDisconnect());
    server.addEventListener("chat:join", Map.class, onChatJoin());
    server.addEventListener("chat:leave", Map.class, onChatLeave());
    server.addEventListener("message:send", Map.class, onMessageSend());
    server.addEventListener("message:typing", Map.class, onTyping());
    server.addEventListener("message:read", Map.class, onMessageRead());
    server.addEventListener("message:reaction", Map.class, onMessageReaction());
    server.addEventListener("call:incoming", Map.class, onCallIncoming());
    server.addEventListener("call:answer", Map.class, onCallAnswer());
    server.addEventListener("call:reject", Map.class, onCallReject());
    server.addEventListener("call:end", Map.class, onCallEnd());
    server.addEventListener("call:ice-candidate", Map.class, relay("call:ice-candidate"));
    server.addEventListener("call:offer", Map.class, relay("call:offer"));
    server.addEventListener("call:webrtc-answer", Map.class, relay("call:webrtc-answer"));
    server.addEventListener("status:create", Map.class, onStatusCreate());
    server.addEventListener("user:status", Map.class, onUserStatus());
  }

  private ConnectListener onConnect() {
    return client -> {
      String token = extractToken(client);
      if (token == null) {
        client.disconnect();
        return;
      }
      try {
        Claims claims = jwtTokenService.parseAccess(token);
        String userId = claims.getSubject();
        client.set("userId", userId);
        client.joinRoom("user:" + userId);
      } catch (RuntimeException ex) {
        client.disconnect();
      }
    };
  }

  private DisconnectListener onDisconnect() {
    return client -> {};
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onChatJoin() {
    return (client, data, ack) -> {
      Object chatId = data.get("chatId");
      if (chatId != null) {
        client.joinRoom("chat:" + chatId);
      }
      ackIfPresent(ack, Map.of("ok", true));
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onChatLeave() {
    return (client, data, ack) -> {
      Object chatId = data.get("chatId");
      if (chatId != null) {
        client.leaveRoom("chat:" + chatId);
      }
      ackIfPresent(ack, Map.of("ok", true));
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onMessageSend() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      String chatId = String.valueOf(data.get("chatId"));
      String content = String.valueOf(data.getOrDefault("content", ""));
      Map<String, Object> message = messagesService.send(chatId, userId, content);
      server.getRoomOperations("chat:" + chatId).sendEvent("message:received", message);
      Object peerUserId = data.get("peerUserId");
      if (peerUserId != null) {
        publishOffline(String.valueOf(peerUserId), message);
      }
      ackIfPresent(ack, message);
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onTyping() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      Object chatId = data.get("chatId");
      if (chatId != null) {
        server
            .getRoomOperations("chat:" + chatId)
            .sendEvent("message:typing", Map.of("chatId", chatId, "userId", userId));
      }
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onMessageRead() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      String messageId = String.valueOf(data.get("messageId"));
      Map<String, Object> read = messagesService.markRead(messageId, userId);
      Object chatId = read.get("chatId");
      if (chatId != null) {
        server.getRoomOperations("chat:" + chatId).sendEvent("message:read", read);
      }
      ackIfPresent(ack, read);
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onMessageReaction() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      String messageId = String.valueOf(data.get("messageId"));
      String emoji = String.valueOf(data.getOrDefault("emoji", "👍"));
      Map<String, Object> reaction = messagesService.react(messageId, userId, emoji);
      Object chatId = reaction.get("chatId");
      if (chatId != null) {
        server.getRoomOperations("chat:" + chatId).sendEvent("message:reaction", reaction);
      }
      ackIfPresent(ack, reaction);
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onCallIncoming() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      String calleeId = String.valueOf(data.getOrDefault("peerUserId", data.get("calleeId")));
      String callType = String.valueOf(data.getOrDefault("callType", "audio"));
      Map<String, Object> call = callsService.invite(userId, calleeId, callType);
      server.getRoomOperations("user:" + calleeId).sendEvent("call:incoming", call);
      publishOffline(calleeId, call);
      ackIfPresent(ack, call);
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onCallAnswer() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      String callId = String.valueOf(data.get("callId"));
      Map<String, Object> call = callsService.answer(callId);
      relayToPeer(call, userId, "call:answer");
      ackIfPresent(ack, call);
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onCallReject() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      String callId = String.valueOf(data.get("callId"));
      Map<String, Object> call = callsService.reject(callId);
      relayToPeer(call, userId, "call:reject");
      ackIfPresent(ack, call);
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onCallEnd() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      String callId = String.valueOf(data.get("callId"));
      Map<String, Object> call = callsService.end(callId);
      relayToPeer(call, userId, "call:end");
      ackIfPresent(ack, call);
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onStatusCreate() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      Map<String, Object> status =
          statusService.create(
              userId,
              data.get("content") == null ? null : String.valueOf(data.get("content")),
              data.get("mediaUrl") == null ? null : String.valueOf(data.get("mediaUrl")),
              data.get("statusType") == null ? "TEXT" : String.valueOf(data.get("statusType")));
      server.getBroadcastOperations().sendEvent("status:create", status);
      ackIfPresent(ack, status);
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> onUserStatus() {
    return (client, data, ack) -> {
      String userId = client.get("userId");
      Map<String, Object> payload = Map.of("userId", userId, "status", data);
      server.getBroadcastOperations().sendEvent("user:status", payload);
      ackIfPresent(ack, payload);
    };
  }

  @SuppressWarnings("unchecked")
  private DataListener<Map> relay(String event) {
    return (client, data, ack) -> {
      Object targetUserId = data.get("peerUserId");
      if (targetUserId != null) {
        server.getRoomOperations("user:" + targetUserId).sendEvent(event, data);
      }
      ackIfPresent(ack, Map.of("ok", true));
    };
  }

  private void relayToPeer(Map<String, Object> call, String actorId, String event) {
    String callerId = String.valueOf(call.get("callerId"));
    String calleeId = String.valueOf(call.get("calleeId"));
    String peer = actorId.equals(callerId) ? calleeId : callerId;
    server.getRoomOperations("user:" + peer).sendEvent(event, call);
  }

  private void publishOffline(String recipientUserId, Object payload) {
    try {
      chatEventPublisher.sendOfflineMessage(
          recipientUserId, objectMapper.writeValueAsString(payload));
    } catch (Exception ignored) {
      // best-effort
    }
  }

  private String extractToken(SocketIOClient client) {
    String header = client.getHandshakeData().getHttpHeaders().get("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      return header.substring(7);
    }
    String query = client.getHandshakeData().getSingleUrlParam("token");
    if (query != null && !query.isBlank()) {
      return query.startsWith("Bearer ") ? query.substring(7) : query;
    }
    return null;
  }

  private void ackIfPresent(AckRequest ack, Object payload) {
    if (ack != null && ack.isAckRequested()) {
      ack.sendAckData(payload);
    }
  }
}
