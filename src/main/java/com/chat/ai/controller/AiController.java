package com.chat.ai.controller;

import com.chat.ai.service.AiProxyService;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

  @PostMapping("voices:synthesize")
  public Map<?, ?> voice(@RequestBody Map<String, Object> body) {
    return aiProxyService.synthesizeVoice(body);
  }

  @PostMapping("videos:generate")
  public Map<?, ?> video(@RequestBody Map<String, Object> body) {
    return aiProxyService.generateVideo(body);
  }

  @PostMapping("ai/chat")
  public Map<?, ?> chat(@RequestBody Map<String, Object> body) {
    return aiProxyService.chatOllama(body);
  }

  /** Lists Explore AI Gallery agents (BFF; browser must not call Explore AI directly). */
  @GetMapping("ai/explore/agents")
  public List<Map<String, Object>> listExploreAgents(
      @RequestParam(value = "lang", required = false) String lang, Authentication authentication) {
    return aiProxyService.listExploreAgents(clientId(authentication), lang);
  }

  /** Invokes one Explore AI Gallery agent via the Chat BFF. */
  @PostMapping("ai/explore/agents/{agentType}/invoke")
  public Map<String, Object> invokeExploreAgent(
      @PathVariable String agentType,
      @RequestBody Map<String, Object> body,
      @RequestParam(value = "lang", required = false) String lang,
      Authentication authentication) {
    Object message = body == null ? null : body.get("message");
    return aiProxyService.invokeExploreAgent(
        agentType, message == null ? "" : String.valueOf(message), clientId(authentication), lang);
  }

  private static String clientId(Authentication authentication) {
    return authentication == null ? null : authentication.getName();
  }
}
