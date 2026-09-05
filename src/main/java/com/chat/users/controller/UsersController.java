package com.chat.users.controller;

import com.chat.users.service.UsersService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UsersController {

  private final UsersService usersService;

  public UsersController(UsersService usersService) {
    this.usersService = usersService;
  }

  @GetMapping("me")
  public Map<String, UserResponse> me(Authentication authentication) {
    return Map.of("user", usersService.getById(authentication.getName()));
  }

  @GetMapping("suggestions")
  public Map<String, Object> suggestions(
      Authentication authentication,
      @RequestParam(value = "page_size", required = false) Integer pageSize) {
    int size = pageSize == null ? 10 : Math.min(pageSize, 100);
    return usersService.suggestions(authentication.getName(), size);
  }

  @PostMapping("following:check")
  public Map<String, Object> followingCheck(
      Authentication authentication, @RequestBody Map<String, List<String>> body) {
    List<String> userIds = body.getOrDefault("userIds", List.of());
    return usersService.checkFollowing(authentication.getName(), userIds);
  }

  @GetMapping
  public Map<String, List<UserResponse>> search(
      @RequestParam(value = "q", required = false) String query,
      @RequestParam(value = "page_size", required = false) Integer pageSize) {
    int size = pageSize == null ? 20 : Math.min(pageSize, 100);
    List<UserResponse> users =
        query == null || query.isBlank() ? List.of() : usersService.search(query, size);
    return Map.of("users", users);
  }

  @GetMapping("{user}")
  public UserResponse get(@PathVariable("user") String userId) {
    return usersService.getById(userId);
  }

  @PostMapping("{user}:block")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void block(Authentication authentication, @PathVariable("user") String userId) {
    usersService.block(authentication.getName(), userId);
  }

  @PostMapping("{user}:unblock")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void unblock(Authentication authentication, @PathVariable("user") String userId) {
    usersService.unblock(authentication.getName(), userId);
  }

  @DeleteMapping("me")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteMe(Authentication authentication) {
    usersService.delete(authentication.getName());
  }
}
