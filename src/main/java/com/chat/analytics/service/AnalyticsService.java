package com.chat.analytics.service;

import com.chat.analytics.domain.model.AnalyticsEvent;
import com.chat.analytics.domain.repository.AnalyticsEventRepository;
import com.chat.common.messaging.ChatEventPublisher;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {

  private final AnalyticsEventRepository eventRepository;
  private final ChatEventPublisher chatEventPublisher;
  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

  public AnalyticsService(
      AnalyticsEventRepository eventRepository, ChatEventPublisher chatEventPublisher) {
    this.eventRepository = eventRepository;
    this.chatEventPublisher = chatEventPublisher;
  }

  @Transactional
  public Map<String, Object> record(String userId, String name, Object payload) {
    String payloadJson = stringify(payload);
    AnalyticsEvent event = eventRepository.save(AnalyticsEvent.record(userId, name, payloadJson));
    Map<String, Object> body = new HashMap<>();
    body.put("id", event.getId());
    body.put("userId", userId);
    body.put("name", name);
    body.put("payload", payload);
    chatEventPublisher.sendAnalyticsEvent(body);
    return body;
  }

  @Transactional
  public void ingestFromKafka(Map<String, Object> body) {
    String userId = body.get("userId") == null ? null : String.valueOf(body.get("userId"));
    String name =
        body.get("name") == null
            ? String.valueOf(body.getOrDefault("eventName", "unknown"))
            : String.valueOf(body.get("name"));
    eventRepository.save(AnalyticsEvent.record(userId, name, stringify(body.get("payload"))));
  }

  @Transactional(readOnly = true)
  public long countEvents() {
    return eventRepository.countAll();
  }

  private String stringify(Object payload) {
    if (payload == null) {
      return null;
    }
    if (payload instanceof String s) {
      return s;
    }
    try {
      return objectMapper.writeValueAsString(payload);
    } catch (JsonProcessingException ex) {
      return String.valueOf(payload);
    }
  }
}
