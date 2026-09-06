import SwiftUI

enum AppTheme {
  /// Brand / auth chrome — monochrome.
  static let brandInk = Color.black
  static let brandPaper = Color.white
  /// Interactive accent (tabs, primary actions).
  static let primary = Color.black
  static let primaryDark = Color(hex: 0x262626)
  static let brandPink = Color.black
  static let likeRed = Color(hex: 0xFF3B30)
  static let border = Color(hex: 0xDBDBDB)
  static let secondaryText = Color(hex: 0x8E8E93)
  static let primaryText = Color(hex: 0x000000)
  static let pageBackground = Color(hex: 0xFFFFFF)
  static let groupedBackground = Color(hex: 0xF2F2F7)
  static let inputBorder = Color(hex: 0xDBDBDB)
  static let storyGradient = AngularGradient(
    colors: [
      Color(hex: 0xF58529),
      Color(hex: 0xDD2A7B),
      Color(hex: 0x8134AF),
      Color(hex: 0x515BD4),
      Color(hex: 0xF58529)
    ],
    center: .center
  )
}

extension Color {
  init(hex: UInt32, opacity: Double = 1) {
    self.init(
      .sRGB,
      red: Double((hex >> 16) & 0xFF) / 255,
      green: Double((hex >> 8) & 0xFF) / 255,
      blue: Double(hex & 0xFF) / 255,
      opacity: opacity
    )
  }
}

enum DisplayName {
  static func user(_ username: String?, userId: String?) -> String {
    if let username, !username.isEmpty { return username }
    guard let userId, !userId.isEmpty else { return "user" }
    return String(userId.prefix(8))
  }
}
