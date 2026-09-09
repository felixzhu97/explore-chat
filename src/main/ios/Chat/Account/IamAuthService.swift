import Foundation
import AuthenticationServices
import CryptoKit
import UIKit

/// In-app Explore IAM Sign in (Authorization Code + PKCE).
///
/// Uses `ASWebAuthenticationSession` — the same system auth sheet pattern as
/// Sign in with Google / Apple OAuth — so login stays attached to the app
/// instead of jumping to external Safari.
///
/// - Important: `prefersEphemeralWebBrowserSession = false` keeps SSO cookies
///   so returning users rarely re-enter credentials.
@MainActor
final class IamAuthService: NSObject {
  struct Tokens: Sendable {
    let accessToken: String
    let refreshToken: String?
    let idToken: String?
  }

  enum AuthError: LocalizedError {
    case missingCode
    case stateMismatch
    case authorizationDenied(String)
    case tokenExchangeFailed(String)
    case cancelled
    case presentationFailed

    var errorDescription: String? {
      switch self {
      case .missingCode:
        return "Sign in did not return an authorization code. Try again."
      case .stateMismatch:
        return "Sign in could not be verified. Try again."
      case .authorizationDenied(let detail):
        return detail.isEmpty ? "Access was denied." : detail
      case .tokenExchangeFailed(let detail):
        return detail.isEmpty ? "Could not finish sign in." : detail
      case .cancelled:
        return "Sign in was cancelled."
      case .presentationFailed:
        return "Could not open the sign-in sheet. Try again."
      }
    }
  }

  private let config: AppConfig
  private var session: ASWebAuthenticationSession?

  init(config: AppConfig) {
    self.config = config
  }

  func signIn() async throws -> Tokens {
    let verifier = Pkce.randomVerifier()
    let challenge = Pkce.challenge(for: verifier)
    let state = Pkce.randomVerifier()
    var components = URLComponents(
      url: config.iamIssuerURL.appendingPathComponent("oauth2/authorize"),
      resolvingAgainstBaseURL: false
    )!
    components.queryItems = [
      URLQueryItem(name: "response_type", value: "code"),
      URLQueryItem(name: "client_id", value: config.iamClientId),
      URLQueryItem(name: "redirect_uri", value: config.iamRedirectURI),
      URLQueryItem(name: "scope", value: "openid profile email"),
      URLQueryItem(name: "code_challenge", value: challenge),
      URLQueryItem(name: "code_challenge_method", value: "S256"),
      URLQueryItem(name: "state", value: state),
    ]
    guard let authorizeURL = components.url else {
      throw AuthError.tokenExchangeFailed("Invalid authorize URL")
    }

    let callback = try await presentAuthorization(url: authorizeURL)
    let items = URLComponents(url: callback, resolvingAgainstBaseURL: false)?.queryItems ?? []
    if let oauthError = items.first(where: { $0.name == "error" })?.value {
      let description = items.first(where: { $0.name == "error_description" })?.value
        ?? oauthError
      throw AuthError.authorizationDenied(description.replacingOccurrences(of: "+", with: " "))
    }
    let returnedState = items.first(where: { $0.name == "state" })?.value
    guard returnedState == state else { throw AuthError.stateMismatch }
    let code = items.first(where: { $0.name == "code" })?.value
    guard let code, !code.isEmpty else { throw AuthError.missingCode }
    return try await exchange(code: code, verifier: verifier)
  }

  private func presentAuthorization(url: URL) async throws -> URL {
    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<URL, Error>) in
      var resumed = false
      let finish: (Result<URL, Error>) -> Void = { result in
        guard !resumed else { return }
        resumed = true
        continuation.resume(with: result)
      }

      let session = ASWebAuthenticationSession(
        url: url,
        callbackURLScheme: config.iamCallbackScheme
      ) { callbackURL, error in
        if let error {
          let ns = error as NSError
          if ns.domain == ASWebAuthenticationSessionErrorDomain,
             ns.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
            finish(.failure(AuthError.cancelled))
          } else {
            finish(.failure(error))
          }
          return
        }
        guard let callbackURL else {
          finish(.failure(AuthError.missingCode))
          return
        }
        finish(.success(callbackURL))
      }
      session.presentationContextProvider = self
      // Shared cookies → Google-like SSO when the user already signed in to IAM.
      session.prefersEphemeralWebBrowserSession = false
      self.session = session
      if !session.start() {
        finish(.failure(AuthError.presentationFailed))
      }
    }
  }

  private func exchange(code: String, verifier: String) async throws -> Tokens {
    var request = URLRequest(url: config.iamIssuerURL.appendingPathComponent("oauth2/token"))
    request.httpMethod = "POST"
    request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
    let body = [
      "grant_type": "authorization_code",
      "code": code,
      "redirect_uri": config.iamRedirectURI,
      "client_id": config.iamClientId,
      "code_verifier": verifier,
    ]
    .map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
    .joined(separator: "&")
    request.httpBody = body.data(using: .utf8)

    let (data, response) = try await URLSession.shared.data(for: request)
    guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
      let detail = String(data: data, encoding: .utf8) ?? "token exchange failed"
      throw AuthError.tokenExchangeFailed(detail)
    }
    let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
    guard let access = json?["access_token"] as? String else {
      throw AuthError.tokenExchangeFailed("access_token missing")
    }
    return Tokens(
      accessToken: access,
      refreshToken: json?["refresh_token"] as? String,
      idToken: json?["id_token"] as? String
    )
  }
}

extension IamAuthService: ASWebAuthenticationPresentationContextProviding {
  func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
    let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
    let foreground = scenes.first { $0.activationState == .foregroundActive } ?? scenes.first
    if let key = foreground?.windows.first(where: \.isKeyWindow) {
      return key
    }
    return foreground?.windows.first ?? ASPresentationAnchor()
  }
}

/// PKCE helpers (S256). Kept local to Chat — no shared SPM with AI.
enum Pkce {
  static func randomVerifier() -> String {
    var bytes = [UInt8](repeating: 0, count: 32)
    _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
    return Data(bytes).base64URLEncodedString()
  }

  static func challenge(for verifier: String) -> String {
    let digest = SHA256.hash(data: Data(verifier.utf8))
    return Data(digest).base64URLEncodedString()
  }
}

private extension Data {
  func base64URLEncodedString() -> String {
    base64EncodedString()
      .replacingOccurrences(of: "+", with: "-")
      .replacingOccurrences(of: "/", with: "_")
      .replacingOccurrences(of: "=", with: "")
  }
}
