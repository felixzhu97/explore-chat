package com.chat.ads.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Paid campaign under an ad account with a budget. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class AdCampaign extends AbstractEntity {

  private String accountId;
  private String name;
  private String status;
  private long budget;

  private AdCampaign(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String accountId,
      String name,
      long budget) {
    super(id, createdAt, updatedAt);
    this.accountId = accountId;
    this.name = name;
    this.budget = budget;
    this.status = "draft";
  }

  /**
   * Creates a draft campaign with the given budget.
   *
   * @param accountId owning ad account id
   * @param name campaign name
   * @param budget campaign budget
   * @return a new {@code AdCampaign}
   */
  public static AdCampaign create(String accountId, String name, long budget) {
    Instant now = Instant.now();
    return new AdCampaign(UUID.randomUUID().toString(), now, now, accountId, name, budget);
  }

  /** Marks the campaign as active. */
  public void activate() {
    this.status = "active";
    touch();
  }

  /** Marks the campaign as draft. */
  public void draft() {
    this.status = "draft";
    touch();
  }
}
