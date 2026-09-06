import SwiftUI

struct SearchResponse: Codable {
  let users: [ChatUser]?
  let posts: [FeedPost]?
  let hashtags: [HashtagHit]?
}

struct HashtagHit: Codable, Identifiable {
  var id: String { tag ?? UUID().uuidString }
  let tag: String?
  let postCount: Int?
}

struct ExploreView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var settings: SettingsStore
  @State private var query = ""
  @State private var posts: [FeedPost] = []
  @State private var users: [ChatUser] = []
  @State private var errorMessage: String?

  private let columns = [
    GridItem(.flexible(), spacing: 2),
    GridItem(.flexible(), spacing: 2),
    GridItem(.flexible(), spacing: 2)
  ]

  var body: some View {
    ScrollView {
      VStack(spacing: 0) {
        if !users.isEmpty {
          ForEach(users) { user in
            NavigationLink {
              UserProfileView(userId: user.id)
            } label: {
              HStack(spacing: 12) {
                AsyncAvatar(urlString: user.avatar, size: 44)
                Text(user.username ?? user.email ?? user.id)
                  .font(.system(size: 15, weight: .semibold))
                  .foregroundStyle(AppTheme.primaryText)
                Spacer()
              }
              .padding(.horizontal, 16)
              .padding(.vertical, 8)
            }
          }
          Divider()
        }

        LazyVGrid(columns: columns, spacing: 2) {
          ForEach(posts) { post in
            NavigationLink {
              MediaViewerView(urls: post.mediaUrls ?? [])
            } label: {
              exploreTile(post)
            }
            .buttonStyle(.plain)
          }
        }
      }
    }
    .background(AppTheme.pageBackground)
    .navigationTitle(L10n.t("search", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
    .searchable(
      text: $query,
      prompt: L10n.t("search", language: settings.languageCode)
    )
    .onSubmit(of: .search) {
      Task { await search() }
    }
    .task { await loadExplore() }
  }

  @ViewBuilder
  private func exploreTile(_ post: FeedPost) -> some View {
    let side = (UIScreen.main.bounds.width - 4) / 3
    Group {
      if let url = post.displayMediaURL, let imageURL = MediaURL.resolve(url) {
        AsyncImage(url: imageURL) { phase in
          if case .success(let img) = phase {
            img.resizable().scaledToFill()
          } else {
            Color(hex: 0xEFEFEF)
          }
        }
      } else {
        Color(hex: 0xEFEFEF)
          .overlay {
            Text(post.caption ?? "")
              .font(.system(size: 11))
              .foregroundStyle(AppTheme.secondaryText)
              .lineLimit(3)
              .padding(6)
          }
      }
    }
    .frame(width: side, height: side)
    .clipped()
  }

  private func loadExplore() async {
    do {
      let page: FeedPage = try await environment.api.get(
        "posts/explore",
        query: [URLQueryItem(name: "page_size", value: "30")]
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
      posts = loaded
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  private func search() async {
    guard !query.isEmpty else { return }
    do {
      let result: SearchResponse = try await environment.api.get(
        "search",
        query: [
          URLQueryItem(name: "q", value: query),
          URLQueryItem(name: "type", value: "all")
        ]
      )
      users = result.users ?? []
      if let searched = result.posts { posts = searched }
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
