import SwiftUI
import PhotosUI

struct ProfileView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var session: SessionStore
  @EnvironmentObject private var settings: SettingsStore
  @State private var posts: [FeedPost] = []
  @State private var pickerItem: PhotosPickerItem?
  @State private var errorMessage: String?

  private let columns = [
    GridItem(.flexible(), spacing: 2),
    GridItem(.flexible(), spacing: 2),
    GridItem(.flexible(), spacing: 2)
  ]

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 16) {
        HStack(alignment: .center, spacing: 28) {
          PhotosPicker(selection: $pickerItem, matching: .images) {
            AsyncAvatar(urlString: session.user?.avatar, size: 86)
          }
          .onChange(of: pickerItem) { _, item in
            Task { await uploadAvatar(item) }
          }
          VStack(alignment: .leading, spacing: 4) {
            Text(session.user?.username ?? "")
              .font(.system(size: 22, weight: .bold))
            Text(session.user?.email ?? "")
              .font(.system(size: 13))
              .foregroundStyle(AppTheme.secondaryText)
            if let status = session.user?.status, !status.isEmpty {
              Text(status)
                .font(.system(size: 14))
            }
          }
          Spacer()
        }
        .padding(.horizontal, 16)

        HStack(spacing: 10) {
          NavigationLink {
            SettingsView()
          } label: {
            Text(L10n.t("settings", language: settings.languageCode))
          }
          .buttonStyle(ThemeOutlineButtonStyle(fullWidth: true))

          NavigationLink {
            NotificationsView()
          } label: {
            Image(systemName: "bell")
          }
          .buttonStyle(ThemeOutlineButtonStyle())
        }
        .padding(.horizontal, 16)

        LazyVGrid(columns: columns, spacing: 2) {
          ForEach(posts) { post in
            NavigationLink {
              MediaViewerView(urls: post.mediaUrls ?? [])
            } label: {
              profileTile(post)
            }
            .buttonStyle(.plain)
          }
        }
      }
      .padding(.top, 8)
    }
    .background(AppTheme.pageBackground)
    .navigationTitle(
      session.user?.username ?? L10n.t("profile", language: settings.languageCode)
    )
    .navigationBarTitleDisplayMode(.inline)
    .task { await loadPosts() }
  }

  @ViewBuilder
  private func profileTile(_ post: FeedPost) -> some View {
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
            Image(systemName: "text.alignleft")
              .foregroundStyle(AppTheme.secondaryText)
          }
      }
    }
    .frame(width: side, height: side)
    .clipped()
  }

  private func loadPosts() async {
    guard let userId = session.user?.id else { return }
    do {
      let page: FeedPage = try await environment.api.get(
        "posts/user/\(userId)",
        query: [URLQueryItem(name: "page_size", value: "30")]
      )
      posts = page.posts ?? []
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  private func uploadAvatar(_ item: PhotosPickerItem?) async {
    guard let item, let data = try? await item.loadTransferable(type: Data.self) else { return }
    do {
      let uploaded = try await environment.api.upload(
        path: "media/upload",
        fileData: data,
        fileName: "avatar.jpg",
        mimeType: "image/jpeg"
      )
      struct ProfileBody: Encodable { let avatar: String }
      let envelope: UserEnvelope = try await environment.api.patch(
        "auth/profile",
        body: ProfileBody(avatar: uploaded.url)
      )
      if let token = session.accessToken {
        session.apply(user: envelope.user, token: token, refresh: nil)
      }
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
