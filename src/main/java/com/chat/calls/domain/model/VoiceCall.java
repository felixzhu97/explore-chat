package com.chat.calls.domain.model;

import com.chat.base.domain.AbstractEntity;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Voice or video call session between two users. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class VoiceCall extends AbstractEntity {

  private String callerId;
  private String calleeId;
  private String callType;
  private String status;

  private VoiceCall(
      String id,
      Instant createdAt,
      Instant updatedAt,
      String callerId,
      String calleeId,
      String callType) {
    super(id, createdAt, updatedAt);
    this.callerId = callerId;
    this.calleeId = calleeId;
    this.callType = callType == null ? "audio" : callType;
    this.status = "ringing";
  }

  /**
   * Creates an outbound call invitation in {@code ringing} status.
   *
   * @param callerId caller user id
   * @param calleeId callee user id
   * @param callType call media type such as {@code audio}
   * @return a new {@code VoiceCall}
   */
  public static VoiceCall invite(String callerId, String calleeId, String callType) {
    Instant now = Instant.now();
    return new VoiceCall(UUID.randomUUID().toString(), now, now, callerId, calleeId, callType);
  }

  /**
   * Answers a ringing call.
   *
   * @throws IllegalStateException when the call is not ringing
   */
  public void answer() {
    if (!"ringing".equals(status)) {
      throw new IllegalStateException("Call is not ringing");
    }
    this.status = "answered";
    touch();
  }

  /**
   * Rejects a ringing call.
   *
   * @throws IllegalStateException when the call is not ringing
   */
  public void reject() {
    if (!"ringing".equals(status)) {
      throw new IllegalStateException("Call is not ringing");
    }
    this.status = "rejected";
    touch();
  }

  /** Ends the call regardless of prior status. */
  public void end() {
    this.status = "ended";
    touch();
  }
}
