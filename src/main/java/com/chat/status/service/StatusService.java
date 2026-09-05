package com.chat.status.service;

import com.chat.status.domain.model.StatusView;
import com.chat.status.domain.model.UserStatus;
import com.chat.status.domain.repository.StatusViewRepository;
import com.chat.status.domain.repository.UserStatusRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StatusService {

  private final UserStatusRepository statusRepository;
  private final StatusViewRepository viewRepository;

  public StatusService(UserStatusRepository statusRepository, StatusViewRepository viewRepository) {
    this.statusRepository = statusRepository;
    this.viewRepository = viewRepository;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> list() {
    List<Map<String, Object>> statuses =
        statusRepository.findActive(Instant.now()).stream().map(this::toResponse).toList();
    return Map.of("statuses", statuses);
  }

  @Transactional
  public Map<String, Object> create(
      String authorId, String content, String mediaUrl, String statusType) {
    UserStatus status =
        statusRepository.save(UserStatus.create(authorId, content, mediaUrl, statusType));
    return toResponse(status);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> get(String id) {
    return toResponse(require(id));
  }

  @Transactional
  public void delete(String id, String userId) {
    UserStatus status = require(id);
    if (!status.getAuthorId().equals(userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not status author");
    }
    statusRepository.delete(status);
  }

  @Transactional
  public void view(String id, String viewerId) {
    require(id);
    if (viewRepository.findByStatusIdAndViewerId(id, viewerId).isEmpty()) {
      viewRepository.save(StatusView.of(id, viewerId));
    }
  }

  private UserStatus require(String id) {
    return statusRepository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Status not found"));
  }

  private Map<String, Object> toResponse(UserStatus status) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", status.getId());
    body.put("authorId", status.getAuthorId());
    body.put("content", status.getContent());
    body.put("mediaUrl", status.getMediaUrl());
    body.put("statusType", status.getStatusType());
    body.put("expiresAt", status.getExpiresAt().toString());
    body.put("viewCount", viewRepository.countByStatusId(status.getId()));
    body.put("createTime", status.getCreatedAt().toString());
    return body;
  }
}
