import SwiftUI

struct SettingsView: View {
  @EnvironmentObject private var session: SessionStore
  @EnvironmentObject private var settings: SettingsStore

  var body: some View {
    Form {
      Section("Appearance") {
        Picker("Theme", selection: Binding(
          get: {
            if settings.useDarkMode == true { return 1 }
            if settings.useDarkMode == false { return 0 }
            return 2
          },
          set: { value in
            switch value {
            case 0: settings.useDarkMode = false
            case 1: settings.useDarkMode = true
            default: settings.useDarkMode = nil
            }
          }
        )) {
          Text("Light").tag(0)
          Text("Dark").tag(1)
          Text("System").tag(2)
        }
      }
      Section("Language") {
        Picker("Language", selection: $settings.languageCode) {
          Text("English").tag("en")
          Text("中文").tag("zh-Hans")
        }
      }
      Section {
        Button(L10n.t("logout", language: settings.languageCode), role: .destructive) {
          Task { await session.logout() }
        }
      }
    }
    .navigationTitle(L10n.t("settings", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
  }
}
