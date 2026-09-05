package com.chat.search.controller;

import com.chat.post.domain.model.Hashtag;
import com.chat.post.domain.repository.HashtagRepository;
import com.chat.post.domain.repository.SocialPostRepository;
import com.chat.users.domain.repository.UserRepository;
import com.chat.users.mapper.UserMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

  private final UserRepository userRepository;
  private final SocialPostRepository socialPostRepository;
  private final HashtagRepository hashtagRepository;

  public SearchController(
      UserRepository userRepository,
      SocialPostRepository socialPostRepository,
      HashtagRepository hashtagRepository) {
    this.userRepository = userRepository;
    this.socialPostRepository = socialPostRepository;
    this.hashtagRepository = hashtagRepository;
  }

  @GetMapping
  public Map<String, Object> search(
      @RequestParam("q") String query,
      @RequestParam(value = "type", defaultValue = "users") String type) {
    Map<String, Object> body = new HashMap<>();
    if ("users".equals(type) || "all".equals(type)) {
      body.put(
          "users",
          userRepository.findByUsernameContainingIgnoreCase(query).stream()
              .limit(20)
              .map(UserMapper::toResponse)
              .toList());
    }
    if ("posts".equals(type) || "all".equals(type)) {
      List<Map<String, Object>> posts =
          socialPostRepository.listFeed(0, 50).stream()
              .filter(
                  p ->
                      p.getCaption() != null
                          && p.getCaption().toLowerCase().contains(query.toLowerCase()))
              .map(
                  p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", p.getId());
                    m.put("caption", p.getCaption());
                    m.put("authorId", p.getAuthorId());
                    return m;
                  })
              .toList();
      body.put("posts", posts);
    }
    if ("hashtags".equals(type) || "all".equals(type)) {
      String tagQuery = query.startsWith("#") ? query.substring(1) : query;
      List<Map<String, Object>> hashtags =
          hashtagRepository.findByTagContainingIgnoreCase(tagQuery).stream()
              .limit(20)
              .map(this::toHashtag)
              .toList();
      body.put("hashtags", hashtags);
    }
    return body;
  }

  private Map<String, Object> toHashtag(Hashtag hashtag) {
    Map<String, Object> m = new HashMap<>();
    m.put("id", hashtag.getId());
    m.put("tag", hashtag.getTag());
    m.put("postCount", hashtag.getPostCount());
    return m;
  }
}
