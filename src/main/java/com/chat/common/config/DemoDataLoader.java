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
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Seeds local demo users and Unsplash feed media (city / map / meditation). */
@Component
@ConditionalOnProperty(
    prefix = "chat",
    name = "demo-seed",
    havingValue = "true",
    matchIfMissing = true)
public class DemoDataLoader implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(DemoDataLoader.class);

  /** Classic anonymous cast (alice … judy). */
  private static final String[] DEMO_USERS = {
    "alice", "bob", "carol", "dave", "eve", "frank", "grace", "heidi", "ivan", "judy"
  };

  /** Greeting-style captions (not Unsplash tag labels). */
  private static final String[] FEED_CAPTIONS = {
    "Hey — hope your morning is going well",
    "Hi from downtown — say hello back",
    "Good afternoon — found a quiet corner",
    "Hello friends — glad you're here",
    "Welcome back — maps and coffee weather"
  };

  /** Unsplash stills: city / map / meditation. */
  private static final String[] FEED_IMAGES = {
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=1000&fit=crop"
  };

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
    List<ChatUser> users = ensureDemoUsers();
    if (postRepository.countAll() == 0) {
      seedFresh(users);
    }
    enrichFeedMedia();
  }

  private List<ChatUser> ensureDemoUsers() {
    String hash = passwordEncoder.encode("123456");
    List<ChatUser> users = new ArrayList<>(DEMO_USERS.length);
    for (String name : DEMO_USERS) {
      String label = capitalize(name);
      users.add(ensureUser(name, name + "@example.com", hash, "", avatar(label)));
    }
    log.info("Demo users ready ({}): *@example.com / 123456", users.size());
    return users;
  }

  private void seedFresh(List<ChatUser> users) {
    final ChatUser alice = users.get(0);
    final ChatUser bob = users.get(1);

    SocialPost first = null;
    SocialPost last = null;
    for (int i = 0; i < users.size(); i++) {
      ChatUser author = users.get(i);
      String caption = FEED_CAPTIONS[i % FEED_CAPTIONS.length];
      String image = FEED_IMAGES[i % FEED_IMAGES.length];
      boolean reel = i % 5 == 2;
      SocialPost post =
          postRepository.save(
              SocialPost.create(
                  author.getId(),
                  caption,
                  json(image),
                  reel ? "VIDEO" : "IMAGE",
                  reel ? image : null,
                  null));
      if (first == null) {
        first = post;
      }
      last = post;
    }

    first.applyLike();
    postRepository.save(first);
    postLikeRepository.save(PostLike.of(first.getId(), bob.getId()));
    postSaveRepository.save(PostSave.of(last.getId(), alice.getId()));

    for (int i = 1; i < users.size(); i++) {
      seedFollow(alice.getId(), users.get(i).getId());
    }
    seedFollow(bob.getId(), alice.getId());

    Chat chat = chatRepository.save(Chat.createPrivate());
    participantRepository.save(ChatParticipant.join(chat.getId(), alice.getId(), "MEMBER"));
    participantRepository.save(ChatParticipant.join(chat.getId(), bob.getId(), "MEMBER"));
    messageRepository.save(Message.send(chat.getId(), bob.getId(), "hi"));
    messageRepository.save(Message.send(chat.getId(), alice.getId(), "hello"));

    statusRepository.save(
        UserStatus.create(alice.getId(), FEED_CAPTIONS[0], FEED_IMAGES[0], "IMAGE"));

    SocialGroup group = groupRepository.save(SocialGroup.create("demo", alice.getId(), "demo"));
    groupParticipantRepository.save(GroupParticipant.join(group.getId(), alice.getId(), "owner"));
    groupParticipantRepository.save(GroupParticipant.join(group.getId(), bob.getId(), "member"));

    adAccountRepository.save(AdAccount.create(alice.getId(), "demo"));
    analyticsEventRepository.save(
        AnalyticsEvent.record(alice.getId(), "demo_seed", "{\"source\":\"DemoDataLoader\"}"));

    log.info("Seeded demo posts, follows, chat, status, group");
  }

  private void enrichFeedMedia() {
    List<SocialPost> posts = postRepository.listFeed(0, 50);
    int index = 0;
    for (SocialPost post : posts) {
      String caption = FEED_CAPTIONS[index % FEED_CAPTIONS.length];
      String url = FEED_IMAGES[index % FEED_IMAGES.length];
      post.rewriteCaption(caption);
      if (post.isReel()) {
        post.replaceMedia(json(url), "VIDEO", url);
      } else {
        post.replaceMedia(json(url), "IMAGE", null);
      }
      postRepository.save(post);
      index++;
    }
    log.info("Enriched feed captions and city/map/meditation media");
  }

  private ChatUser ensureUser(
      String username, String email, String hash, String status, String avatarUrl) {
    return userRepository
        .findByEmail(email)
        .map(
            existing -> {
              existing.updateProfile(username, null, status, avatarUrl);
              return userRepository.save(existing);
            })
        .orElseGet(
            () -> {
              if (userRepository.findByUsername(username).isPresent()) {
                return userRepository.findByUsername(username).orElseThrow();
              }
              ChatUser created = userRepository.save(ChatUser.register(username, email, hash));
              created.updateProfile(null, null, status, avatarUrl);
              return userRepository.save(created);
            });
  }

  private void seedFollow(String followerId, String followingId) {
    if (followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isEmpty()) {
      followRepository.save(UserFollow.of(followerId, followingId));
    }
  }

  private static String capitalize(String name) {
    return name.substring(0, 1).toUpperCase(Locale.ROOT) + name.substring(1);
  }

  private static String avatar(String name) {
    return "https://ui-avatars.com/api/?name="
        + name
        + "&background=000000&color=ffffff&size=150&bold=true";
  }

  private static String json(String url) {
    return "[\"" + url + "\"]";
  }
}
