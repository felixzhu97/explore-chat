package com.chat.calls.domain.model;

/** Lifecycle status of a voice or video call. */
public enum CallStatus {
  /** Outbound invitation not yet answered. */
  ringing,
  /** Call accepted and in progress or completed normally. */
  answered,
  /** Callee declined the invitation. */
  rejected,
  /** Call finished or hung up. */
  ended
}
