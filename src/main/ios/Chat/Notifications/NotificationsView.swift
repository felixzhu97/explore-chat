import SwiftUI

struct NotificationPage: Codable {
  let notifications: [ActivityNotification]?
}

struct ActivityNotification: Codable, Identifiable {
  let id: String
  let type: String?
  let message: String?
  let createdAt: String?
  let isRead: Bool?
}

struct NotificationsView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var settings: SettingsStore
  @State private var items: [ActivityNotification] = []
  @State private var errorMessage: String?

  var body: some View {
    List(items) { item in
      VStack(alignment: .leading) {
        Text(item.message ?? item.type ?? "Notification")
        Text(item.createdAt ?? "").font(.caption).foregroundStyle(.secondary)
      }
      .onTapGesture {
        Task { try? await environment.api.postEmpty("notifications/\(item.id):read") }
      }
    }
    .navigationTitle(L10n.t("notifications", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
    .toolbar {
      Button("Read all") {
        Task { try? await environment.api.postEmpty("notifications/read:all") }
      }
    }
    .task { await load() }
  }

  private func load() async {
    do {
      let page: NotificationPage = try await environment.api.get("notifications")
      items = page.notifications ?? []
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
