import SwiftUI

struct FollowBody: Encodable {}

struct UserProfileView: View {
  let userId: String
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var settings: SettingsStore
  @State private var user: ChatUser?
  @State private var isFollowing = false
  @State private var posts: [FeedPost] = []
  @State private var errorMessage: String?

  var body: some View {
    List {
      if let user {
        Section {
          HStack {
            AsyncAvatar(urlString: user.avatar, size: 64)
            VStack(alignment: .leading) {
              Text(user.username ?? user.id).font(.headline)
              Text(user.status ?? "")
            }
            Spacer()
            Group {
              if isFollowing {
                Button(L10n.t("following", language: settings.languageCode)) {
                  Task { await toggleFollow() }
                }
                .buttonStyle(ThemeOutlineButtonStyle())
              } else {
                Button(L10n.t("follow", language: settings.languageCode)) {
                  Task { await toggleFollow() }
                }
                .buttonStyle(ThemeFilledButtonStyle())
              }
            }
          }
        }
      }
      Section("Posts") {
        ForEach(posts) { post in
          Text(post.caption ?? post.id)
        }
      }
    }
    .navigationTitle(L10n.t("profile", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
    .task { await load() }
  }

  private func load() async {
    do {
      user = try await environment.api.get("users/\(userId)")
      let page: FeedPage = try await environment.api.get(
        "posts/user/\(userId)",
        query: [URLQueryItem(name: "page_size", value: "20")]
      )
      posts = page.posts ?? []
      struct CheckBody: Encodable { let userIds: [String] }
      struct CheckResult: Codable { let results: [Item]?; struct Item: Codable { let userId: String; let isFollowing: Bool } }
      let check: CheckResult = try await environment.api.post(
        "users/following:check",
        body: CheckBody(userIds: [userId])
      )
      isFollowing = check.results?.first?.isFollowing ?? false
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  private func toggleFollow() async {
    do {
      if isFollowing {
        try await environment.api.postEmpty("users/\(userId):unfollow")
        isFollowing = false
      } else {
        try await environment.api.postEmpty("users/\(userId):follow", body: FollowBody())
        isFollowing = true
      }
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
