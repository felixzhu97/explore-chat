package com.chat.ads.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Creative asset attached to an ad campaign. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class AdCreative extends AbstractEntity {

  private String campaignId;
  private String headline;
  private String body;
  private String mediaUrl;
  private String status;

  private AdCreative(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String campaignId,
      String headline,
      String body,
      String mediaUrl) {
    super(id, createdAt, updatedAt);
    this.campaignId = campaignId;
    this.headline = headline;
    this.body = body;
    this.mediaUrl = mediaUrl;
    this.status = "draft";
  }

  /**
   * Creates a draft creative for a campaign.
   *
   * @param campaignId owning campaign id
   * @param headline creative headline
   * @param body creative body copy
   * @param mediaUrl media asset URL
   * @return a new {@code AdCreative}
   */
  public static AdCreative create(
      String campaignId, String headline, String body, String mediaUrl) {
    Instant now = Instant.now();
    return new AdCreative(
        UUID.randomUUID().toString(), now, now, campaignId, headline, body, mediaUrl);
  }

  /** Marks the creative as active. */
  public void activate() {
    this.status = "active";
    touch();
  }

  /** Marks the creative as draft. */
  public void draft() {
    this.status = "draft";
    touch();
  }
}
