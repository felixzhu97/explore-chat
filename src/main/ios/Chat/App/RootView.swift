import SwiftUI

struct RootView: View {
  @EnvironmentObject private var session: SessionStore
  @EnvironmentObject private var callSession: CallSessionStore
  @EnvironmentObject private var environment: AppEnvironment

  var body: some View {
    Group {
      if session.isHydrating {
        ProgressView("Loading…")
      } else if session.isAuthenticated {
        MainTabView()
      } else {
        NavigationStack {
          LoginView()
        }
      }
    }
    .task { await session.hydrate() }
    .overlay {
      CallOverlayView()
    }
    .onChange(of: session.isAuthenticated) { _, signedIn in
      if signedIn {
        environment.socket.connect()
        environment.callSession.startListening()
      } else {
        environment.socket.disconnect()
      }
    }
  }
}
