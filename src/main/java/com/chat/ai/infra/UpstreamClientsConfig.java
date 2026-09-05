package com.chat.ai.infra;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@EnableConfigurationProperties(UpstreamProperties.class)
public class UpstreamClientsConfig {

  @Bean
  WebClient.Builder webClientBuilder() {
    return WebClient.builder();
  }
}
