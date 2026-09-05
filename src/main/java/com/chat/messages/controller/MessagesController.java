package com.chat.messages.controller;

import com.chat.messages.service.MessagesService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chats/{chat}/messages")
public class MessagesController {

  private final MessagesService messagesService;

  public MessagesController(MessagesService messagesService) {
    this.messagesService = messagesService;
  }

  @GetMapping
  public Map<String, Object> list(
      Authentication authentication,
      @PathVariable String chat,
      @RequestParam(value = "page_size", required = false) Integer pageSize,
      @RequestParam(value = "page_token", required = false) String pageToken) {
    return messagesService.list(chat, authentication.getName(), pageSize, pageToken);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> create(
      Authentication authentication,
      @PathVariable String chat,
      @RequestBody Map<String, String> body) {
    return messagesService.send(chat, authentication.getName(), body.getOrDefault("content", ""));
  }

  @PatchMapping("{message}")
  public Map<String, Object> edit(
      Authentication authentication,
      @PathVariable String chat,
      @PathVariable String message,
      @RequestBody Map<String, String> body) {
    return messagesService.edit(
        message, authentication.getName(), body.getOrDefault("content", ""));
  }

  @PostMapping("{message}:react")
  public Map<String, Object> react(
      Authentication authentication,
      @PathVariable String chat,
      @PathVariable String message,
      @RequestBody Map<String, String> body) {
    return messagesService.react(
        message, authentication.getName(), body.getOrDefault("emoji", "👍"));
  }

  @PostMapping("{message}:read")
  public Map<String, Object> markRead(
      Authentication authentication, @PathVariable String chat, @PathVariable String message) {
    return messagesService.markRead(message, authentication.getName());
  }

  @DeleteMapping("{message}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(
      Authentication authentication, @PathVariable String chat, @PathVariable String message) {
    messagesService.delete(message, authentication.getName());
  }
}
