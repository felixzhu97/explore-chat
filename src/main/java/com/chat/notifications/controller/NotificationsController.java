package com.chat.notifications.controller;

import com.chat.notifications.service.NotificationsService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationsController {

  private final NotificationsService notificationsService;

  public NotificationsController(NotificationsService notificationsService) {
    this.notificationsService = notificationsService;
  }

  @GetMapping
  public Map<String, Object> list(Authentication authentication) {
    return notificationsService.list(authentication.getName());
  }

  @PostMapping("{notification}:read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void read(Authentication authentication, @PathVariable String notification) {
    notificationsService.markRead(notification, authentication.getName());
  }

  @PostMapping("read:all")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void readAll(Authentication authentication) {
    notificationsService.markAllRead(authentication.getName());
  }

  @PostMapping("read:batch")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void readBatch(
      Authentication authentication, @RequestBody Map<String, List<String>> body) {
    notificationsService.markBatchRead(
        authentication.getName(), body.getOrDefault("ids", List.of()));
  }
}
