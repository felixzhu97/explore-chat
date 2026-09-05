package com.chat.common.messaging;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configuration properties for Kafka broker and topic names under {@code chat.kafka}. */
@ConfigurationProperties(prefix = "chat.kafka")
public class ChatKafkaProperties {

  /**
   * Broker list. Empty list disables Kafka (Nest: {@code KAFKA_BROKERS=}). When the env var is
   * unset, defaults to {@code localhost:9092}.
   */
  private List<String> brokers = new ArrayList<>(List.of("localhost:9092"));

  private String topicOfflineMessages = "offline-messages";
  private String topicPostCreated = "post.created";
  private String topicPostDeleted = "post.deleted";
  private String topicFeedFanout = "feed.fanout";
  private String topicCommentCreated = "comment.created";
  private String topicAnalyticsEvents = "analytics.events";
  private String clientId = "explore-chat-server";
  private String consumerGroup = "explore-chat";

  /**
   * Returns whether Kafka publishing is enabled.
   *
   * @return {@code true} when at least one broker is configured
   */
  public boolean isEnabled() {
    return brokers != null && !brokers.isEmpty();
  }

  public List<String> getBrokers() {
    return brokers;
  }

  public void setBrokers(List<String> brokers) {
    this.brokers = brokers == null ? List.of() : brokers;
  }

  public String getTopicOfflineMessages() {
    return topicOfflineMessages;
  }

  public void setTopicOfflineMessages(String topicOfflineMessages) {
    this.topicOfflineMessages = topicOfflineMessages;
  }

  public String getTopicPostCreated() {
    return topicPostCreated;
  }

  public void setTopicPostCreated(String topicPostCreated) {
    this.topicPostCreated = topicPostCreated;
  }

  public String getTopicPostDeleted() {
    return topicPostDeleted;
  }

  public void setTopicPostDeleted(String topicPostDeleted) {
    this.topicPostDeleted = topicPostDeleted;
  }

  public String getTopicFeedFanout() {
    return topicFeedFanout;
  }

  public void setTopicFeedFanout(String topicFeedFanout) {
    this.topicFeedFanout = topicFeedFanout;
  }

  public String getTopicCommentCreated() {
    return topicCommentCreated;
  }

  public void setTopicCommentCreated(String topicCommentCreated) {
    this.topicCommentCreated = topicCommentCreated;
  }

  public String getTopicAnalyticsEvents() {
    return topicAnalyticsEvents;
  }

  public void setTopicAnalyticsEvents(String topicAnalyticsEvents) {
    this.topicAnalyticsEvents = topicAnalyticsEvents;
  }

  public String getClientId() {
    return clientId;
  }

  public void setClientId(String clientId) {
    this.clientId = clientId;
  }

  public String getConsumerGroup() {
    return consumerGroup;
  }

  public void setConsumerGroup(String consumerGroup) {
    this.consumerGroup = consumerGroup;
  }
}
