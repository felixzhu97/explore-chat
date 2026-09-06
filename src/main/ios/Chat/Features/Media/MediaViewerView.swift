import SwiftUI

struct MediaViewerView: View {
  let urls: [String]
  @EnvironmentObject private var settings: SettingsStore
  @State private var index = 0

  var body: some View {
    TabView(selection: $index) {
      ForEach(Array(urls.enumerated()), id: \.offset) { i, raw in
        if let url = MediaURL.resolve(raw) {
          AsyncImage(url: url) { phase in
            switch phase {
            case .success(let img): img.resizable().scaledToFit()
            default: ProgressView()
            }
          }
          .tag(i)
        }
      }
    }
    .tabViewStyle(.page)
    .navigationTitle(L10n.t("media", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
  }
}
