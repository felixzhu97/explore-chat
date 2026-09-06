import Foundation

struct AppConfig: Sendable {
  let apiBaseURL: URL
  let socketURL: URL

  var apiV1: URL { apiBaseURL.appendingPathComponent("api/v1") }

  /// Simulator / local Mac: plain localhost, nothing else.
  static let local = AppConfig(
    apiBaseURL: URL(string: "http://localhost:9001")!,
    socketURL: URL(string: "http://localhost:9002")!
  )

  static func fromBundle() -> AppConfig { .local }
}
