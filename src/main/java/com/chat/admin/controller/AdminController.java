package com.chat.admin.controller;

import com.chat.admin.service.AdminService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping("users")
  public Map<String, Object> users() {
    return adminService.listUsers();
  }

  @GetMapping("list/posts")
  public Map<String, Object> posts() {
    return adminService.listPosts();
  }

  @GetMapping("analytics/overview")
  public Map<String, Object> overview() {
    return adminService.overview();
  }

  @PostMapping("users/{user}:disable")
  public Map<String, Object> disableUser(@PathVariable String user) {
    return adminService.disableUser(user);
  }

  @PostMapping("posts/{post}:hide")
  public Map<String, Object> hidePost(@PathVariable String post) {
    return adminService.hidePost(post);
  }

  @PostMapping("posts/{post}:unhide")
  public Map<String, Object> unhidePost(@PathVariable String post) {
    return adminService.unhidePost(post);
  }
}
