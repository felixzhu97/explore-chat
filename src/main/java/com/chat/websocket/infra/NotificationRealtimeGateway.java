package com.chat.websocket.infra;

import com.corundumstudio.socketio.SocketIOServer;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "chat.socketio",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true)
public class NotificationRealtimeGateway {

  private final SocketIOServer server;

  public NotificationRealtimeGateway(SocketIOServer server) {
    this.server = server;
  }

  public void publishNew(String userId, Map<String, Object> notification) {
    server.getRoomOperations("user:" + userId).sendEvent("notification:new", notification);
  }
}
