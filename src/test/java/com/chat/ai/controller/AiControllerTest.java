package com.chat.ai.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chat.ai.service.AiProxyService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

class AiControllerTest {

  @Test
  @DisplayName("should list explore agents through bff")
  void shouldListExploreAgentsThroughBff() {
    AiProxyService proxy = mock(AiProxyService.class);
    when(proxy.listExploreAgents(any(), eq("zh")))
        .thenReturn(List.of(Map.of("type", "support", "name", "Support Agent")));
    AiController controller = new AiController(proxy);

    List<Map<String, Object>> result =
        controller.listExploreAgents(
            "zh", new UsernamePasswordAuthenticationToken("user-1", "n/a"));

    assertThat(result).hasSize(1);
    assertThat(result.get(0).get("type")).isEqualTo("support");
    verify(proxy).listExploreAgents(eq("user-1"), eq("zh"));
  }

  @Test
  @DisplayName("should invoke explore agent through bff")
  void shouldInvokeExploreAgentThroughBff() {
    AiProxyService proxy = mock(AiProxyService.class);
    when(proxy.invokeExploreAgent(eq("support"), eq("hello"), eq("user-1"), isNull()))
        .thenReturn(Map.of("type", "support", "message", "hello", "reply", "hi"));
    AiController controller = new AiController(proxy);

    Map<String, Object> result =
        controller.invokeExploreAgent(
            "support",
            Map.of("message", "hello"),
            null,
            new UsernamePasswordAuthenticationToken("user-1", "n/a"));

    assertThat(result.get("reply")).isEqualTo("hi");
  }
}
