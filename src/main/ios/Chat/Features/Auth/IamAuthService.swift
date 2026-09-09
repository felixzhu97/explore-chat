import Foundation
import AuthenticationServices
import CryptoKit
import UIKit

/// Authorization Code + PKCE against Explore IAM for the Chat public client.
@MainActor
final class IamAuthService: NSObject {
  struct Tokens: Sendable {
    let accessToken: String
    let refreshToken: String?
    let idToken: String?
  }

  enum AuthError: LocalizedError {
    case missingCode
    case tokenExchangeFailed(String)
    case cancelled

    var errorDescription: String? {
      switch self {
      case .missingCode: return "IAM login did not return an authorization code."
      case .tokenExchangeFailed(let detail): return detail
      case .cancelled: return "Sign in was cancelled."
      }
    }
  }

  private let config: AppConfig
  private var session: ASWebAuthenticationSession?

  init(config: AppConfig) {
    self.config = config
  }

  func signIn() async throws -> Tokens {
    let verifier = Self.randomVerifier()
    let challenge = Self.challenge(for: verifier)
    let state = Self.randomVerifier()
    var components = URLComponents(url: config.iamIssuerURL.appendingPathComponent("oauth2/authorize"), resolvingAgainstBaseURL: false)!
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

    let callback = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<URL, Error>) in
      let session = ASWebAuthenticationSession(
        url: authorizeURL,
        callbackURLScheme: config.iamCallbackScheme
      ) { url, error in
        if let error {
          let ns = error as NSError
          if ns.domain == ASWebAuthenticationSessionErrorDomain,
             ns.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
            continuation.resume(throwing: AuthError.cancelled)
          } else {
            continuation.resume(throwing: error)
          }
          return
        }
        guard let url else {
          continuation.resume(throwing: AuthError.missingCode)
          return
        }
        continuation.resume(returning: url)
      }
      session.presentationContextProvider = self
      session.prefersEphemeralWebBrowserSession = false
      self.session = session
      if !session.start() {
        continuation.resume(throwing: AuthError.tokenExchangeFailed("Could not start login session"))
      }
    }

    let code = URLComponents(url: callback, resolvingAgainstBaseURL: false)?
      .queryItems?
      .first(where: { $0.name == "code" })?
      .value
    guard let code, !code.isEmpty else { throw AuthError.missingCode }
    return try await exchange(code: code, verifier: verifier)
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

  private static func randomVerifier() -> String {
    var bytes = [UInt8](repeating: 0, count: 32)
    _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
    return Data(bytes).base64URLEncodedString()
  }

  private static func challenge(for verifier: String) -> String {
    let digest = SHA256.hash(data: Data(verifier.utf8))
    return Data(digest).base64URLEncodedString()
  }
}

extension IamAuthService: ASWebAuthenticationPresentationContextProviding {
  func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
      .first { $0.isKeyWindow } ?? ASPresentationAnchor()
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
