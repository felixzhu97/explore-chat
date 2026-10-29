package com.chat.ai.infra;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties(prefix = "chat.upstreams")
public class UpstreamProperties {

  private String exploreMl = "http://localhost:8000";
  private String ollama = "http://localhost:11434";
  private String exploreAi = "http://127.0.0.1:9000";
  private String exploreAiServiceKey = "";

  public String getExploreMl() {
    return exploreMl;
  }

  public void setExploreMl(String exploreMl) {
    this.exploreMl = exploreMl;
  }

  public String getOllama() {
    return ollama;
  }

  public void setOllama(String ollama) {
    this.ollama = ollama;
  }

  public String getExploreAi() {
    return exploreAi;
  }

  public void setExploreAi(String exploreAi) {
    this.exploreAi = exploreAi;
  }

  public String getExploreAiServiceKey() {
    return exploreAiServiceKey;
  }

  public void setExploreAiServiceKey(String exploreAiServiceKey) {
    this.exploreAiServiceKey = exploreAiServiceKey;
  }

  /** True when Explore AI base URL and service key are both set. */
  public boolean isExploreAiConfigured() {
    return StringUtils.hasText(exploreAi) && StringUtils.hasText(exploreAiServiceKey);
  }
}
