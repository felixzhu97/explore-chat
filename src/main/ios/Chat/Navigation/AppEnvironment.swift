import Foundation
import Combine

@MainActor
final class AppEnvironment: ObservableObject {
  let config: AppConfig
  let api: APIClient
  let session: SessionStore
  let socket: ChatSocketClient
  let analytics: AnalyticsClient
  let callSession: CallSessionStore
  let settings: SettingsStore

  init(config: AppConfig = .fromBundle()) {
    self.config = config
    let keychain = KeychainStore()
    let session = SessionStore(keychain: keychain)
    let api = APIClient(config: config, session: session)
    session.bind(api: api)
    let socket = ChatSocketClient(config: config, session: session)
    let analytics = AnalyticsClient(api: api)
    let callSession = CallSessionStore(api: api, socket: socket, session: session)
    self.session = session
    self.api = api
    self.socket = socket
    self.analytics = analytics
    self.callSession = callSession
    self.settings = SettingsStore()
  }
}
