package com.chat.common.messaging;

import java.util.Map;

/** Outbound domain events for Kafka (and no-op when brokers are disabled). */
public interface ChatEventPublisher {

  /**
   * Publishes an offline message payload for a recipient.
   *
   * @param recipientUserId recipient user id used as the Kafka key
   * @param payloadJson serialized message payload
   */
  void sendOfflineMessage(String recipientUserId, String payloadJson);

  /**
   * Publishes a post-created event.
   *
   * @param payload event fields including {@code userId}
   */
  void sendPostCreated(Map<String, Object> payload);

  /**
   * Publishes a post-deleted event.
   *
   * @param payload event fields including {@code userId}
   */
  void sendPostDeleted(Map<String, Object> payload);

  /**
   * Publishes a feed fan-out event.
   *
   * @param payload event fields including {@code userId}
   */
  void sendFeedFanout(Map<String, Object> payload);

  /**
   * Publishes a comment-created event.
   *
   * @param payload event fields including {@code postId}
   */
  void sendCommentCreated(Map<String, Object> payload);

  /**
   * Publishes an analytics event.
   *
   * @param payload event fields including {@code userId}
   */
  void sendAnalyticsEvent(Map<String, Object> payload);
}
