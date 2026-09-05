package com.chat.follow.controller;

import com.chat.follow.service.FollowService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class FollowController {

  private final FollowService followService;

  public FollowController(FollowService followService) {
    this.followService = followService;
  }

  @PostMapping("{user}:follow")
  public Map<String, Object> follow(Authentication authentication, @PathVariable String user) {
    return followService.follow(authentication.getName(), user);
  }

  @PostMapping("{user}:unfollow")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void unfollow(Authentication authentication, @PathVariable String user) {
    followService.unfollow(authentication.getName(), user);
  }

  @GetMapping("{user}/followers")
  public Map<String, List<String>> followers(@PathVariable String user) {
    return followService.followers(user);
  }

  @GetMapping("{user}/following")
  public Map<String, List<String>> following(@PathVariable String user) {
    return followService.following(user);
  }
}
