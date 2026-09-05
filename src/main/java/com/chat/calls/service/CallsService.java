package com.chat.calls.service;

import com.chat.calls.domain.model.VoiceCall;
import com.chat.calls.domain.repository.VoiceCallRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CallsService {

  private final VoiceCallRepository voiceCallRepository;

  public CallsService(VoiceCallRepository voiceCallRepository) {
    this.voiceCallRepository = voiceCallRepository;
  }

  @Transactional
  public Map<String, Object> invite(String callerId, String calleeId, String callType) {
    VoiceCall call = voiceCallRepository.save(VoiceCall.invite(callerId, calleeId, callType));
    return toResponse(call);
  }

  @Transactional
  public Map<String, Object> answer(String callId) {
    VoiceCall call = require(callId);
    try {
      call.answer();
    } catch (IllegalStateException ex) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
    }
    return toResponse(voiceCallRepository.save(call));
  }

  @Transactional
  public Map<String, Object> reject(String callId) {
    VoiceCall call = require(callId);
    try {
      call.reject();
    } catch (IllegalStateException ex) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
    }
    return toResponse(voiceCallRepository.save(call));
  }

  @Transactional
  public Map<String, Object> end(String callId) {
    VoiceCall call = require(callId);
    call.end();
    return toResponse(voiceCallRepository.save(call));
  }

  @Transactional(readOnly = true)
  public Map<String, Object> list(String userId) {
    List<Map<String, Object>> items =
        voiceCallRepository.findByParticipant(userId).stream().map(this::toResponse).toList();
    return Map.of("calls", items);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> get(String callId) {
    return toResponse(require(callId));
  }

  private VoiceCall require(String id) {
    return voiceCallRepository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Call not found"));
  }

  private Map<String, Object> toResponse(VoiceCall call) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", call.getId());
    body.put("initiatorId", call.getCallerId());
    body.put("callerId", call.getCallerId());
    body.put("peerUserId", call.getCalleeId());
    body.put("calleeId", call.getCalleeId());
    body.put("type", call.getCallType());
    body.put("status", call.getStatus());
    body.put("createTime", call.getCreatedAt().toString());
    return body;
  }
}
