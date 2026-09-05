package com.chat.groups.service;

import com.chat.groups.domain.model.GroupParticipant;
import com.chat.groups.domain.model.SocialGroup;
import com.chat.groups.domain.repository.GroupParticipantRepository;
import com.chat.groups.domain.repository.SocialGroupRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GroupsService {

  private final SocialGroupRepository groupRepository;
  private final GroupParticipantRepository participantRepository;

  public GroupsService(
      SocialGroupRepository groupRepository, GroupParticipantRepository participantRepository) {
    this.groupRepository = groupRepository;
    this.participantRepository = participantRepository;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> list() {
    List<Map<String, Object>> groups =
        groupRepository.listAll().stream().map(this::toResponse).toList();
    return Map.of("groups", groups);
  }

  @Transactional
  public Map<String, Object> create(String ownerId, String name, String description) {
    SocialGroup group =
        groupRepository.save(SocialGroup.create(name, ownerId, description));
    participantRepository.save(GroupParticipant.join(group.getId(), ownerId, "owner"));
    return toResponse(group);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> get(String groupId) {
    SocialGroup group = require(groupId);
    Map<String, Object> body = toResponse(group);
    body.put(
        "participants",
        participantRepository.findByGroupId(groupId).stream()
            .map(
                p ->
                    Map.of(
                        "userId", p.getUserId(),
                        "role", p.getRole()))
            .toList());
    return body;
  }

  @Transactional
  public Map<String, Object> addMember(String groupId, String actorId, String userId) {
    SocialGroup group = require(groupId);
    if (!group.getOwnerId().equals(actorId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not group owner");
    }
    if (participantRepository.findByGroupIdAndUserId(groupId, userId).isEmpty()) {
      participantRepository.save(GroupParticipant.join(groupId, userId, "member"));
    }
    return get(groupId);
  }

  @Transactional
  public Map<String, Object> removeMember(String groupId, String actorId, String userId) {
    SocialGroup group = require(groupId);
    if (!group.getOwnerId().equals(actorId) && !actorId.equals(userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
    }
    participantRepository
        .findByGroupIdAndUserId(groupId, userId)
        .ifPresent(participantRepository::delete);
    return get(groupId);
  }

  @Transactional
  public void delete(String groupId, String actorId) {
    SocialGroup group = require(groupId);
    if (!group.getOwnerId().equals(actorId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not group owner");
    }
    for (GroupParticipant participant : participantRepository.findByGroupId(groupId)) {
      participantRepository.delete(participant);
    }
    groupRepository.delete(group);
  }

  private SocialGroup require(String id) {
    return groupRepository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));
  }

  private Map<String, Object> toResponse(SocialGroup group) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", group.getId());
    body.put("name", group.getName());
    body.put("description", group.getDescription());
    body.put("avatar", group.getAvatar());
    body.put("ownerId", group.getOwnerId());
    body.put("createTime", group.getCreatedAt().toString());
    return body;
  }
}
