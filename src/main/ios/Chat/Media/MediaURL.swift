import Foundation

enum MediaURL {
  static func resolve(_ raw: String?) -> URL? {
    guard let raw, !raw.isEmpty else { return nil }
    return URL(string: raw)
  }

  static func isVideo(_ raw: String?) -> Bool {
    guard let raw else { return false }
    let lower = raw.lowercased()
    return lower.contains(".mp4") || lower.contains(".mov")
  }
}
