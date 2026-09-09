import SwiftUI

struct CallOverlayView: View {
  @EnvironmentObject private var callSession: CallSessionStore
  @EnvironmentObject private var settings: SettingsStore

  var body: some View {
    switch callSession.phase {
    case .idle:
      EmptyView()
    case .incoming(_, let peer, let type):
      incoming(peer: peer, type: type)
    case .outgoing(_, let peer):
      activeChrome(title: "Calling \(peer)…", showAnswer: false)
    case .active(_, let peer):
      activeChrome(title: "In call with \(peer)", showAnswer: false)
    }
  }

  private func incoming(peer: String, type: String) -> some View {
    VStack {
      Spacer()
      VStack(spacing: 16) {
        Text("Incoming \(type) call")
          .font(.headline)
        Text(peer)
        HStack(spacing: 24) {
          Button(L10n.t("reject", language: settings.languageCode)) {
            Task { await callSession.reject() }
          }
          .buttonStyle(ThemeOutlineButtonStyle())
          Button(L10n.t("answer", language: settings.languageCode)) {
            Task { await callSession.answer() }
          }
          .buttonStyle(ThemeFilledButtonStyle())
        }
      }
      .padding(24)
      .frame(maxWidth: .infinity)
      .background(.ultraThinMaterial)
    }
    .ignoresSafeArea()
  }

  private func activeChrome(title: String, showAnswer: Bool) -> some View {
    VStack {
      Spacer()
      VStack(spacing: 12) {
        Text(title).font(.headline)
        Button(L10n.t("end_call", language: settings.languageCode)) {
          Task { await callSession.end() }
        }
        .buttonStyle(ThemeFilledButtonStyle())
      }
      .padding(24)
      .frame(maxWidth: .infinity)
      .background(.ultraThinMaterial)
    }
    .ignoresSafeArea()
  }
}
