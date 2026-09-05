package com.chat.websocket.infra;

import com.corundumstudio.socketio.SocketIOServer;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnBean(SocketIOServer.class)
public class NotificationRealtimeGateway {

  private final SocketIOServer server;

  public NotificationRealtimeGateway(SocketIOServer server) {
    this.server = server;
  }

  public void publishNew(String userId, Map<String, Object> notification) {
    server.getRoomOperations("user:" + userId).sendEvent("notification:new", notification);
  }
}
