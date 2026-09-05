package com.chat.status.controller;

import com.chat.status.service.StatusService;
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
@RequestMapping("/api/v1/status")
public class StatusController {

  private final StatusService statusService;

  public StatusController(StatusService statusService) {
    this.statusService = statusService;
  }

  @GetMapping
  public Map<String, Object> list() {
    return statusService.list();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> create(
      Authentication authentication, @RequestBody Map<String, Object> body) {
    return statusService.create(
        authentication.getName(),
        body.get("content") == null ? null : String.valueOf(body.get("content")),
        body.get("mediaUrl") == null ? null : String.valueOf(body.get("mediaUrl")),
        body.get("statusType") == null ? "TEXT" : String.valueOf(body.get("statusType")));
  }

  @GetMapping("{status}")
  public Map<String, Object> get(@PathVariable String status) {
    return statusService.get(status);
  }

  @DeleteMapping("{status}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(Authentication authentication, @PathVariable String status) {
    statusService.delete(status, authentication.getName());
  }

  @PostMapping("{status}:view")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void view(Authentication authentication, @PathVariable String status) {
    statusService.view(status, authentication.getName());
  }
}
