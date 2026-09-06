import SwiftUI

@main
struct ChatApp: App {
  @StateObject private var environment = AppEnvironment()

  var body: some Scene {
    WindowGroup {
      RootView()
        .environmentObject(environment)
        .environmentObject(environment.session)
        .environmentObject(environment.callSession)
        .environmentObject(environment.settings)
        .preferredColorScheme(environment.settings.colorScheme)
    }
  }
}
