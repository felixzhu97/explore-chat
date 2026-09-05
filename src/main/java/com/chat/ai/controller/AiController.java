package com.chat.ai.controller;

import com.chat.ai.service.AiProxyService;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AiController {

  private final AiProxyService aiProxyService;

  public AiController(AiProxyService aiProxyService) {
    this.aiProxyService = aiProxyService;
  }

  @PostMapping("recommendations:rank")
  public Map<?, ?> rank(@RequestBody Map<String, Object> body) {
    return aiProxyService.rankFeed(body);
  }

  @PostMapping("vision:predict")
  public Map<?, ?> vision(@RequestBody Map<String, Object> body) {
    return aiProxyService.predictImage(body);
  }

  @PostMapping("images:generate")
  public Map<?, ?> image(@RequestBody Map<String, Object> body) {
    return aiProxyService.generateImage(body);
  }

  @PostMapping("ai/chat")
  public Map<?, ?> chat(@RequestBody Map<String, Object> body) {
    return aiProxyService.chatOllama(body);
  }
}
