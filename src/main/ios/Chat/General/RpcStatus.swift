import Foundation

struct RpcStatus: Codable, Error, Equatable {
  let code: String
  let message: String
  let details: [RpcDetail]?

  struct RpcDetail: Codable, Equatable {
    let type: String?
    let field: String?
    let description: String?

    enum CodingKeys: String, CodingKey {
      case type = "@type"
      case field
      case description
    }
  }

  var errorDescription: String? { message }
}

enum APIError: LocalizedError, Equatable {
  case rpc(RpcStatus)
  case http(Int, String)
  case decoding(String)
  case unauthorized
  case unknown(String)

  var errorDescription: String? {
    switch self {
    case .rpc(let s): return s.message
    case .http(let c, let m): return "HTTP \(c): \(m)"
    case .decoding(let m): return m
    case .unauthorized: return "Please sign in again"
    case .unknown(let m): return m
    }
  }
}
