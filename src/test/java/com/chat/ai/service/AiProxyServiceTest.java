package com.chat.ai.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.chat.ai.infra.UpstreamProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

class AiProxyServiceTest {

  @Test
  @DisplayName("should reject when explore ai service key missing")
  void shouldRejectWhenExploreAiServiceKeyMissing() {
    UpstreamProperties upstreams = new UpstreamProperties();
    upstreams.setExploreAi("http://127.0.0.1:9000");
    upstreams.setExploreAiServiceKey("");
    AiProxyService service = new AiProxyService(WebClient.builder(), upstreams);

    assertThatThrownBy(() -> service.listExploreAgents(null, null))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
        .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
  }

  @Test
  @DisplayName("should map non uuid client id to stable uuid")
  void shouldMapNonUuidClientIdToStableUuid() {
    UpstreamProperties upstreams = new UpstreamProperties();
    upstreams.setExploreAiServiceKey("dev-key");
    AiProxyService service = new AiProxyService(WebClient.builder(), upstreams);

    String first = service.resolveClientId("user-42");
    String second = service.resolveClientId("user-42");
    assertThat(first).isEqualTo(second);
    assertThat(first).matches("[0-9a-fA-F-]{36}");
  }

  @Test
  @DisplayName("should keep valid uuid client id")
  void shouldKeepValidUuidClientId() {
    UpstreamProperties upstreams = new UpstreamProperties();
    upstreams.setExploreAiServiceKey("dev-key");
    AiProxyService service = new AiProxyService(WebClient.builder(), upstreams);
    String uuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    assertThat(service.resolveClientId(uuid)).isEqualTo(uuid);
  }
}
