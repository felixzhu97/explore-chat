package com.chat.analytics.controller;

import com.chat.analytics.service.AnalyticsService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

  private final AnalyticsService analyticsService;

  public AnalyticsController(AnalyticsService analyticsService) {
    this.analyticsService = analyticsService;
  }

  @PostMapping("events")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void events(
      Authentication authentication, @RequestBody(required = false) Map<String, Object> body) {
    if (body == null) {
      return;
    }
    String name = String.valueOf(body.getOrDefault("name", body.getOrDefault("event", "event")));
    analyticsService.record(authentication.getName(), name, body.get("payload"));
  }
}
