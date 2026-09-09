import Foundation
import Combine

enum CallPhase: Equatable {
  case idle
  case outgoing(callId: String, peerUserId: String)
  case incoming(callId: String, peerUserId: String, callType: String)
  case active(callId: String, peerUserId: String)
}

struct CallCreateBody: Encodable {
  let peerUserId: String
  let type: String
}

struct CallDTO: Codable {
  let id: String?
  let callId: String?
  let participants: [String]?
  var resolvedId: String { id ?? callId ?? "" }
}

@MainActor
final class CallSessionStore: ObservableObject {
  @Published private(set) var phase: CallPhase = .idle
  @Published var errorMessage: String?

  private let api: APIClient
  private let socket: ChatSocketClient
  private let session: SessionStore
  private let webrtc = WebRTCSession()
  private var handlerId: UUID?

  init(api: APIClient, socket: ChatSocketClient, session: SessionStore) {
    self.api = api
    self.socket = socket
    self.session = session
    webrtc.attach(socket: socket)
  }

  func startListening() {
    if handlerId != nil { return }
    handlerId = socket.onEvent { [weak self] name, data in
      Task { @MainActor in
        self?.handle(event: name, data: data)
      }
    }
  }

  func startCall(peerUserId: String, type: String = "audio") async {
    guard !peerUserId.isEmpty else { return }
    do {
      let created: CallDTO = try await api.post(
        "calls",
        body: CallCreateBody(peerUserId: peerUserId, type: type)
      )
      let callId = created.resolvedId
      phase = .outgoing(callId: callId, peerUserId: peerUserId)
      socket.emit("call:incoming", [[
        "callId": callId,
        "peerUserId": peerUserId,
        "calleeId": peerUserId,
        "callType": type,
        "initiatorId": session.user?.id as Any
      ]])
      try await webrtc.prepare(callId: callId, peerUserId: peerUserId, asInitiator: true)
    } catch {
      errorMessage = error.localizedDescription
      phase = .idle
    }
  }

  func answer() async {
    guard case .incoming(let callId, let peerUserId, _) = phase else { return }
    do {
      try await api.postEmpty("calls/\(callId):answer")
      socket.emit("call:answer", [["callId": callId]])
      phase = .active(callId: callId, peerUserId: peerUserId)
      try await webrtc.prepare(callId: callId, peerUserId: peerUserId, asInitiator: false)
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func reject() async {
    guard case .incoming(let callId, _, _) = phase else { return }
    try? await api.postEmpty("calls/\(callId):reject")
    socket.emit("call:reject", [["callId": callId]])
    webrtc.stop()
    phase = .idle
  }

  func end() async {
    let callId: String?
    switch phase {
    case .outgoing(let id, _), .incoming(let id, _, _), .active(let id, _):
      callId = id
    case .idle:
      callId = nil
    }
    if let callId {
      try? await api.postEmpty("calls/\(callId):end")
      socket.emit("call:end", [["callId": callId]])
    }
    webrtc.stop()
    phase = .idle
  }

  private func handle(event: String, data: [Any]) {
    let payload = (data.first as? [String: Any]) ?? [:]
    switch event {
    case "call:incoming":
      let callId = payload["callId"] as? String ?? ""
      let peer = payload["initiatorId"] as? String
        ?? payload["peerUserId"] as? String
        ?? ""
      let type = payload["callType"] as? String ?? payload["type"] as? String ?? "audio"
      if peer != session.user?.id {
        phase = .incoming(callId: callId, peerUserId: peer, callType: type)
      }
    case "call:answer":
      if case .outgoing(let callId, let peer) = phase {
        phase = .active(callId: callId, peerUserId: peer)
      }
    case "call:reject", "call:end":
      webrtc.stop()
      phase = .idle
    case "call:offer":
      if let offer = payload["offer"] as? [String: Any],
         let callId = payload["callId"] as? String {
        let peer = payload["peerUserId"] as? String ?? payload["initiatorId"] as? String ?? ""
        webrtc.handleRemoteOffer(offer, callId: callId, from: peer)
      }
    case "call:webrtc-answer":
      if let answer = payload["answer"] as? [String: Any] {
        webrtc.handleRemoteAnswer(answer)
      }
    case "call:ice-candidate":
      if let candidate = payload["candidate"] as? [String: Any] {
        webrtc.handleIceCandidate(candidate)
      }
    default:
      break
    }
  }
}
