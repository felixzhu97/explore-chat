package com.chat.calls.domain.repository;

import com.chat.calls.domain.model.VoiceCall;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.calls.domain.model.VoiceCall} aggregates. */
public interface VoiceCallRepository {

  VoiceCall save(VoiceCall call);

  Optional<VoiceCall> findById(String id);

  List<VoiceCall> findByParticipant(String userId);
}
