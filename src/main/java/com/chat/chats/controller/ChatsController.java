package com.chat.chats.controller;

import com.chat.chats.service.ChatsService;
import java.util.List;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chats")
public class ChatsController {

  private final ChatsService chatsService;

  public ChatsController(ChatsService chatsService) {
    this.chatsService = chatsService;
  }

  @GetMapping
  public Map<String, Object> list(Authentication authentication) {
    return chatsService.listForUser(authentication.getName());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> create(
      Authentication authentication, @RequestBody Map<String, Object> body) {
    Object type = body.get("type");
    boolean isGroup =
        "GROUP".equals(String.valueOf(type))
            || (body.get("name") != null && body.get("peerUserId") == null);
    if (isGroup) {
      @SuppressWarnings("unchecked")
      List<String> members =
          body.get("memberIds") instanceof List<?> list
              ? list.stream().map(String::valueOf).toList()
              : List.of();
      String name = String.valueOf(body.getOrDefault("name", "Group"));
      return chatsService.createGroupChat(authentication.getName(), name, members);
    }
    return chatsService.createPrivate(
        authentication.getName(), String.valueOf(body.get("peerUserId")));
  }

  @GetMapping("{chat}")
  public Map<String, Object> get(Authentication authentication, @PathVariable String chat) {
    return chatsService.get(chat, authentication.getName());
  }

  @PatchMapping("{chat}")
  public Map<String, Object> patch(
      Authentication authentication,
      @PathVariable String chat,
      @RequestBody Map<String, String> body) {
    return chatsService.patch(chat, authentication.getName(), body.get("name"));
  }

  @PostMapping("{chat}:archive")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void archive(Authentication authentication, @PathVariable String chat) {
    chatsService.archive(chat, authentication.getName());
  }

  @PostMapping("{chat}:mute")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void mute(
      Authentication authentication,
      @PathVariable String chat,
      @RequestBody(required = false) Map<String, Object> body) {
    boolean muted =
        body == null
            || body.get("muted") == null
            || Boolean.parseBoolean(String.valueOf(body.get("muted")));
    chatsService.mute(chat, authentication.getName(), muted);
  }

  @DeleteMapping("{chat}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(Authentication authentication, @PathVariable String chat) {
    chatsService.delete(chat, authentication.getName());
  }
}
