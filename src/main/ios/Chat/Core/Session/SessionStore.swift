import Foundation
import Combine

struct ChatUser: Codable, Equatable, Identifiable, Hashable {
  let id: String
  var username: String?
  var email: String?
  var phone: String?
  var avatar: String?
  var status: String?
  var isOnline: Bool?
}

struct AuthSessionDTO: Codable {
  let user: ChatUser
  let token: String
  let refreshToken: String
}

struct UserEnvelope: Codable {
  let user: ChatUser
}

@MainActor
final class SessionStore: ObservableObject {
  @Published private(set) var user: ChatUser?
  @Published private(set) var accessToken: String?
  @Published private(set) var isHydrating = true

  private let keychain: KeychainStore
  private weak var api: APIClient?
  private let tokenKey = "access_token"
  private let refreshKey = "refresh_token"
  private let userKey = "user_json"

  var isAuthenticated: Bool { accessToken != nil && user != nil }

  init(keychain: KeychainStore) {
    self.keychain = keychain
  }

  func bind(api: APIClient) {
    self.api = api
  }

  func hydrate() async {
    isHydrating = true
    defer { isHydrating = false }
    accessToken = keychain.string(forKey: tokenKey)
    if let raw = keychain.string(forKey: userKey),
       let data = raw.data(using: .utf8),
       let u = try? JSONDecoder().decode(ChatUser.self, from: data) {
      user = u
    }
    guard accessToken != nil, let api else { return }
    do {
      let envelope: UserEnvelope = try await api.get("auth/me")
      apply(user: envelope.user, token: accessToken!, refresh: keychain.string(forKey: refreshKey))
    } catch {
      clear()
    }
  }

  func apply(session: AuthSessionDTO) {
    apply(user: session.user, token: session.token, refresh: session.refreshToken)
  }

  func apply(user: ChatUser, token: String, refresh: String?) {
    self.user = user
    self.accessToken = token
    keychain.set(token, forKey: tokenKey)
    if let refresh { keychain.set(refresh, forKey: refreshKey) }
    if let data = try? JSONEncoder().encode(user), let raw = String(data: data, encoding: .utf8) {
      keychain.set(raw, forKey: userKey)
    }
  }

  func clear() {
    user = nil
    accessToken = nil
    keychain.remove(tokenKey)
    keychain.remove(refreshKey)
    keychain.remove(userKey)
  }

  func logout() async {
    if let api {
      try? await api.postEmpty("auth/logout")
    }
    clear()
  }
}
