package com.chat.common.config;

import com.chat.ads.domain.model.AdAccount;
import com.chat.ads.domain.repository.AdAccountRepository;
import com.chat.analytics.domain.model.AnalyticsEvent;
import com.chat.analytics.domain.repository.AnalyticsEventRepository;
import com.chat.chats.domain.model.Chat;
import com.chat.chats.domain.model.ChatParticipant;
import com.chat.chats.domain.repository.ChatParticipantRepository;
import com.chat.chats.domain.repository.ChatRepository;
import com.chat.follow.domain.model.UserFollow;
import com.chat.follow.domain.repository.UserFollowRepository;
import com.chat.groups.domain.model.GroupParticipant;
import com.chat.groups.domain.model.SocialGroup;
import com.chat.groups.domain.repository.GroupParticipantRepository;
import com.chat.groups.domain.repository.SocialGroupRepository;
import com.chat.messages.domain.model.Message;
import com.chat.messages.domain.repository.MessageRepository;
import com.chat.post.domain.model.PostLike;
import com.chat.post.domain.model.PostSave;
import com.chat.post.domain.model.SocialPost;
import com.chat.post.domain.repository.PostLikeRepository;
import com.chat.post.domain.repository.PostSaveRepository;
import com.chat.post.domain.repository.SocialPostRepository;
import com.chat.status.domain.model.UserStatus;
import com.chat.status.domain.repository.UserStatusRepository;
import com.chat.users.domain.model.ChatUser;
import com.chat.users.domain.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "chat",
    name = "demo-seed",
    havingValue = "true",
    matchIfMissing = true)
public class DemoDataLoader implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(DemoDataLoader.class);

  private final UserRepository userRepository;
  private final SocialPostRepository postRepository;
  private final PostLikeRepository postLikeRepository;
  private final PostSaveRepository postSaveRepository;
  private final UserFollowRepository followRepository;
  private final ChatRepository chatRepository;
  private final ChatParticipantRepository participantRepository;
  private final MessageRepository messageRepository;
  private final UserStatusRepository statusRepository;
  private final SocialGroupRepository groupRepository;
  private final GroupParticipantRepository groupParticipantRepository;
  private final AdAccountRepository adAccountRepository;
  private final AnalyticsEventRepository analyticsEventRepository;
  private final PasswordEncoder passwordEncoder;

  public DemoDataLoader(
      UserRepository userRepository,
      SocialPostRepository postRepository,
      PostLikeRepository postLikeRepository,
      PostSaveRepository postSaveRepository,
      UserFollowRepository followRepository,
      ChatRepository chatRepository,
      ChatParticipantRepository participantRepository,
      MessageRepository messageRepository,
      UserStatusRepository statusRepository,
      SocialGroupRepository groupRepository,
      GroupParticipantRepository groupParticipantRepository,
      AdAccountRepository adAccountRepository,
      AnalyticsEventRepository analyticsEventRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.postRepository = postRepository;
    this.postLikeRepository = postLikeRepository;
    this.postSaveRepository = postSaveRepository;
    this.followRepository = followRepository;
    this.chatRepository = chatRepository;
    this.participantRepository = participantRepository;
    this.messageRepository = messageRepository;
    this.statusRepository = statusRepository;
    this.groupRepository = groupRepository;
    this.groupParticipantRepository = groupParticipantRepository;
    this.adAccountRepository = adAccountRepository;
    this.analyticsEventRepository = analyticsEventRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(ApplicationArguments args) {
    if (postRepository.countAll() > 0) {
      return;
    }

    String hash = passwordEncoder.encode("123456");
    ChatUser cristiano =
        userRepository
            .findByEmail("cristiano@whatschat.com")
            .orElseGet(
                () ->
                    userRepository.save(
                        ChatUser.register("cristiano", "cristiano@whatschat.com", hash)));
    ChatUser messi =
        userRepository
            .findByEmail("messi@whatschat.com")
            .orElseGet(
                () -> userRepository.save(ChatUser.register("messi", "messi@whatschat.com", hash)));
    ChatUser neymar =
        userRepository
            .findByEmail("neymar@whatschat.com")
            .orElseGet(
                () ->
                    userRepository.save(
                        ChatUser.register("neymar", "neymar@whatschat.com", hash)));

    cristiano.updateProfile(null, null, "Demo captain", null);
    messi.updateProfile(null, null, "Inter Miami", null);
    neymar.updateProfile(null, null, "Santos", null);
    userRepository.save(cristiano);
    userRepository.save(messi);
    userRepository.save(neymar);

    SocialPost welcome =
        postRepository.save(
            SocialPost.create(
                cristiano.getId(),
                "Welcome to ExploreChat — first Post from the demo seed.",
                "[]"));
    postRepository.save(SocialPost.create(neymar.getId(), "Sunset run", "[]"));
    postRepository.save(
        SocialPost.create(
            cristiano.getId(),
            "Shipping the Java API. Feed should no longer be empty.",
            "[]",
            "VIDEO",
            null,
            null));

    final SocialPost training =
        postRepository.save(
            SocialPost.create(messi.getId(), "Training day. #football #explore", "[]"));
    welcome.applyLike();
    postRepository.save(welcome);
    postLikeRepository.save(PostLike.of(welcome.getId(), messi.getId()));
    postSaveRepository.save(PostSave.of(training.getId(), cristiano.getId()));

    seedFollow(cristiano.getId(), messi.getId());
    seedFollow(cristiano.getId(), neymar.getId());
    seedFollow(messi.getId(), cristiano.getId());

    Chat chat = chatRepository.save(Chat.createPrivate());
    participantRepository.save(ChatParticipant.join(chat.getId(), cristiano.getId(), "MEMBER"));
    participantRepository.save(ChatParticipant.join(chat.getId(), messi.getId(), "MEMBER"));
    messageRepository.save(Message.send(chat.getId(), messi.getId(), "Hey Cristiano 👋"));
    messageRepository.save(Message.send(chat.getId(), cristiano.getId(), "Hello Messi!"));

    statusRepository.save(
        UserStatus.create(cristiano.getId(), "On the pitch", null, "TEXT"));

    SocialGroup group =
        groupRepository.save(
            SocialGroup.create("Football Legends", cristiano.getId(), "Demo group"));
    groupParticipantRepository.save(
        GroupParticipant.join(group.getId(), cristiano.getId(), "owner"));
    groupParticipantRepository.save(GroupParticipant.join(group.getId(), messi.getId(), "member"));

    adAccountRepository.save(AdAccount.create(cristiano.getId(), "Demo Ads"));
    analyticsEventRepository.save(
        AnalyticsEvent.record(cristiano.getId(), "demo_seed", "{\"source\":\"DemoDataLoader\"}"));

    log.info(
        "Seeded demo users (cristiano/messi/neymar @whatschat.com / 123456),"
            + " posts, likes/saves, status, group, ads, analytics");
  }

  private void seedFollow(String followerId, String followingId) {
    if (followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isEmpty()) {
      followRepository.save(UserFollow.of(followerId, followingId));
    }
  }
}
