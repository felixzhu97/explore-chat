import Foundation
import AVFoundation

/// Signaling-backed WebRTC session.
/// Exchanges SDP/ICE over Socket.IO (`call:offer`, `call:webrtc-answer`, `call:ice-candidate`)
/// and manages local capture permission / preview lifecycle.
@MainActor
final class WebRTCSession: ObservableObject {
  @Published private(set) var isCapturing = false
  @Published private(set) var localPreviewRunning = false

  private weak var socket: ChatSocketClient?
  private var callId: String?
  private var peerUserId: String?
  private var pendingOffer: [String: Any]?
  private var pendingAnswer: [String: Any]?
  private var pendingCandidates: [[String: Any]] = []

  func attach(socket: ChatSocketClient) {
    self.socket = socket
  }

  func prepare(callId: String, peerUserId: String, asInitiator: Bool) async throws {
    self.callId = callId
    self.peerUserId = peerUserId
    let session = AVCaptureDevice.authorizationStatus(for: .audio)
    if session != .authorized {
      let granted = await AVCaptureDevice.requestAccess(for: .audio)
      if !granted { throw APIError.unknown("Microphone permission denied") }
    }
    isCapturing = true
    localPreviewRunning = true
    if asInitiator {
      // Emit a placeholder SDP offer; a full RTCPeerConnection can replace this payload.
      let offer: [String: Any] = [
        "type": "offer",
        "sdp": "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n"
      ]
      socket?.emit("call:offer", [[
        "callId": callId,
        "targetUserId": peerUserId,
        "peerUserId": peerUserId,
        "offer": offer
      ]])
    }
  }

  func handleRemoteOffer(_ offer: [String: Any], callId: String, from peerUserId: String) {
    pendingOffer = offer
    self.callId = callId
    self.peerUserId = peerUserId
    let answer: [String: Any] = [
      "type": "answer",
      "sdp": "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n"
    ]
    socket?.emit("call:webrtc-answer", [[
      "callId": callId,
      "targetUserId": peerUserId,
      "peerUserId": peerUserId,
      "answer": answer
    ]])
  }

  func handleRemoteAnswer(_ answer: [String: Any]) {
    pendingAnswer = answer
  }

  func handleIceCandidate(_ candidate: [String: Any]) {
    pendingCandidates.append(candidate)
    guard let callId, let peerUserId else { return }
    socket?.emit("call:ice-candidate", [[
      "callId": callId,
      "targetUserId": peerUserId,
      "peerUserId": peerUserId,
      "candidate": candidate
    ]])
  }

  func stop() {
    isCapturing = false
    localPreviewRunning = false
    callId = nil
    peerUserId = nil
    pendingOffer = nil
    pendingAnswer = nil
    pendingCandidates.removeAll()
  }
}
