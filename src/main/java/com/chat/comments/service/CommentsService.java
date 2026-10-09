package com.chat.comments.service;

import com.chat.comments.domain.model.Comment;
import com.chat.comments.domain.repository.CommentRepository;
import com.chat.common.messaging.ChatEventPublisher;
import com.chat.notifications.service.NotificationsService;
import com.chat.post.domain.model.Post;
import com.chat.post.domain.repository.PostRepository;
import com.chat.users.domain.repository.UserRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CommentsService {

  private final CommentRepository comments;
  private final PostRepository posts;
  private final UserRepository userRepository;
  private final ChatEventPublisher chatEventPublisher;
  private final NotificationsService notificationsService;

  public CommentsService(
      CommentRepository comments,
      PostRepository posts,
      UserRepository userRepository,
      ChatEventPublisher chatEventPublisher,
      NotificationsService notificationsService) {
    this.comments = comments;
    this.posts = posts;
    this.userRepository = userRepository;
    this.chatEventPublisher = chatEventPublisher;
    this.notificationsService = notificationsService;
  }

  @Transactional
  public Map<String, Object> create(String postId, String authorId, String content) {
    Post post =
        posts
            .findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    Comment comment = comments.save(Comment.create(postId, authorId, content));
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
    Comment comment =
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

  private Map<String, Object> toResponse(Comment comment) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", comment.getId());
    body.put("postId", comment.getPostId());
    body.put("authorId", comment.getAuthorId());
    body.put("userId", comment.getAuthorId());
    body.put("content", comment.getContent());
    body.put("createdAt", comment.getCreatedAt().toString());
    body.put("createTime", comment.getCreatedAt().toString());
    var authorOpt = userRepository.findById(comment.getAuthorId());
    if (authorOpt != null) {
      authorOpt.ifPresent(
          author -> {
            body.put("username", author.getUsername());
            body.put("avatar", author.getAvatar());
          });
    }
    return body;
  }
}
