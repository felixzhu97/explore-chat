package com.chat.groups.controller;

import com.chat.groups.service.GroupsService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/groups")
public class GroupsController {

  private final GroupsService groupsService;

  public GroupsController(GroupsService groupsService) {
    this.groupsService = groupsService;
  }

  @GetMapping
  public Map<String, Object> list() {
    return groupsService.list();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> create(
      Authentication authentication, @RequestBody Map<String, Object> body) {
    String name = body.get("name") == null ? "Group" : String.valueOf(body.get("name"));
    String description =
        body.get("description") == null ? null : String.valueOf(body.get("description"));
    return groupsService.create(authentication.getName(), name, description);
  }

  @GetMapping("{group}")
  public Map<String, Object> get(@PathVariable String group) {
    return groupsService.get(group);
  }

  @PostMapping("{group}/participants")
  public Map<String, Object> addMember(
      Authentication authentication,
      @PathVariable String group,
      @RequestBody Map<String, String> body) {
    return groupsService.addMember(
        group, authentication.getName(), body.getOrDefault("userId", ""));
  }

  @DeleteMapping("{group}/participants/{user}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void removeMember(
      Authentication authentication,
      @PathVariable String group,
      @PathVariable("user") String user) {
    groupsService.removeMember(group, authentication.getName(), user);
  }
}
