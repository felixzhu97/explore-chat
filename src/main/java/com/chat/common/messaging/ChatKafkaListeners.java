package com.chat.common.messaging;

import com.chat.analytics.service.AnalyticsService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/** Kafka listeners that consume feed fan-out and analytics event topics. */
@Component
public class ChatKafkaListeners {

  private static final Logger log = LoggerFactory.getLogger(ChatKafkaListeners.class);

  private final AnalyticsService analyticsService;
  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

  /**
   * Creates listeners backed by the analytics ingestion service.
   *
   * @param analyticsService service that persists analytics events
   */
  public ChatKafkaListeners(AnalyticsService analyticsService) {
    this.analyticsService = analyticsService;
  }

  /**
   * Logs feed fan-out events without further processing.
   *
   * @param payload raw Kafka message body
   */
  @KafkaListener(
      topics = "${chat.kafka.topic-feed-fanout:feed.fanout}",
      groupId = "${chat.kafka.consumer-group:explore-chat}",
      autoStartup = "false")
  public void onFeedFanout(String payload) {
    log.debug("Received feed.fanout event: {}", payload);
  }

  /**
   * Deserializes and ingests analytics events from Kafka.
   *
   * @param payload JSON analytics payload
   */
  @KafkaListener(
      topics = "${chat.kafka.topic-analytics-events:analytics.events}",
      groupId = "${chat.kafka.consumer-group:explore-chat}",
      autoStartup = "false")
  public void onAnalyticsEvent(String payload) {
    try {
      Map<String, Object> body =
          objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
      analyticsService.ingestFromKafka(body);
    } catch (Exception ex) {
      log.warn("Failed to ingest analytics event: {}", ex.getMessage());
    }
  }
}
