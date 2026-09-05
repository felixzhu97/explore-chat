package com.chat.post.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chat.common.messaging.ChatEventPublisher;
import com.chat.follow.domain.repository.UserFollowRepository;
import com.chat.notifications.service.NotificationsService;
import com.chat.post.domain.model.PostLike;
import com.chat.post.domain.model.SocialPost;
import com.chat.post.domain.repository.HashtagRepository;
import com.chat.post.domain.repository.PostHashtagRepository;
import com.chat.post.domain.repository.PostLikeRepository;
import com.chat.post.domain.repository.PostSaveRepository;
import com.chat.post.domain.repository.SocialPostRepository;
import com.chat.users.domain.repository.UserRepository;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

  @Mock private SocialPostRepository socialPostRepository;
  @Mock private PostLikeRepository postLikeRepository;
  @Mock private PostSaveRepository postSaveRepository;
  @Mock private UserFollowRepository followRepository;
  @Mock private HashtagRepository hashtagRepository;
  @Mock private PostHashtagRepository postHashtagRepository;
  @Mock private UserRepository userRepository;
  @Mock private ChatEventPublisher chatEventPublisher;
  @Mock private NotificationsService notificationsService;

  @InjectMocks private PostService postService;

  @BeforeEach
  void stubClientPostLookups() {
    lenient().when(postSaveRepository.countByPostId(any())).thenReturn(0L);
    lenient().when(postLikeRepository.existsByPostIdAndUserId(any(), any())).thenReturn(false);
    lenient().when(postSaveRepository.existsByPostIdAndUserId(any(), any())).thenReturn(false);
    lenient().when(userRepository.findById(any())).thenReturn(Optional.empty());
  }

  @Test
  @DisplayName("should apply like and notify author when user likes post")
  void shouldApplyLikeAndNotifyAuthorWhenUserLikesPost() {
    SocialPost post = SocialPost.create("author-1", "caption", "[]");
    PostLike like = PostLike.of(post.getId(), "viewer-1");
    when(socialPostRepository.findById(post.getId())).thenReturn(Optional.of(post));
    when(postLikeRepository.findByPostIdAndUserId(post.getId(), "viewer-1"))
        .thenReturn(Optional.empty())
        .thenReturn(Optional.of(like));
    when(postLikeRepository.save(any(PostLike.class))).thenReturn(like);
    when(socialPostRepository.save(any(SocialPost.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Map<String, Object> result = postService.like(post.getId(), "viewer-1");

    assertThat(result.get("likeCount")).isEqualTo(1L);
    assertThat(result.get("isLiked")).isEqualTo(true);
    verify(notificationsService).create(eq("author-1"), eq("LIKE"), any());
  }

  @Test
  @DisplayName("should publish post created and feed fanout when creating post")
  void shouldPublishPostCreatedAndFeedFanoutWhenCreatingPost() {
    when(socialPostRepository.save(any(SocialPost.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(hashtagRepository.findByTag(any())).thenReturn(Optional.empty());
    when(hashtagRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    when(postHashtagRepository.existsByPostIdAndHashtagId(any(), any())).thenReturn(false);
    when(postHashtagRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

    Map<String, Object> result =
        postService.create("author-1", "hello #tag", "[]", "TEXT", null);

    assertThat(result.get("caption")).isEqualTo("hello #tag");
    verify(chatEventPublisher).sendPostCreated(anyMap());
    verify(chatEventPublisher).sendFeedFanout(anyMap());
  }

  @Test
  @DisplayName("should not notify when author likes own post")
  void shouldNotNotifyWhenAuthorLikesOwnPost() {
    SocialPost post = SocialPost.create("author-1", "caption", "[]");
    when(socialPostRepository.findById(post.getId())).thenReturn(Optional.of(post));
    when(postLikeRepository.findByPostIdAndUserId(post.getId(), "author-1"))
        .thenReturn(Optional.empty());
    when(postLikeRepository.save(any(PostLike.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(socialPostRepository.save(any(SocialPost.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    postService.like(post.getId(), "author-1");

    verify(notificationsService, never()).create(any(), any(), any());
  }
}
