package com.chat.ai.service;

import com.chat.ai.infra.UpstreamProperties;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AiProxyService {

  private final WebClient.Builder webClientBuilder;
  private final UpstreamProperties upstreams;

  public AiProxyService(WebClient.Builder webClientBuilder, UpstreamProperties upstreams) {
    this.webClientBuilder = webClientBuilder;
    this.upstreams = upstreams;
  }

  public Map<?, ?> rankFeed(Map<String, Object> body) {
    return postJson(upstreams.getRecommendation() + "/api/v1/feeds:rank", body);
  }

  public Map<?, ?> predictImage(Map<String, Object> body) {
    return postJson(upstreams.getVision() + "/api/v1/images:predict", body);
  }

  public Map<?, ?> generateImage(Map<String, Object> body) {
    return postJson(upstreams.getMediaGen() + "/api/v1/images:generate", body);
  }

  public Map<?, ?> chatOllama(Map<String, Object> body) {
    return postJson(upstreams.getOllama() + "/api/chat", body);
  }

  private Map<?, ?> postJson(String url, Map<String, Object> body) {
    try {
      Map<?, ?> response =
          webClientBuilder
              .build()
              .post()
              .uri(url)
              .bodyValue(body)
              .retrieve()
              .bodyToMono(Map.class)
              .block();
      return response == null ? Map.of() : response;
    } catch (RuntimeException ex) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "Upstream unavailable: " + ex.getMessage());
    }
  }
}
