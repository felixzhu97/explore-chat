import SwiftUI

struct MainTabView: View {
  @EnvironmentObject private var settings: SettingsStore
  @State private var selection: PrimaryDestination = .feed

  private var lang: String { settings.languageCode }

  var body: some View {
    TabView(selection: $selection) {
      NavigationStack { FeedHomeView() }
        .tabItem {
          Image(systemName: selection == .feed ? "house.fill" : "house")
        }
        .accessibilityLabel(L10n.t("feed", language: lang))
        .tag(PrimaryDestination.feed)

      NavigationStack { ReelsView() }
        .tabItem {
          Image(systemName: selection == .reels ? "play.square.fill" : "play.square")
        }
        .accessibilityLabel(L10n.t("reels", language: lang))
        .tag(PrimaryDestination.reels)

      NavigationStack { ChatListView() }
        .tabItem {
          Image(systemName: selection == .chat ? "message.fill" : "message")
        }
        .accessibilityLabel(L10n.t("chats", language: lang))
        .tag(PrimaryDestination.chat)

      NavigationStack { ExploreView() }
        .tabItem {
          Image(systemName: "magnifyingglass")
        }
        .accessibilityLabel(L10n.t("search", language: lang))
        .tag(PrimaryDestination.explore)

      NavigationStack { ProfileView() }
        .tabItem {
          Image(systemName: selection == .user ? "person.circle.fill" : "person.circle")
        }
        .accessibilityLabel(L10n.t("profile", language: lang))
        .tag(PrimaryDestination.user)
    }
    .tint(AppTheme.brandInk)
  }
}

enum PrimaryDestination: Hashable {
  case feed, reels, chat, explore, user
}
