package com.chat.common.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;

/** Kafka-backed {@link ChatEventPublisher} that serializes payloads as JSON strings. */
public class KafkaChatEventPublisher implements ChatEventPublisher {

  private static final Logger log = LoggerFactory.getLogger(KafkaChatEventPublisher.class);

  private final KafkaTemplate<String, String> kafkaTemplate;
  private final ChatKafkaProperties properties;
  private final ObjectMapper objectMapper;
  private final AtomicBoolean connected = new AtomicBoolean(true);

  /**
   * Creates a publisher using the given Kafka template and topic configuration.
   *
   * @param kafkaTemplate Kafka producer template
   * @param properties topic and broker settings
   * @param objectMapper JSON serializer
   */
  public KafkaChatEventPublisher(
      KafkaTemplate<String, String> kafkaTemplate,
      ChatKafkaProperties properties,
      ObjectMapper objectMapper) {
    this.kafkaTemplate = kafkaTemplate;
    this.properties = properties;
    this.objectMapper = objectMapper;
  }

  @Override
  public void sendOfflineMessage(String recipientUserId, String payloadJson) {
    send(properties.getTopicOfflineMessages(), recipientUserId, payloadJson);
  }

  @Override
  public void sendPostCreated(Map<String, Object> payload) {
    sendJson(properties.getTopicPostCreated(), stringKey(payload, "userId"), payload);
  }

  @Override
  public void sendPostDeleted(Map<String, Object> payload) {
    sendJson(properties.getTopicPostDeleted(), stringKey(payload, "userId"), payload);
  }

  @Override
  public void sendFeedFanout(Map<String, Object> payload) {
    sendJson(properties.getTopicFeedFanout(), stringKey(payload, "userId"), payload);
  }

  @Override
  public void sendCommentCreated(Map<String, Object> payload) {
    sendJson(properties.getTopicCommentCreated(), stringKey(payload, "postId"), payload);
  }

  @Override
  public void sendAnalyticsEvent(Map<String, Object> payload) {
    sendJson(properties.getTopicAnalyticsEvents(), stringKey(payload, "userId"), payload);
  }

  private void sendJson(String topic, String key, Map<String, Object> payload) {
    try {
      send(topic, key, objectMapper.writeValueAsString(payload));
    } catch (JsonProcessingException ex) {
      log.warn("Failed to serialize Kafka payload for {}: {}", topic, ex.getMessage());
    }
  }

  private void send(String topic, String key, String value) {
    if (!connected.get()) {
      return;
    }
    try {
      kafkaTemplate.send(new ProducerRecord<>(topic, key, value));
    } catch (RuntimeException ex) {
      connected.set(false);
      log.warn("Kafka send failed for topic {}: {}", topic, ex.getMessage());
    }
  }

  private static String stringKey(Map<String, Object> payload, String field) {
    Object value = payload.get(field);
    return value == null ? null : String.valueOf(value);
  }
}
