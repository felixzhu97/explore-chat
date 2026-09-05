package com.chat.common.messaging;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** No-op publisher used when Kafka brokers are empty or connection failed. */
public class NoOpChatEventPublisher implements ChatEventPublisher {

  private static final Logger log = LoggerFactory.getLogger(NoOpChatEventPublisher.class);

  /** Creates a no-op publisher and logs that Kafka is disabled. */
  public NoOpChatEventPublisher() {
    log.info("Kafka disabled (no brokers); event publisher will no-op");
  }

  @Override
  public void sendOfflineMessage(String recipientUserId, String payloadJson) {}

  @Override
  public void sendPostCreated(Map<String, Object> payload) {}

  @Override
  public void sendPostDeleted(Map<String, Object> payload) {}

  @Override
  public void sendFeedFanout(Map<String, Object> payload) {}

  @Override
  public void sendCommentCreated(Map<String, Object> payload) {}

  @Override
  public void sendAnalyticsEvent(Map<String, Object> payload) {}
}
