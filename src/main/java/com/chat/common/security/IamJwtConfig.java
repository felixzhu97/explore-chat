package com.chat.common.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.SupplierJwtDecoder;
import org.springframework.util.StringUtils;

/**
 * Lazy IAM JWT decoder so boot and tests do not require a live issuer.
 *
 * @see <a
 *     href="https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html">JWT
 *     Resource Server</a>
 */
@Configuration
@EnableConfigurationProperties(IamProperties.class)
public class IamJwtConfig {

  @Bean
  @ConditionalOnProperty(prefix = "chat.iam", name = "enabled", havingValue = "true", matchIfMissing = true)
  JwtDecoder iamJwtDecoder(IamProperties properties) {
    if (!StringUtils.hasText(properties.getIssuerUri())) {
      throw new IllegalStateException("chat.iam.issuer-uri is required when chat.iam.enabled=true");
    }
    String issuer = properties.getIssuerUri().trim();
    return new SupplierJwtDecoder(() -> JwtDecoders.fromIssuerLocation(issuer));
  }
}
