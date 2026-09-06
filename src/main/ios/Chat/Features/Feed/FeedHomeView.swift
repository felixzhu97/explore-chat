import SwiftUI

@MainActor
final class FeedViewModel: ObservableObject {
  @Published var posts: [FeedPost] = []
  @Published var stories: [UserStatusItem] = []
  @Published var errorMessage: String?
  @Published var isLoading = false
  private let api: APIClient

  init(api: APIClient) { self.api = api }

  func load() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      async let feedReq: FeedPage = api.get(
        "posts/feed",
        query: [URLQueryItem(name: "page_size", value: "20")]
      )
      async let statusReq: StatusPage = api.get("status")
      let page = try await feedReq
      var loaded: [FeedPost] = []
      if let entries = page.entries, !entries.isEmpty {
        for entry in entries {
          if let post = entry.post, !post.id.isEmpty {
            loaded.append(post)
          } else {
            let p: FeedPost = try await api.get("posts/\(entry.postId)")
            loaded.append(p)
          }
        }
      } else {
        loaded = (page.posts ?? []).filter { !$0.id.isEmpty }
      }
      posts = loaded
      let statusPage = try await statusReq
      stories = statusPage.statuses ?? []
    } catch is CancellationError {
      // Pull-to-refresh / view teardown — not a user-facing error.
    } catch let url as URLError where url.code == .cancelled {
      // Same: SwiftUI cancels in-flight loads; ignore.
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func toggleLike(_ post: FeedPost) async {
    guard let id = post.postId ?? post.idAlt, !id.isEmpty else { return }
    do {
      let liked = post.isLiked == true
      let path = liked ? "posts/\(id):unlike" : "posts/\(id):like"
      let result: EngagementResult = try await api.post(path, body: EmptyJSON())
      if let idx = posts.firstIndex(where: { $0.id == post.id }) {
        posts[idx].isLiked = result.isLiked ?? !liked
        posts[idx].likeCount = result.likeCount ?? posts[idx].likeCount
      }
    } catch is CancellationError {
    } catch let url as URLError where url.code == .cancelled {
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func toggleSave(_ post: FeedPost) async {
    guard let id = post.postId ?? post.idAlt, !id.isEmpty else { return }
    do {
      let saved = post.isSaved == true
      let path = saved ? "posts/\(id):unsave" : "posts/\(id):save"
      let result: EngagementResult = try await api.post(path, body: EmptyJSON())
      if let idx = posts.firstIndex(where: { $0.id == post.id }) {
        posts[idx].isSaved = result.isSaved ?? !saved
        posts[idx].saveCount = result.saveCount ?? posts[idx].saveCount
      }
    } catch is CancellationError {
    } catch let url as URLError where url.code == .cancelled {
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}

struct FeedHomeView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @State private var model: FeedViewModel?

  var body: some View {
    Group {
      if let model {
        FeedHomeBody(model: model)
      } else {
        ProgressView()
          .task { model = FeedViewModel(api: environment.api) }
      }
    }
  }
}

struct FeedHomeBody: View {
  @ObservedObject var model: FeedViewModel
  @EnvironmentObject private var settings: SettingsStore
  @State private var showCreate = false
  @State private var commentsPostId: String?
  @State private var sharePostId: String?
  @State private var profileUserId: String?
  @State private var mediaURLs: [String] = []
  @State private var showMedia = false

  var body: some View {
    feedScroll
      .background(AppTheme.pageBackground)
      .navigationTitle(L10n.t("feed", language: settings.languageCode))
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItemGroup(placement: .topBarTrailing) {
          NavigationLink { NotificationsView() } label: {
            Image(systemName: "heart")
          }
          NavigationLink { ChatListView() } label: {
            Image(systemName: "paperplane")
          }
          Button { showCreate = true } label: {
            Image(systemName: "square.and.pencil")
          }
        }
      }
      .modifier(FeedSheetsModifier(
        showCreate: $showCreate,
        commentsPostId: $commentsPostId,
        sharePostId: $sharePostId,
        profileUserId: $profileUserId,
        mediaURLs: $mediaURLs,
        showMedia: $showMedia
      ))
      .task { await model.load() }
      .refreshable { await model.load() }
      .overlay {
        if model.isLoading && model.posts.isEmpty {
          ProgressView()
        }
      }
  }

  private var feedScroll: some View {
    ScrollView {
      LazyVStack(alignment: .leading, spacing: 0) {
        storiesRow
        if let errorMessage = model.errorMessage {
          Text(errorMessage)
            .foregroundStyle(AppTheme.likeRed)
            .padding()
        }
        ForEach(model.posts) { post in
          postCard(post)
        }
      }
    }
  }

  private func postCard(_ post: FeedPost) -> some View {
    FeedPostCardView(
      post: post,
      onLike: { Task { await model.toggleLike(post) } },
      onSave: { Task { await model.toggleSave(post) } },
      onComment: { commentsPostId = post.postId ?? post.id },
      onShare: { sharePostId = post.postId ?? post.id },
      onOpenMedia: { openMedia(for: post) },
      onOpenUser: { openUser(for: post) }
    )
  }

  private func openMedia(for post: FeedPost) {
    var urls = post.mediaUrls ?? []
    if urls.isEmpty, let cover = post.coverUrl { urls = [cover] }
    mediaURLs = urls
    if !urls.isEmpty { showMedia = true }
  }

  private func openUser(for post: FeedPost) {
    if let userId = post.authorKey, !userId.isEmpty {
      profileUserId = userId
    }
  }

  @ViewBuilder
  private var storiesRow: some View {
    if !model.stories.isEmpty {
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 8) {
          ForEach(model.stories) { story in
            NavigationLink {
              StoryViewerView(status: story)
            } label: {
              StoryRingAvatar(
                urlString: story.avatar,
                name: story.displayName
              )
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 8)
      }
      Divider().opacity(0.35)
    }
  }
}

private struct Identified: Identifiable, Hashable {
  let id: String
}

private struct FeedSheetsModifier: ViewModifier {
  @Binding var showCreate: Bool
  @Binding var commentsPostId: String?
  @Binding var sharePostId: String?
  @Binding var profileUserId: String?
  @Binding var mediaURLs: [String]
  @Binding var showMedia: Bool

  func body(content: Content) -> some View {
    content
      .sheet(isPresented: $showCreate) {
        NavigationStack { CreatePostView() }
      }
      .sheet(item: commentsBinding) { item in
        NavigationStack { PostCommentsView(postId: item.id) }
      }
      .sheet(item: shareBinding) { item in
        NavigationStack { SharePostView(postId: item.id) }
      }
      .navigationDestination(item: profileBinding) { item in
        UserProfileView(userId: item.id)
      }
      .sheet(isPresented: $showMedia) {
        NavigationStack { MediaViewerView(urls: mediaURLs) }
      }
  }

  private var commentsBinding: Binding<Identified?> {
    Binding(
      get: { commentsPostId.map(Identified.init) },
      set: { commentsPostId = $0?.id }
    )
  }

  private var shareBinding: Binding<Identified?> {
    Binding(
      get: { sharePostId.map(Identified.init) },
      set: { sharePostId = $0?.id }
    )
  }

  private var profileBinding: Binding<Identified?> {
    Binding(
      get: { profileUserId.map(Identified.init) },
      set: { profileUserId = $0?.id }
    )
  }
}
