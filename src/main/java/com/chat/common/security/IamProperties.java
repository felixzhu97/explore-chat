package com.chat.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Explore IAM issuer settings for accepting IAM Bearer access tokens. */
@ConfigurationProperties(prefix = "chat.iam")
public class IamProperties {

  /** When true and issuer-uri is set, IAM JWTs are accepted alongside Chat HS tokens. */
  private boolean enabled = true;

  private String issuerUri = "http://localhost:9100";

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getIssuerUri() {
    return issuerUri;
  }

  public void setIssuerUri(String issuerUri) {
    this.issuerUri = issuerUri;
  }

  public boolean isReady() {
    return enabled && issuerUri != null && !issuerUri.isBlank();
  }
}
