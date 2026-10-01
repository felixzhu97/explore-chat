package com.chat.ai.infra;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "chat.upstreams")
public class UpstreamProperties {

  private String exploreMl = "http://localhost:8000";
  private String ollama = "http://localhost:11434";
  private String exploreAi = "";

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
}
