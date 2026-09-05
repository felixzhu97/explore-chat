package com.chat.search.service;

import com.chat.post.domain.model.Hashtag;
import com.chat.post.domain.model.PostHashtag;
import com.chat.post.domain.repository.HashtagRepository;
import com.chat.post.domain.repository.PostHashtagRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HashtagService {

  private static final Pattern TAG = Pattern.compile("#([A-Za-z0-9_]{1,64})");

  private final HashtagRepository hashtagRepository;
  private final PostHashtagRepository postHashtagRepository;

  public HashtagService(
      HashtagRepository hashtagRepository, PostHashtagRepository postHashtagRepository) {
    this.hashtagRepository = hashtagRepository;
    this.postHashtagRepository = postHashtagRepository;
  }

  @Transactional
  public void indexPostCaption(String postId, String caption) {
    if (caption == null || caption.isBlank()) {
      return;
    }
    Matcher matcher = TAG.matcher(caption);
    while (matcher.find()) {
      String raw = matcher.group(1).toLowerCase();
      Hashtag hashtag =
          hashtagRepository
              .findByTag(raw)
              .orElseGet(() -> hashtagRepository.save(Hashtag.create(raw)));
      if (!postHashtagRepository.existsByPostIdAndHashtagId(postId, hashtag.getId())) {
        hashtag.incrementPostCount();
        hashtagRepository.save(hashtag);
        postHashtagRepository.save(PostHashtag.of(postId, hashtag.getId()));
      }
    }
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> search(String query, int limit) {
    String q = query == null ? "" : query.replace("#", "").trim();
    if (q.isEmpty()) {
      return List.of();
    }
    List<Map<String, Object>> items = new ArrayList<>();
    for (Hashtag hashtag : hashtagRepository.findByTagContainingIgnoreCase(q)) {
      Map<String, Object> row = new HashMap<>();
      row.put("tag", hashtag.getTag());
      row.put("name", hashtag.getTag());
      row.put("postCount", hashtag.getPostCount());
      items.add(row);
      if (items.size() >= Math.max(limit, 1)) {
        break;
      }
    }
    return items;
  }
}
