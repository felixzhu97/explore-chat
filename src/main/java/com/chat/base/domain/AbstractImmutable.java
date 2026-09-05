package com.chat.base.domain;

import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.time.Instant;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Immutable aggregate root base with identity and creation timestamp. */
@MappedSuperclass
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public abstract class AbstractImmutable {

  @Id
  private String id;

  private Instant createdAt;

  /**
   * Creates an immutable entity with identity and creation time.
   *
   * @param id entity identity
   * @param createdAt creation timestamp
   */
  protected AbstractImmutable(String id, Instant createdAt) {
    this.id = Objects.requireNonNull(id, "id");
    this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
  }
}
