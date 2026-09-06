import SwiftUI

struct InboxView: View {
  @EnvironmentObject private var settings: SettingsStore

  var body: some View {
    ChatListView()
      .navigationTitle(L10n.t("inbox", language: settings.languageCode))
      .navigationBarTitleDisplayMode(.inline)
  }
}
