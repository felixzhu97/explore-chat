package com.chat.comments.service;

import com.chat.comments.domain.model.PostComment;
import com.chat.comments.domain.repository.PostCommentRepository;
import com.chat.common.messaging.ChatEventPublisher;
import com.chat.notifications.service.NotificationsService;
import com.chat.post.domain.model.SocialPost;
import com.chat.post.domain.repository.SocialPostRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CommentsService {

  private final PostCommentRepository comments;
  private final SocialPostRepository posts;
  private final ChatEventPublisher chatEventPublisher;
  private final NotificationsService notificationsService;

  public CommentsService(
      PostCommentRepository comments,
      SocialPostRepository posts,
      ChatEventPublisher chatEventPublisher,
      NotificationsService notificationsService) {
    this.comments = comments;
    this.posts = posts;
    this.chatEventPublisher = chatEventPublisher;
    this.notificationsService = notificationsService;
  }

  @Transactional
  public Map<String, Object> create(String postId, String authorId, String content) {
    SocialPost post =
        posts
            .findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    PostComment comment = comments.save(PostComment.create(postId, authorId, content));
    post.incrementComments();
    posts.save(post);
    Map<String, Object> response = toResponse(comment);
    chatEventPublisher.sendCommentCreated(response);
    if (!post.getAuthorId().equals(authorId)) {
      notificationsService.create(
          post.getAuthorId(),
          "COMMENT",
          "{\"postId\":\"" + postId + "\",\"userId\":\"" + authorId + "\"}");
    }
    return response;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> list(String postId) {
    List<Map<String, Object>> items =
        comments.findByPostIdOrderByCreatedAtAsc(postId).stream().map(this::toResponse).toList();
    return Map.of("comments", items);
  }

  @Transactional
  public void delete(String postId, String commentId, String userId) {
    PostComment comment =
        comments
            .findById(commentId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    if (!comment.getPostId().equals(postId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment not on post");
    }
    if (!comment.getAuthorId().equals(userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not comment author");
    }
    comments.delete(comment);
    posts
        .findById(postId)
        .ifPresent(
            post -> {
              post.decrementComments();
              posts.save(post);
            });
  }

  private Map<String, Object> toResponse(PostComment comment) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", comment.getId());
    body.put("postId", comment.getPostId());
    body.put("authorId", comment.getAuthorId());
    body.put("content", comment.getContent());
    body.put("createTime", comment.getCreatedAt().toString());
    return body;
  }
}
