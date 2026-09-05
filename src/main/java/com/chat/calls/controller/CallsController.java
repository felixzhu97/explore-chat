package com.chat.calls.controller;

import com.chat.calls.service.CallsService;
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
@RequestMapping("/api/v1/calls")
public class CallsController {

  private final CallsService callsService;

  public CallsController(CallsService callsService) {
    this.callsService = callsService;
  }

  @GetMapping
  public Map<String, Object> list(Authentication authentication) {
    return callsService.list(authentication.getName());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> invite(
      Authentication authentication, @RequestBody Map<String, String> body) {
    return callsService.invite(
        authentication.getName(),
        body.getOrDefault("peerUserId", ""),
        body.getOrDefault("type", "audio"));
  }

  @GetMapping("{call}")
  public Map<String, Object> get(@PathVariable String call) {
    return callsService.get(call);
  }

  @PostMapping("{call}:answer")
  public Map<String, Object> answer(@PathVariable String call) {
    return callsService.answer(call);
  }

  @PostMapping("{call}:reject")
  public Map<String, Object> reject(@PathVariable String call) {
    return callsService.reject(call);
  }

  @PostMapping("{call}:end")
  public Map<String, Object> end(@PathVariable String call) {
    return callsService.end(call);
  }
}
