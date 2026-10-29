package com.chat.ai.service;

import com.chat.ai.infra.UpstreamProperties;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AiProxyService {

  private static final String SERVICE_KEY_HEADER = "X-Service-Key";
  private static final String CLIENT_ID_HEADER = "X-Client-Id";

  private final WebClient.Builder webClientBuilder;
  private final UpstreamProperties upstreams;

  public AiProxyService(WebClient.Builder webClientBuilder, UpstreamProperties upstreams) {
    this.webClientBuilder = webClientBuilder;
    this.upstreams = upstreams;
  }

  public Map<?, ?> rankFeed(Map<String, Object> body) {
    return postJson(upstreams.getExploreMl() + "/api/v1/feeds:rank", body);
  }

  public Map<?, ?> predictImage(Map<String, Object> body) {
    return postJson(upstreams.getExploreMl() + "/api/v1/images:predict", body);
  }

  public Map<?, ?> generateImage(Map<String, Object> body) {
    return postJson(upstreams.getExploreMl() + "/api/v1/images:generate", body);
  }

  public Map<?, ?> synthesizeVoice(Map<String, Object> body) {
    return postJson(upstreams.getExploreMl() + "/api/v1/voices:synthesize", body);
  }

  public Map<?, ?> generateVideo(Map<String, Object> body) {
    return postJson(upstreams.getExploreMl() + "/api/v1/videos:generate", body);
  }

  public Map<?, ?> chatOllama(Map<String, Object> body) {
    return postJson(upstreams.getOllama() + "/api/chat", body);
  }

  /** Lists Explore AI Gallery agents via service auth. */
  public List<Map<String, Object>> listExploreAgents(String clientId, String lang) {
    requireExploreAi();
    String uri = agentsBase() + queryLang(lang);
    try {
      List<Map<String, Object>> response =
          exploreAiClient(clientId)
              .get()
              .uri(uri)
              .retrieve()
              .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
              .block();
      return response == null ? List.of() : response;
    } catch (RuntimeException ex) {
      throw upstreamUnavailable(ex);
    }
  }

  /** Invokes one Explore AI Gallery agent via service auth. */
  public Map<String, Object> invokeExploreAgent(
      String agentType, String message, String clientId, String lang) {
    requireExploreAi();
    if (!StringUtils.hasText(agentType)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "agentType is required");
    }
    if (!StringUtils.hasText(message)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "message is required");
    }
    String uri = agentsBase() + "/" + agentType.trim() + "/invoke" + queryLang(lang);
    try {
      Map<String, Object> response =
          exploreAiClient(clientId)
              .post()
              .uri(uri)
              .bodyValue(Map.of("message", message.trim()))
              .retrieve()
              .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
              .block();
      return response == null ? Map.of() : response;
    } catch (RuntimeException ex) {
      throw upstreamUnavailable(ex);
    }
  }

  /** Resolves a stable UUID client id for Explore AI headers. */
  public String resolveClientId(String preferred) {
    if (StringUtils.hasText(preferred)) {
      try {
        return UUID.fromString(preferred.trim()).toString();
      } catch (IllegalArgumentException ignored) {
        return UUID.nameUUIDFromBytes(preferred.trim().getBytes()).toString();
      }
    }
    return UUID.randomUUID().toString();
  }

  private void requireExploreAi() {
    if (!upstreams.isExploreAiConfigured()) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "Explore AI BFF is not configured");
    }
  }

  private String agentsBase() {
    String base = upstreams.getExploreAi().replaceAll("/$", "");
    return base + "/api/agents";
  }

  private static String queryLang(String lang) {
    return StringUtils.hasText(lang) ? "?lang=" + lang.trim() : "";
  }

  private WebClient exploreAiClient(String clientId) {
    return webClientBuilder
        .build()
        .mutate()
        .defaultHeader(SERVICE_KEY_HEADER, upstreams.getExploreAiServiceKey())
        .defaultHeader(CLIENT_ID_HEADER, resolveClientId(clientId))
        .build();
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
      throw upstreamUnavailable(ex);
    }
  }

  private static ResponseStatusException upstreamUnavailable(RuntimeException ex) {
    return new ResponseStatusException(
        HttpStatus.BAD_GATEWAY, "Upstream unavailable: " + ex.getMessage());
  }
}
