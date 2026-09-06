package com.chat.websocket.infra;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.DependsOn;

@org.springframework.context.annotation.Configuration
@EnableConfigurationProperties(SocketIoProperties.class)
@ConditionalOnProperty(
    prefix = "chat.socketio",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true)
public class SocketIoConfig {

  @Bean(destroyMethod = "stop")
  SocketIOServer socketIoServer(SocketIoProperties props) {
    Configuration config = new Configuration();
    config.setHostname(props.getHost());
    config.setPort(props.getPort());
    config.setContext(props.getContext());
    config.setOrigin("*");
    SocketIOServer server = new SocketIOServer(config);
    server.start();
    return server;
  }
}
