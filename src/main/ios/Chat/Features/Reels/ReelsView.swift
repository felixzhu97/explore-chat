import SwiftUI

struct ReelsView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var settings: SettingsStore
  @State private var posts: [FeedPost] = MockReels.posts
  @State private var activeId: String?
  @State private var likedIds: Set<String> = []
  @State private var isMuted = true
  @State private var errorMessage: String?

  var body: some View {
    // Page TabView avoids LazyVStack+GeometryReader height drift that
    // left the previous reel's chrome visible at the top of the screen.
    TabView(selection: $activeId) {
      ForEach(posts) { post in
        ReelPageView(
          post: post,
          isActive: activeId == post.id,
          isMuted: isMuted,
          isLiked: likedIds.contains(post.id),
          onToggleMute: { isMuted.toggle() },
          onToggleLike: { toggleLike(post.id) }
        )
        .tag(Optional(post.id))
      }
    }
    .tabViewStyle(.page(indexDisplayMode: .never))
    .ignoresSafeArea()
    .background(Color.black)
    .toolbar(.hidden, for: .navigationBar)
    .task {
      if activeId == nil {
        activeId = posts.first?.id
      }
      await load()
    }
    .onChange(of: posts) { _, newPosts in
      if activeId == nil || !(newPosts.contains { $0.id == activeId }) {
        activeId = newPosts.first?.id
      }
    }
  }

  private func toggleLike(_ id: String) {
    if likedIds.contains(id) {
      likedIds.remove(id)
    } else {
      likedIds.insert(id)
    }
  }

  private func load() async {
    do {
      let page: FeedPage = try await environment.api.get(
        "posts/reels",
        query: [URLQueryItem(name: "page_size", value: "20")]
      )
      var loaded = page.posts ?? []
      if loaded.isEmpty {
        for entry in page.entries ?? [] {
          if let post = entry.post { loaded.append(post) }
          else {
            let p: FeedPost = try await environment.api.get("posts/\(entry.postId)")
            loaded.append(p)
          }
        }
      }
      // Prefer API reels that include video; otherwise keep mocks.
      let withVideo = loaded.filter { post in
        (post.mediaUrls ?? []).contains { MediaURL.isVideo($0) }
      }
      if !withVideo.isEmpty {
        posts = withVideo
      }
    } catch {
      errorMessage = error.localizedDescription
      // Keep mock posts on network failure.
    }
  }
}

// MARK: - Page

private struct ReelPageView: View {
  let post: FeedPost
  let isActive: Bool
  let isMuted: Bool
  let isLiked: Bool
  let onToggleMute: () -> Void
  let onToggleLike: () -> Void

  @State private var isPaused = false

  private var videoURL: URL? {
    let raw = (post.mediaUrls ?? []).first { MediaURL.isVideo($0) } ?? post.mediaUrls?.first
    return MediaURL.resolve(raw)
  }

  var body: some View {
    ZStack {
      Color.black

      if let videoURL {
        ReelVideoPlayer(
          url: videoURL,
          isActive: isActive && !isPaused,
          isMuted: isMuted
        )
        .allowsHitTesting(false)
      } else if let cover = post.displayMediaURL, let imageURL = MediaURL.resolve(cover) {
        AsyncImage(url: imageURL) { phase in
          if case .success(let img) = phase {
            img.resizable().scaledToFill()
          } else {
            Color.black
          }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .clipped()
        .allowsHitTesting(false)
      }

      // Tap to pause / play (Instagram-style).
      Color.clear
        .contentShape(Rectangle())
        .onTapGesture { isPaused.toggle() }

      if isPaused {
        Image(systemName: "play.fill")
          .font(.system(size: 56, weight: .semibold))
          .foregroundStyle(.white.opacity(0.85))
          .allowsHitTesting(false)
      }

      // Bottom chrome only — never top-aligned, so adjacent pages cannot bleed.
      VStack(spacing: 0) {
        Spacer(minLength: 0)
        LinearGradient(
          colors: [.clear, .black.opacity(0.65)],
          startPoint: .top,
          endPoint: .bottom
        )
        .frame(height: 200)
        .allowsHitTesting(false)
        .overlay(alignment: .bottom) {
          HStack(alignment: .bottom, spacing: 12) {
            VStack(alignment: .leading, spacing: 8) {
              HStack(spacing: 8) {
                AsyncAvatar(urlString: post.avatar, size: 36)
                Text(post.displayName)
                  .font(.system(size: 15, weight: .semibold))
                  .foregroundStyle(.white)
                Text("Follow")
                  .font(.system(size: 13, weight: .semibold))
                  .foregroundStyle(.black)
                  .padding(.horizontal, 10)
                  .padding(.vertical, 5)
                  .background(Color.white)
                  .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
              }
              if let caption = post.caption, !caption.isEmpty {
                Text(caption)
                  .font(.system(size: 14))
                  .foregroundStyle(.white)
                  .lineLimit(2)
              }
            }
            Spacer(minLength: 8)
            VStack(spacing: 16) {
              reelAction(
                systemName: isLiked ? "heart.fill" : "heart",
                count: (post.likeCount ?? 0) + (isLiked ? 1 : 0),
                tint: isLiked ? AppTheme.likeRed : .white,
                action: onToggleLike
              )
              reelAction(systemName: "bubble.right", count: post.commentCount ?? 0)
              reelAction(systemName: "paperplane", count: nil)
              reelAction(systemName: "ellipsis", count: nil)
              Button(action: onToggleMute) {
                Image(systemName: isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                  .font(.system(size: 16, weight: .semibold))
                  .foregroundStyle(.white)
                  .frame(width: 36, height: 36)
                  .background(Color.white.opacity(0.18))
                  .clipShape(Circle())
              }
              .buttonStyle(.plain)
            }
          }
          .padding(.horizontal, 14)
          .padding(.bottom, 12)
        }
      }
      .padding(.bottom, 56)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .clipped()
    .contentShape(Rectangle())
    .onChange(of: isActive) { _, active in
      if !active { isPaused = false }
    }
  }

  private func reelAction(
    systemName: String,
    count: Int?,
    tint: Color = .white,
    action: (() -> Void)? = nil
  ) -> some View {
    Button {
      action?()
    } label: {
      VStack(spacing: 4) {
        Image(systemName: systemName)
          .font(.system(size: 26, weight: .semibold))
          .foregroundStyle(tint)
        if let count {
          Text(Self.formatCount(count))
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(.white)
        }
      }
      .frame(width: 48)
    }
    .buttonStyle(.plain)
    .disabled(action == nil)
  }

  private static func formatCount(_ value: Int) -> String {
    if value >= 1_000_000 {
      return String(format: "%.1fM", Double(value) / 1_000_000)
    }
    if value >= 1_000 {
      return String(format: "%.1fK", Double(value) / 1_000)
    }
    return "\(value)"
  }
}

// MARK: - Mock data

enum MockReels {
  /// City / map / meditation stills for local demos (Unsplash).
  private static let cityMapCovers = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=1400&fit=crop",
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=1400&fit=crop",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=1400&fit=crop",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=1400&fit=crop",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=1400&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1400&fit=crop",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=1400&fit=crop",
    "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=1400&fit=crop"
  ]

  static let posts: [FeedPost] = [
    FeedPost(
      postId: "mock-reel-1",
      idAlt: nil,
      userId: "alice",
      authorId: "alice",
      caption: "Hey — hope your morning is going well",
      type: "REEL",
      mediaUrls: [cityMapCovers[0]],
      coverUrl: cityMapCovers[0],
      createdAt: nil,
      username: "alice",
      avatar: "https://i.pravatar.cc/150?u=alice",
      likeCount: 12400,
      commentCount: 236,
      saveCount: 152,
      isLiked: false,
      isSaved: false
    ),
    FeedPost(
      postId: "mock-reel-2",
      idAlt: nil,
      userId: "bob",
      authorId: "bob",
      caption: "Hi from downtown — say hello back",
      type: "REEL",
      mediaUrls: [cityMapCovers[1]],
      coverUrl: cityMapCovers[1],
      createdAt: nil,
      username: "bob",
      avatar: "https://i.pravatar.cc/150?u=bob",
      likeCount: 8200,
      commentCount: 98,
      saveCount: 44,
      isLiked: false,
      isSaved: false
    ),
    FeedPost(
      postId: "mock-reel-3",
      idAlt: nil,
      userId: "carol",
      authorId: "carol",
      caption: "Good afternoon — found a quiet corner",
      type: "REEL",
      mediaUrls: [cityMapCovers[2]],
      coverUrl: cityMapCovers[2],
      createdAt: nil,
      username: "carol",
      avatar: "https://i.pravatar.cc/150?u=carol",
      likeCount: 16400,
      commentCount: 412,
      saveCount: 201,
      isLiked: false,
      isSaved: false
    ),
    FeedPost(
      postId: "mock-reel-4",
      idAlt: nil,
      userId: "dave",
      authorId: "dave",
      caption: "Hello friends — glad you're here",
      type: "REEL",
      mediaUrls: [cityMapCovers[3]],
      coverUrl: cityMapCovers[3],
      createdAt: nil,
      username: "dave",
      avatar: "https://i.pravatar.cc/150?u=dave",
      likeCount: 5400,
      commentCount: 61,
      saveCount: 33,
      isLiked: false,
      isSaved: false
    ),
    FeedPost(
      postId: "mock-reel-5",
      idAlt: nil,
      userId: "erin",
      authorId: "erin",
      caption: "Welcome back — maps and coffee weather",
      type: "REEL",
      mediaUrls: [cityMapCovers[4]],
      coverUrl: cityMapCovers[4],
      createdAt: nil,
      username: "erin",
      avatar: "https://i.pravatar.cc/150?u=erin",
      likeCount: 22100,
      commentCount: 870,
      saveCount: 640,
      isLiked: false,
      isSaved: false
    ),
    FeedPost(
      postId: "mock-reel-6",
      idAlt: nil,
      userId: "frank",
      authorId: "frank",
      caption: "Hey — breathe with me for a minute",
      type: "REEL",
      mediaUrls: [cityMapCovers[5]],
      coverUrl: cityMapCovers[5],
      createdAt: nil,
      username: "frank",
      avatar: "https://i.pravatar.cc/150?u=frank",
      likeCount: 9100,
      commentCount: 140,
      saveCount: 88,
      isLiked: false,
      isSaved: false
    ),
    FeedPost(
      postId: "mock-reel-7",
      idAlt: nil,
      userId: "grace",
      authorId: "grace",
      caption: "Hi — soft morning stretch energy",
      type: "REEL",
      mediaUrls: [cityMapCovers[6]],
      coverUrl: cityMapCovers[6],
      createdAt: nil,
      username: "grace",
      avatar: "https://i.pravatar.cc/150?u=grace",
      likeCount: 13200,
      commentCount: 210,
      saveCount: 175,
      isLiked: false,
      isSaved: false
    ),
    FeedPost(
      postId: "mock-reel-8",
      idAlt: nil,
      userId: "heidi",
      authorId: "heidi",
      caption: "Hello — quiet mind, open sky",
      type: "REEL",
      mediaUrls: [cityMapCovers[7]],
      coverUrl: cityMapCovers[7],
      createdAt: nil,
      username: "heidi",
      avatar: "https://i.pravatar.cc/150?u=heidi",
      likeCount: 7600,
      commentCount: 92,
      saveCount: 61,
      isLiked: false,
      isSaved: false
    )
  ]
}
