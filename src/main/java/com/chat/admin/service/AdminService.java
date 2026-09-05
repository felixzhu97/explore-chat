package com.chat.admin.service;

import com.chat.messages.domain.repository.MessageRepository;
import com.chat.post.domain.model.SocialPost;
import com.chat.post.domain.repository.SocialPostRepository;
import com.chat.users.domain.model.ChatUser;
import com.chat.users.domain.repository.UserRepository;
import com.chat.users.mapper.UserMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminService {

  private final UserRepository userRepository;
  private final SocialPostRepository socialPostRepository;
  private final MessageRepository messageRepository;

  public AdminService(
      UserRepository userRepository,
      SocialPostRepository socialPostRepository,
      MessageRepository messageRepository) {
    this.userRepository = userRepository;
    this.socialPostRepository = socialPostRepository;
    this.messageRepository = messageRepository;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> listUsers() {
    return Map.of(
        "users",
        userRepository.listAll(200).stream().map(UserMapper::toResponse).toList());
  }

  @Transactional(readOnly = true)
  public Map<String, Object> listPosts() {
    List<Map<String, Object>> posts =
        socialPostRepository.listFeed(0, 200).stream()
            .map(
                p -> {
                  Map<String, Object> m = new HashMap<>();
                  m.put("id", p.getId());
                  m.put("authorId", p.getAuthorId());
                  m.put("caption", p.getCaption());
                  m.put("hidden", p.isHidden());
                  m.put("likeCount", p.getLikeCount());
                  return m;
                })
            .toList();
    return Map.of("posts", posts);
  }

  @Transactional
  public Map<String, Object> disableUser(String userId) {
    ChatUser user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    user.disable();
    return Map.of("user", UserMapper.toResponse(userRepository.save(user)));
  }

  @Transactional
  public Map<String, Object> hidePost(String postId) {
    SocialPost post = requirePost(postId);
    post.hide();
    socialPostRepository.save(post);
    return Map.of("id", post.getId(), "hidden", true);
  }

  @Transactional
  public Map<String, Object> unhidePost(String postId) {
    SocialPost post = requirePost(postId);
    post.unhide();
    socialPostRepository.save(post);
    return Map.of("id", post.getId(), "hidden", false);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> overview() {
    return Map.of(
        "users",
        userRepository.countAll(),
        "posts",
        socialPostRepository.countAll(),
        "messages",
        messageRepository.countAll());
  }

  private SocialPost requirePost(String id) {
    return socialPostRepository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
  }
}
