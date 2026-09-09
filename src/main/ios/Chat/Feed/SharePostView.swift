import SwiftUI

struct SharePostView: View {
  let postId: String
  @EnvironmentObject private var settings: SettingsStore

  var body: some View {
    VStack(spacing: 12) {
      Text(L10n.t("share", language: settings.languageCode))
        .font(.headline)
      Text(postId)
        .textSelection(.enabled)
        .font(.footnote)
        .foregroundStyle(.secondary)
      ShareLink(item: "explore://post/\(postId)") {
        Label(L10n.t("share", language: settings.languageCode), systemImage: "square.and.arrow.up")
      }
      .buttonStyle(ThemeFilledButtonStyle())
    }
    .padding()
    .navigationTitle(L10n.t("share", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
  }
}
