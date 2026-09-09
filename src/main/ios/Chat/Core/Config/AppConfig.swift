import Foundation

struct AppConfig: Sendable {
  let apiBaseURL: URL
  let socketURL: URL
  let iamIssuerURL: URL
  let iamClientId: String
  let iamRedirectURI: String
  let iamCallbackScheme: String

  var apiV1: URL { apiBaseURL.appendingPathComponent("api/v1") }

  /// Simulator / local Mac: plain localhost, nothing else.
  static let local = AppConfig(
    apiBaseURL: URL(string: "http://localhost:9001")!,
    socketURL: URL(string: "http://localhost:9002")!,
    iamIssuerURL: URL(string: "http://localhost:9100")!,
    iamClientId: "explore-chat-ios",
    iamRedirectURI: "com.explore.chat://oauth/callback",
    iamCallbackScheme: "com.explore.chat"
  )

  static func fromBundle() -> AppConfig { .local }
}
