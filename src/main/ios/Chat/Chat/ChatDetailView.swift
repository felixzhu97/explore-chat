import SwiftUI

struct ChatDetailView: View {
  let chatId: String
  let title: String
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var session: SessionStore
  @EnvironmentObject private var callSession: CallSessionStore
  @State private var messages: [MessageDTO] = []
  @State private var draft = ""
  @State private var handlerId: UUID?
  @State private var errorMessage: String?

  var body: some View {
    VStack(spacing: 0) {
      ScrollViewReader { proxy in
        ScrollView {
          LazyVStack(alignment: .leading, spacing: 8) {
            ForEach(messages) { message in
              MessageBubble(
                text: message.content ?? "",
                isMine: message.senderId == session.user?.id
              )
              .id(message.id)
            }
          }
          .padding(.horizontal, 12)
          .padding(.vertical, 10)
        }
        .background(AppTheme.pageBackground)
        .onChange(of: messages.count) { _, _ in
          if let last = messages.last { proxy.scrollTo(last.id, anchor: .bottom) }
        }
      }
      Divider()
      HStack(spacing: 10) {
        TextField("Message…", text: $draft)
          .padding(.horizontal, 14)
          .frame(height: 36)
          .background(AppTheme.groupedBackground)
          .clipShape(Capsule())
        Button {
          Task { await send() }
        } label: {
          Image(systemName: "paperplane.fill")
            .foregroundStyle(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? AppTheme.secondaryText : AppTheme.brandInk)
        }
        .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        Button {
          Task { await callSession.startCall(peerUserId: peerHint(), type: "audio") }
        } label: {
          Image(systemName: "phone")
            .foregroundStyle(AppTheme.primaryText)
        }
      }
      .padding(.horizontal, 12)
      .padding(.vertical, 8)
      .background(AppTheme.pageBackground)
    }
    .navigationTitle(title)
    .navigationBarTitleDisplayMode(.inline)
    .task {
      environment.socket.joinChat(chatId)
      handlerId = environment.socket.onEvent { name, data in
        guard name == "message:received" else { return }
        if let dict = data.first as? [String: Any],
           let id = dict["id"] as? String,
           let content = dict["content"] as? String {
          let msg = MessageDTO(
            id: id,
            chatId: dict["chatId"] as? String,
            senderId: dict["senderId"] as? String,
            type: dict["type"] as? String,
            content: content,
            createdAt: dict["createdAt"] as? String,
            clientMsgId: dict["clientMsgId"] as? String
          )
          if !messages.contains(where: { $0.id == msg.id }) {
            messages.append(msg)
          }
        }
      }
      await load()
    }
    .onDisappear {
      environment.socket.leaveChat(chatId)
      if let handlerId { environment.socket.removeHandler(handlerId) }
    }
  }

  private func peerHint() -> String {
    messages.first(where: { $0.senderId != session.user?.id })?.senderId ?? ""
  }

  private func load() async {
    do {
      let page: MessagePage = try await environment.api.get(
        "chats/\(chatId)/messages",
        query: [URLQueryItem(name: "page_size", value: "50")]
      )
      messages = page.messages ?? []
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  private func send() async {
    let content = draft
    draft = ""
    let clientId = UUID().uuidString
    do {
      let created: MessageDTO = try await environment.api.post(
        "chats/\(chatId)/messages",
        body: SendMessageBody(content: content, type: "TEXT", clientMsgId: clientId)
      )
      messages.append(created)
      environment.socket.sendMessage(chatId: chatId, content: content, clientMsgId: clientId)
    } catch {
      errorMessage = error.localizedDescription
      draft = content
    }
  }
}

struct MessageBubble: View {
  let text: String
  let isMine: Bool

  var body: some View {
    HStack {
      if isMine { Spacer(minLength: 48) }
      Text(text)
        .font(.system(size: 15))
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(isMine ? Color(hex: 0xEFEFEF) : AppTheme.pageBackground)
        .overlay(
          RoundedRectangle(cornerRadius: 18, style: .continuous)
            .stroke(isMine ? Color.clear : AppTheme.border.opacity(0.7), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
      if !isMine { Spacer(minLength: 48) }
    }
  }
}
