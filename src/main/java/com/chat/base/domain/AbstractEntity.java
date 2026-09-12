package com.chat.base.domain;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

/** Mutable aggregate root base with optimistic locking and last-modified timestamp. */
@MappedSuperclass
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public abstract class AbstractEntity extends AbstractImmutable {

  @UpdateTimestamp
  private Instant updatedAt;

  @Version
  private long version;

  /**
   * Creates a mutable entity with identity, creation time, and last-modified time.
   *
   * @param id entity identity
   * @param createdAt creation timestamp
   * @param updatedAt last-modified timestamp
   */
  protected AbstractEntity(String id, Instant createdAt, Instant updatedAt) {
    super(id, createdAt);
    this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt");
  }

  /**
   * Updates {@code updatedAt} to the current instant. Hibernate {@link UpdateTimestamp} also
   * refreshes this field on flush.
   */
  protected void touch() {
    this.updatedAt = Instant.now();
  }
}
