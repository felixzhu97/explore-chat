import SwiftUI

struct ChatListView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var settings: SettingsStore
  @State private var chats: [ChatSummary] = []
  @State private var errorMessage: String?

  var body: some View {
    List {
      ForEach(chats) { chat in
        NavigationLink {
          ChatDetailView(chatId: chat.id, title: chat.name ?? L10n.t("chat", language: settings.languageCode))
        } label: {
          HStack(spacing: 12) {
            AsyncAvatar(urlString: chat.avatar, size: 56)
            VStack(alignment: .leading, spacing: 2) {
              Text(chat.name ?? L10n.t("chat", language: settings.languageCode))
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(AppTheme.primaryText)
              Text(chat.lastMessage?.content ?? " ")
                .font(.system(size: 14))
                .foregroundStyle(AppTheme.secondaryText)
                .lineLimit(1)
            }
            Spacer(minLength: 0)
          }
          .padding(.vertical, 4)
        }
        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
        .listRowSeparator(.hidden)
      }
    }
    .listStyle(.plain)
    .background(AppTheme.pageBackground)
    .navigationTitle(L10n.t("chats", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
    .toolbar {
      ToolbarItem(placement: .topBarTrailing) {
        NavigationLink { InboxView() } label: {
          Image(systemName: "square.and.pencil")
        }
      }
    }
    .refreshable { await load() }
    .task { await load() }
  }

  private func load() async {
    do {
      let page: ChatListResponse = try await environment.api.get("chats")
      chats = page.chats ?? []
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
