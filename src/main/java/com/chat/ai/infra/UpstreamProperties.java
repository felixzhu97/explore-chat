package com.chat.ai.infra;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "chat.upstreams")
public class UpstreamProperties {

  private String imagePlayground = "http://localhost:8003";
  private String speech = "http://localhost:8004";
  private String video = "http://localhost:8005";
  private String vision = "http://localhost:8001";
  private String recommendation = "http://localhost:8000";
  private String ollama = "http://localhost:11434";
  private String exploreAi = "";

  public String getImagePlayground() {
    return imagePlayground;
  }

  public void setImagePlayground(String imagePlayground) {
    this.imagePlayground = imagePlayground;
  }

  public String getSpeech() {
    return speech;
  }

  public void setSpeech(String speech) {
    this.speech = speech;
  }

  public String getVideo() {
    return video;
  }

  public void setVideo(String video) {
    this.video = video;
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
