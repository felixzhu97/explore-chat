import Foundation
import SwiftUI
import Combine

@MainActor
final class SettingsStore: ObservableObject {
  @Published var languageCode: String {
    didSet { UserDefaults.standard.set(languageCode, forKey: "language") }
  }
  @Published var useDarkMode: Bool? {
    didSet {
      if let useDarkMode {
        UserDefaults.standard.set(useDarkMode, forKey: "dark")
      } else {
        UserDefaults.standard.removeObject(forKey: "dark")
      }
    }
  }

  var colorScheme: ColorScheme? {
    guard let useDarkMode else { return nil }
    return useDarkMode ? .dark : .light
  }

  init() {
    languageCode = UserDefaults.standard.string(forKey: "language") ?? "en"
    if UserDefaults.standard.object(forKey: "dark") == nil {
      useDarkMode = nil
    } else {
      useDarkMode = UserDefaults.standard.bool(forKey: "dark")
    }
  }
}
