package com.chat.ai.infra;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "chat.upstreams")
public class UpstreamProperties {

  private String mediaGen = "http://localhost:3456";
  private String vision = "http://localhost:8001";
  private String recommendation = "http://localhost:8000";
  private String ollama = "http://localhost:11434";
  private String exploreAi = "";

  public String getMediaGen() {
    return mediaGen;
  }

  public void setMediaGen(String mediaGen) {
    this.mediaGen = mediaGen;
  }

  public String getVision() {
    return vision;
  }

  public void setVision(String vision) {
    this.vision = vision;
  }

  public String getRecommendation() {
    return recommendation;
  }

  public void setRecommendation(String recommendation) {
    this.recommendation = recommendation;
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
