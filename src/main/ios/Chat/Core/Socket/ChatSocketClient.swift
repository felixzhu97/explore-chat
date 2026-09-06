import Foundation
import SocketIO
import Combine

@MainActor
final class ChatSocketClient: ObservableObject {
  @Published private(set) var isConnected = false

  private let config: AppConfig
  private weak var session: SessionStore?
  private var manager: SocketManager?
  private var socket: SocketIOClient?
  private var handlers: [UUID: (String, [Any]) -> Void] = [:]

  init(config: AppConfig, session: SessionStore) {
    self.config = config
    self.session = session
  }

  func connect() {
    guard let token = session?.accessToken else { return }
    disconnect()
    let manager = SocketManager(
      socketURL: config.socketURL,
      config: [
        .log(false),
        .compress,
        .forceWebsockets(true),
        .connectParams(["token": token]),
        .extraHeaders(["Authorization": "Bearer \(token)"])
      ]
    )
    let socket = manager.defaultSocket
    self.manager = manager
    self.socket = socket
    socket.on(clientEvent: .connect) { [weak self] _, _ in
      Task { @MainActor in self?.isConnected = true }
    }
    socket.on(clientEvent: .disconnect) { [weak self] _, _ in
      Task { @MainActor in self?.isConnected = false }
    }
    for name in [
      "message:received", "message:typing", "message:read", "message:reaction",
      "call:incoming", "call:answer", "call:reject", "call:end",
      "call:ice-candidate", "call:offer", "call:webrtc-answer",
      "status:create", "user:status", "notification:new"
    ] {
      socket.on(name) { [weak self] data, _ in
        Task { @MainActor in
          self?.handlers.values.forEach { $0(name, data) }
        }
      }
    }
    socket.connect()
  }

  func disconnect() {
    socket?.disconnect()
    socket = nil
    manager = nil
    isConnected = false
  }

  @discardableResult
  func onEvent(_ handler: @escaping (String, [Any]) -> Void) -> UUID {
    let id = UUID()
    handlers[id] = handler
    return id
  }

  func removeHandler(_ id: UUID) {
    handlers.removeValue(forKey: id)
  }

  func emit(_ event: String, _ items: [Any] = []) {
    socket?.emit(event, items)
  }

  func joinChat(_ chatId: String) {
    emit("chat:join", [["chatId": chatId]])
  }

  func leaveChat(_ chatId: String) {
    emit("chat:leave", [["chatId": chatId]])
  }

  func sendMessage(chatId: String, content: String, clientMsgId: String = UUID().uuidString) {
    emit("message:send", [[
      "chatId": chatId,
      "content": content,
      "type": "TEXT",
      "clientMsgId": clientMsgId
    ]])
  }
}
