package com.chat.post.controller;

import com.chat.post.service.PostService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
@RequestMapping("/api/v1/posts")
public class PostsController {

  private final PostService postService;

  public PostsController(PostService postService) {
    this.postService = postService;
  }

  @GetMapping
  public Map<String, Object> list(
      Authentication authentication,
      @RequestParam(value = "page_size", required = false) Integer pageSize,
      @RequestParam(value = "page_token", required = false) String pageToken) {
    return postService.list(pageSize, pageToken, authentication.getName());
  }

  @GetMapping("feed")
  public Map<String, Object> feed(
      Authentication authentication,
      @RequestParam(value = "page_size", required = false) Integer pageSize,
      @RequestParam(value = "page_token", required = false) String pageToken) {
    return postService.feed(authentication.getName(), pageSize, pageToken);
  }

  @GetMapping("explore")
  public Map<String, Object> explore(
      Authentication authentication,
      @RequestParam(value = "page_size", required = false) Integer pageSize,
      @RequestParam(value = "page_token", required = false) String pageToken) {
    return postService.explore(authentication.getName(), pageSize, pageToken);
  }

  @GetMapping("reels")
  public Map<String, Object> reels(
      Authentication authentication,
      @RequestParam(value = "page_size", required = false) Integer pageSize,
      @RequestParam(value = "page_token", required = false) String pageToken) {
    return postService.reels(authentication.getName(), pageSize, pageToken);
  }

  @GetMapping("user/{user}")
  public Map<String, Object> byUser(
      Authentication authentication,
      @PathVariable("user") String userId,
      @RequestParam(value = "page_size", required = false) Integer pageSize,
      @RequestParam(value = "page_token", required = false) String pageToken) {
    return postService.byUser(userId, pageSize, pageToken, authentication.getName());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> create(
      Authentication authentication, @RequestBody Map<String, Object> body) {
    String mediaUrls = stringifyMedia(body.get("mediaUrls"));
    String coverUrl = body.get("coverUrl") == null ? null : String.valueOf(body.get("coverUrl"));
    String type = body.get("type") == null ? "TEXT" : String.valueOf(body.get("type"));
    String caption = body.get("caption") == null ? "" : String.valueOf(body.get("caption"));
    return postService.create(authentication.getName(), caption, mediaUrls, type, coverUrl);
  }

  @GetMapping("{post}")
  public Map<String, Object> get(Authentication authentication, @PathVariable String post) {
    return postService.get(post, authentication.getName());
  }

  @DeleteMapping("{post}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(Authentication authentication, @PathVariable String post) {
    postService.delete(post, authentication.getName());
  }

  @PostMapping("{post}:like")
  public Map<String, Object> like(Authentication authentication, @PathVariable String post) {
    return postService.like(post, authentication.getName());
  }

  @PostMapping("{post}:unlike")
  public Map<String, Object> unlike(Authentication authentication, @PathVariable String post) {
    return postService.unlike(post, authentication.getName());
  }

  @PostMapping("{post}:save")
  public Map<String, Object> save(Authentication authentication, @PathVariable String post) {
    return postService.save(post, authentication.getName());
  }

  @PostMapping("{post}:unsave")
  public Map<String, Object> unsave(Authentication authentication, @PathVariable String post) {
    return postService.unsave(post, authentication.getName());
  }

  @SuppressWarnings("unchecked")
  private String stringifyMedia(Object mediaUrls) {
    if (mediaUrls == null) {
      return "[]";
    }
    if (mediaUrls instanceof String s) {
      return s;
    }
    if (mediaUrls instanceof List<?> list) {
      return list.stream()
          .map(String::valueOf)
          .map(s -> "\"" + s.replace("\"", "") + "\"")
          .collect(Collectors.joining(",", "[", "]"));
    }
    return "[]";
  }
}
