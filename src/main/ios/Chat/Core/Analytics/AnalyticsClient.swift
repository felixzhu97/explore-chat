import Foundation

struct AnalyticsEventBody: Encodable {
  let name: String
  let payload: [String: String]?
}

@MainActor
final class AnalyticsClient {
  private let api: APIClient

  init(api: APIClient) {
    self.api = api
  }

  func track(_ name: String, payload: [String: String]? = nil) {
    Task {
      try? await api.postEmpty("analytics/events", body: AnalyticsEventBody(name: name, payload: payload))
    }
  }
}
