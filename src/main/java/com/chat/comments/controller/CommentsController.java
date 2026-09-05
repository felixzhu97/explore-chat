package com.chat.comments.controller;

import com.chat.comments.service.CommentsService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/posts/{post}/comments")
public class CommentsController {

  private final CommentsService commentsService;

  public CommentsController(CommentsService commentsService) {
    this.commentsService = commentsService;
  }

  @GetMapping
  public Map<String, Object> list(@PathVariable String post) {
    return commentsService.list(post);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> create(
      Authentication authentication,
      @PathVariable String post,
      @RequestBody Map<String, String> body) {
    return commentsService.create(
        post, authentication.getName(), body.getOrDefault("content", ""));
  }

  @DeleteMapping("{comment}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(
      Authentication authentication, @PathVariable String post, @PathVariable String comment) {
    commentsService.delete(post, comment, authentication.getName());
  }
}
