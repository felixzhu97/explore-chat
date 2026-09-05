package com.chat.ads.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Advertiser account that owns campaigns. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class AdAccount extends AbstractEntity {

  private String ownerId;
  private String name;
  private String status;

  private AdAccount(
      String id, Instant createdAt, Instant updatedAt, String ownerId, String name) {
    super(id, createdAt, updatedAt);
    this.ownerId = ownerId;
    this.name = name;
    this.status = "active";
  }

  /**
   * Creates an active ad account for the owner.
   *
   * @param ownerId account owner user id
   * @param name account display name
   * @return a new {@code AdAccount}
   */
  public static AdAccount create(String ownerId, String name) {
    Instant now = Instant.now();
    return new AdAccount(UUID.randomUUID().toString(), now, now, ownerId, name);
  }

  /** Marks the account as active. */
  public void activate() {
    this.status = "active";
    touch();
  }

  /** Marks the account as draft. */
  public void draft() {
    this.status = "draft";
    touch();
  }
}
