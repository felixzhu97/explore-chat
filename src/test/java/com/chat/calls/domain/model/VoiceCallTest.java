package com.chat.calls.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class VoiceCallTest {

  @Test
  @DisplayName("should answer ringing call")
  void shouldAnswerRingingCall() {
    VoiceCall call = VoiceCall.invite("caller", "callee", "audio");
    call.answer();
    assertEquals(CallStatus.answered, call.getStatus());
  }

  @Test
  @DisplayName("should reject ringing call")
  void shouldRejectRingingCall() {
    VoiceCall call = VoiceCall.invite("caller", "callee", "audio");
    call.reject();
    assertEquals(CallStatus.rejected, call.getStatus());
  }

  @Test
  @DisplayName("should end call from any status")
  void shouldEndCallFromAnyStatus() {
    VoiceCall call = VoiceCall.invite("caller", "callee", "audio");
    call.end();
    assertEquals(CallStatus.ended, call.getStatus());
  }

  @Test
  @DisplayName("should reject answer when call is not ringing")
  void shouldRejectAnswerWhenCallIsNotRinging() {
    VoiceCall call = VoiceCall.invite("caller", "callee", "audio");
    call.end();
    assertThrows(IllegalStateException.class, call::answer);
  }
}
