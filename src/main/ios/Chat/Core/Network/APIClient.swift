import Foundation

@MainActor
final class APIClient {
  private let config: AppConfig
  private weak var session: SessionStore?
  private let urlSession: URLSession
  private let decoder: JSONDecoder
  private let encoder: JSONEncoder

  init(config: AppConfig, session: SessionStore, urlSession: URLSession = .shared) {
    self.config = config
    self.session = session
    self.urlSession = urlSession
    // Java API uses camelCase JSON (Jackson default). Do not use
    // convertFromSnakeCase — it interacts poorly with explicit CodingKeys
    // (e.g. FeedPost.idAlt = "id") and can drop sibling fields like username.
    self.decoder = JSONDecoder()
    self.encoder = JSONEncoder()
    self.encoder.keyEncodingStrategy = .convertToSnakeCase
  }

  func get<T: Decodable>(_ path: String, query: [URLQueryItem] = []) async throws -> T {
    try await request(method: "GET", path: path, query: query)
  }

  func post<Body: Encodable, T: Decodable>(_ path: String, body: Body) async throws -> T {
    try await request(method: "POST", path: path, body: body)
  }

  func postEmpty(_ path: String, body: (any Encodable)? = nil) async throws {
    let _: EmptyJSON = try await request(method: "POST", path: path, body: body)
  }

  func patch<Body: Encodable, T: Decodable>(_ path: String, body: Body) async throws -> T {
    try await request(method: "PATCH", path: path, body: body)
  }

  func delete(_ path: String) async throws {
    let _: EmptyJSON = try await request(method: "DELETE", path: path)
  }

  func upload(path: String, fileData: Data, fileName: String, mimeType: String) async throws -> MediaUploadResponse {
    var components = URLComponents(url: config.apiV1.appendingPathComponent(path), resolvingAgainstBaseURL: false)!
    var request = URLRequest(url: components.url!)
    request.httpMethod = "POST"
    if let token = session?.accessToken {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }
    let boundary = "Boundary-\(UUID().uuidString)"
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    var data = Data()
    data.append("--\(boundary)\r\n".data(using: .utf8)!)
    data.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(fileName)\"\r\n".data(using: .utf8)!)
    data.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
    data.append(fileData)
    data.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
    request.httpBody = data
    let (responseData, response) = try await urlSession.data(for: request)
    try validate(response: response, data: responseData)
    return try decoder.decode(MediaUploadResponse.self, from: responseData)
  }

  private func request<T: Decodable>(
    method: String,
    path: String,
    query: [URLQueryItem] = [],
    body: (any Encodable)? = nil
  ) async throws -> T {
    let trimmed = path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    var url = config.apiV1.appendingPathComponent(trimmed)
    // appendingPathComponent percent-encodes ":" — restore AIP verbs like :like
    if trimmed.contains(":"), let decoded = URL(string: url.absoluteString.replacingOccurrences(of: "%3A", with: ":")) {
      url = decoded
    }
    if !query.isEmpty, var components = URLComponents(url: url, resolvingAgainstBaseURL: false) {
      components.queryItems = query
      if let withQuery = components.url { url = withQuery }
    }
    var request = URLRequest(url: url)
    request.httpMethod = method
    request.setValue("application/json", forHTTPHeaderField: "Accept")
    if let token = session?.accessToken {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }
    if let body {
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = try encoder.encode(AnyEncodable(body))
    }
    let (data, response) = try await urlSession.data(for: request)
    try validate(response: response, data: data)
    if T.self == EmptyJSON.self || data.isEmpty {
      if let empty = EmptyJSON() as? T { return empty }
      if data.isEmpty {
        return try decoder.decode(T.self, from: Data("{}".utf8))
      }
    }
    do {
      return try decoder.decode(T.self, from: data)
    } catch {
      throw APIError.decoding(error.localizedDescription)
    }
  }

  private func validate(response: URLResponse, data: Data) throws {
    guard let http = response as? HTTPURLResponse else {
      throw APIError.unknown("Invalid response")
    }
    if http.statusCode == 401 {
      Task { @MainActor in session?.clear() }
      throw APIError.unauthorized
    }
    guard (200..<300).contains(http.statusCode) else {
      if let rpc = try? decoder.decode(RpcStatus.self, from: data) {
        throw APIError.rpc(rpc)
      }
      let text = String(data: data, encoding: .utf8) ?? ""
      throw APIError.http(http.statusCode, text)
    }
  }
}

struct EmptyJSON: Codable {}

struct AnyEncodable: Encodable {
  private let encodeFunc: (Encoder) throws -> Void
  init(_ value: any Encodable) {
    encodeFunc = value.encode
  }
  func encode(to encoder: Encoder) throws { try encodeFunc(encoder) }
}

struct MediaUploadResponse: Codable, Equatable {
  let id: String?
  let url: String
  let key: String?
  let mimeType: String?
  let size: Int?
}
