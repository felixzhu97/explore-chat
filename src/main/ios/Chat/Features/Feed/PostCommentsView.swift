import SwiftUI

struct PostCommentsView: View {
  let postId: String
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var settings: SettingsStore
  @State private var comments: [PostComment] = []
  @State private var draft = ""
  @State private var errorMessage: String?

  var body: some View {
    VStack {
      List(comments) { comment in
        HStack(alignment: .top, spacing: 10) {
          AsyncAvatar(urlString: comment.avatar, size: 32)
          VStack(alignment: .leading, spacing: 2) {
            Text(comment.displayName)
              .font(.system(size: 13, weight: .semibold))
            Text(comment.content)
              .font(.system(size: 14))
          }
        }
        .padding(.vertical, 2)
      }
      if let errorMessage {
        Text(errorMessage).font(.footnote).foregroundStyle(AppTheme.likeRed)
      }
      HStack {
        TextField(L10n.t("comments", language: settings.languageCode), text: $draft)
        Button(L10n.t("send", language: settings.languageCode)) { Task { await send() } }
          .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
      }
      .padding()
    }
    .navigationTitle(L10n.t("comments", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
    .task { await load() }
  }

  private func load() async {
    do {
      let page: CommentPage = try await environment.api.get("posts/\(postId)/comments")
      comments = page.comments ?? []
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  private func send() async {
    do {
      let created: PostComment = try await environment.api.post(
        "posts/\(postId)/comments",
        body: CommentBody(content: draft)
      )
      comments.append(created)
      draft = ""
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
