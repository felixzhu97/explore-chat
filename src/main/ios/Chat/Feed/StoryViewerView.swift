import SwiftUI

struct StoryViewerView: View {
  let status: UserStatusItem
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var settings: SettingsStore

  var body: some View {
    VStack(spacing: 16) {
      HStack(spacing: 10) {
        AsyncAvatar(urlString: status.avatar, size: 40)
        Text(status.displayName)
          .font(.system(size: 16, weight: .semibold))
        Spacer()
      }
      .padding(.horizontal)

      if let media = status.mediaUrl, let url = MediaURL.resolve(media) {
        AsyncImage(url: url) { phase in
          if case .success(let img) = phase { img.resizable().scaledToFit() }
          else { ProgressView() }
        }
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .padding(.horizontal)
      }
      Text(status.content ?? "")
        .font(.title2)
        .multilineTextAlignment(.center)
        .padding()
      Spacer()
    }
    .navigationTitle(L10n.t("status", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
    .task {
      try? await environment.api.postEmpty("status/\(status.id):view")
    }
  }
}
