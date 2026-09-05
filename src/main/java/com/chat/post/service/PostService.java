package com.chat.post.service;

import com.chat.common.aip.PageTokens;
import com.chat.common.messaging.ChatEventPublisher;
import com.chat.follow.domain.model.UserFollow;
import com.chat.follow.domain.repository.UserFollowRepository;
import com.chat.notifications.service.NotificationsService;
import com.chat.post.domain.model.Hashtag;
import com.chat.post.domain.model.PostHashtag;
import com.chat.post.domain.model.PostLike;
import com.chat.post.domain.model.PostSave;
import com.chat.post.domain.model.SocialPost;
import com.chat.post.domain.repository.HashtagRepository;
import com.chat.post.domain.repository.PostHashtagRepository;
import com.chat.post.domain.repository.PostLikeRepository;
import com.chat.post.domain.repository.PostSaveRepository;
import com.chat.post.domain.repository.SocialPostRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostService {

  private static final Pattern HASHTAG = Pattern.compile("#([A-Za-z0-9_]{1,64})");

  private final SocialPostRepository socialPostRepository;
  private final PostLikeRepository postLikeRepository;
  private final PostSaveRepository postSaveRepository;
  private final UserFollowRepository followRepository;
  private final HashtagRepository hashtagRepository;
  private final PostHashtagRepository postHashtagRepository;
  private final ChatEventPublisher chatEventPublisher;
  private final NotificationsService notificationsService;

  public PostService(
      SocialPostRepository socialPostRepository,
      PostLikeRepository postLikeRepository,
      PostSaveRepository postSaveRepository,
      UserFollowRepository followRepository,
      HashtagRepository hashtagRepository,
      PostHashtagRepository postHashtagRepository,
      ChatEventPublisher chatEventPublisher,
      NotificationsService notificationsService) {
    this.socialPostRepository = socialPostRepository;
    this.postLikeRepository = postLikeRepository;
    this.postSaveRepository = postSaveRepository;
    this.followRepository = followRepository;
    this.hashtagRepository = hashtagRepository;
    this.postHashtagRepository = postHashtagRepository;
    this.chatEventPublisher = chatEventPublisher;
    this.notificationsService = notificationsService;
  }

  @Transactional
  public Map<String, Object> create(
      String authorId, String caption, String mediaUrlsJson, String type, String coverUrl) {
    SocialPost post =
        socialPostRepository.save(
            SocialPost.create(authorId, caption, mediaUrlsJson, type, coverUrl, null));
    indexHashtags(post.getId(), post.getCaption());
    Map<String, Object> createdPayload = new HashMap<>();
    createdPayload.put("postId", post.getId());
    createdPayload.put("userId", authorId);
    createdPayload.put("createdAt", post.getCreatedAt().toString());
    createdPayload.put("caption", post.getCaption());
    createdPayload.put("type", post.getPostType());
    chatEventPublisher.sendPostCreated(createdPayload);
    chatEventPublisher.sendFeedFanout(createdPayload);
    return toClientPost(post, authorId);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> list(Integer pageSize, String pageToken, String viewerId) {
    return pagedPosts(pageSize, pageToken, null, viewerId);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> feed(String userId, Integer pageSize, String pageToken) {
    Set<String> authors = followingIds(userId);
    authors.add(userId);
    return pagedEntries(pageSize, pageToken, authors, null, false, userId);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> explore(String userId, Integer pageSize, String pageToken) {
    Set<String> following = followingIds(userId);
    Map<String, Object> body = pagedEntries(pageSize, pageToken, null, following, true, userId);
    body.put("total_size", socialPostRepository.countExploreExcluding(following));
    return body;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> reels(String userId, Integer pageSize, String pageToken) {
    int size = PageTokens.clampPageSize(pageSize);
    int offset = PageTokens.offsetFrom(pageToken);
    List<SocialPost> posts = socialPostRepository.listReels(offset, size);
    long total = socialPostRepository.countReels();
    return entriesBody(posts, offset, size, total, userId);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> byUser(
      String userId, Integer pageSize, String pageToken, String viewerId) {
    return pagedPosts(pageSize, pageToken, userId, viewerId);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> get(String id, String viewerId) {
    return toClientPost(require(id), viewerId);
  }

  @Transactional
  public Map<String, Object> like(String id, String userId) {
    SocialPost post = require(id);
    if (postLikeRepository.findByPostIdAndUserId(id, userId).isEmpty()) {
      post.applyLike();
      postLikeRepository.save(PostLike.of(id, userId));
      socialPostRepository.save(post);
      if (!post.getAuthorId().equals(userId)) {
        notificationsService.create(
            post.getAuthorId(),
            "LIKE",
            "{\"postId\":\"" + id + "\",\"userId\":\"" + userId + "\"}");
      }
    }
    return toClientPost(post, userId);
  }

  @Transactional
  public Map<String, Object> unlike(String id, String userId) {
    SocialPost post = require(id);
    postLikeRepository
        .findByPostIdAndUserId(id, userId)
        .ifPresent(
            like -> {
              post.removeLike();
              postLikeRepository.delete(like);
              socialPostRepository.save(post);
            });
    return toClientPost(post, userId);
  }

  @Transactional
  public Map<String, Object> save(String id, String userId) {
    SocialPost post = require(id);
    if (postSaveRepository.findByPostIdAndUserId(id, userId).isEmpty()) {
      postSaveRepository.save(PostSave.of(id, userId));
    }
    return toClientPost(post, userId);
  }

  @Transactional
  public Map<String, Object> unsave(String id, String userId) {
    SocialPost post = require(id);
    postSaveRepository.findByPostIdAndUserId(id, userId).ifPresent(postSaveRepository::delete);
    return toClientPost(post, userId);
  }

  @Transactional
  public void delete(String id, String userId) {
    SocialPost post = require(id);
    if (!post.getAuthorId().equals(userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not post author");
    }
    Map<String, Object> payload = new HashMap<>();
    payload.put("postId", post.getId());
    payload.put("userId", userId);
    socialPostRepository.delete(post);
    chatEventPublisher.sendPostDeleted(payload);
  }

  @Transactional
  public Map<String, Object> hide(String id) {
    SocialPost post = require(id);
    post.hide();
    return toClientPost(socialPostRepository.save(post), null);
  }

  @Transactional
  public Map<String, Object> unhide(String id) {
    SocialPost post = require(id);
    post.unhide();
    return toClientPost(socialPostRepository.save(post), null);
  }

  private void indexHashtags(String postId, String caption) {
    if (caption == null || caption.isBlank()) {
      return;
    }
    Matcher matcher = HASHTAG.matcher(caption);
    while (matcher.find()) {
      String tag = matcher.group(1).toLowerCase();
      Hashtag hashtag =
          hashtagRepository
              .findByTag(tag)
              .orElseGet(() -> hashtagRepository.save(Hashtag.create(tag)));
      if (!postHashtagRepository.existsByPostIdAndHashtagId(postId, hashtag.getId())) {
        hashtag.incrementPostCount();
        hashtagRepository.save(hashtag);
        postHashtagRepository.save(PostHashtag.of(postId, hashtag.getId()));
      }
    }
  }

  private Map<String, Object> pagedPosts(
      Integer pageSize, String pageToken, String authorId, String viewerId) {
    int size = PageTokens.clampPageSize(pageSize);
    int offset = PageTokens.offsetFrom(pageToken);
    List<SocialPost> posts =
        authorId == null
            ? socialPostRepository.listFeed(offset, size)
            : socialPostRepository.listByAuthor(authorId, offset, size);
    long total =
        authorId == null
            ? socialPostRepository.countAll()
            : socialPostRepository.countByAuthor(authorId);
    List<Map<String, Object>> items =
        posts.stream().map(p -> toClientPost(p, viewerId)).toList();
    Map<String, Object> body = new HashMap<>();
    body.put("posts", items);
    PageTokens.nextOffsetToken(offset, size, offset + size < total)
        .ifPresent(token -> body.put("next_page_token", token));
    return body;
  }

  private Map<String, Object> pagedEntries(
      Integer pageSize,
      String pageToken,
      Set<String> includeAuthors,
      Set<String> excludeAuthors,
      boolean explore,
      String viewerId) {
    int size = PageTokens.clampPageSize(pageSize);
    int offset = PageTokens.offsetFrom(pageToken);
    List<SocialPost> posts;
    long total;
    if (explore) {
      posts = socialPostRepository.listExploreExcluding(excludeAuthors, offset, size);
      total = socialPostRepository.countExploreExcluding(excludeAuthors);
    } else if (includeAuthors != null) {
      posts = socialPostRepository.listFeedForAuthors(includeAuthors, offset, size);
      total = socialPostRepository.countFeedForAuthors(includeAuthors);
    } else {
      posts = socialPostRepository.listFeed(offset, size);
      total = socialPostRepository.countAll();
    }
    return entriesBody(posts, offset, size, total, viewerId);
  }

  private Map<String, Object> entriesBody(
      List<SocialPost> posts, int offset, int size, long total, String viewerId) {
    List<Map<String, Object>> entries = new ArrayList<>();
    for (SocialPost post : posts) {
      Map<String, Object> entry = new HashMap<>();
      entry.put("postId", post.getId());
      entry.put("authorId", post.getAuthorId());
      entry.put("createdAt", post.getCreatedAt().toString());
      entry.put("post", toClientPost(post, viewerId));
      entries.add(entry);
    }
    Map<String, Object> body = new HashMap<>();
    body.put("entries", entries);
    PageTokens.nextOffsetToken(offset, size, offset + size < total)
        .ifPresent(token -> body.put("next_page_token", token));
    return body;
  }

  private Set<String> followingIds(String userId) {
    Set<String> ids = new HashSet<>();
    for (UserFollow follow : followRepository.findByFollowerId(userId)) {
      ids.add(follow.getFollowingId());
    }
    return ids;
  }

  private SocialPost require(String id) {
    return socialPostRepository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
  }

  private Map<String, Object> toClientPost(SocialPost post, String viewerId) {
    boolean liked =
        viewerId != null
            && postLikeRepository.findByPostIdAndUserId(post.getId(), viewerId).isPresent();
    boolean saved =
        viewerId != null
            && postSaveRepository.findByPostIdAndUserId(post.getId(), viewerId).isPresent();
    long saveCount = postSaveRepository.countByPostId(post.getId());
    Map<String, Object> body = new HashMap<>();
    body.put("id", post.getId());
    body.put("postId", post.getId());
    body.put("authorId", post.getAuthorId());
    body.put("userId", post.getAuthorId());
    body.put("caption", post.getCaption());
    body.put("type", post.getPostType());
    body.put("mediaUrls", parseMediaUrls(post.getMediaUrls()));
    body.put("coverUrl", post.getCoverUrl());
    body.put("location", post.getLocation());
    body.put("hidden", post.isHidden());
    body.put("likeCount", post.getLikeCount());
    body.put("commentCount", post.getCommentCount());
    body.put("saveCount", saveCount);
    body.put("isLiked", liked);
    body.put("isSaved", saved);
    body.put("createdAt", post.getCreatedAt().toString());
    body.put("createTime", post.getCreatedAt().toString());
    return body;
  }

  private List<String> parseMediaUrls(String json) {
    if (json == null || json.isBlank() || "[]".equals(json.trim())) {
      return List.of();
    }
    String trimmed = json.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      String inner = trimmed.substring(1, trimmed.length() - 1).trim();
      if (inner.isEmpty()) {
        return List.of();
      }
      return Arrays.stream(inner.split(","))
          .map(String::trim)
          .map(s -> s.replace("\"", ""))
          .filter(s -> !s.isEmpty())
          .toList();
    }
    return List.of(trimmed);
  }
}
