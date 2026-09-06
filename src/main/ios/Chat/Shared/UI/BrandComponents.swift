import SwiftUI

/// App glyph, rendered monochrome.
struct ChatLogo: View {
  var size: CGFloat = 64

  var body: some View {
    Image("InstagramGlyph")
      .renderingMode(.template)
      .resizable()
      .scaledToFit()
      .foregroundStyle(Color.black)
      .frame(width: size, height: size)
      .accessibilityLabel("Chat")
  }
}

/// Home nav wordmark.
struct ExploreWordmark: View {
  var size: CGFloat = 30

  var body: some View {
    Text("Chat")
      .font(.custom("GrandHotel-Regular", size: size))
      .foregroundStyle(Color.black)
      .tracking(0.2)
      .padding(.leading, 2)
      .accessibilityAddTraits(.isHeader)
      .accessibilityLabel("Chat")
  }
}

struct PrimaryPillButton: View {
  let title: String
  var isLoading = false
  var action: () -> Void

  var body: some View {
    Button(action: action) {
      ZStack {
        if isLoading {
          ProgressView()
            .tint(AppTheme.brandPaper)
        } else {
          Text(title)
            .font(.system(size: 16, weight: .semibold))
            .foregroundStyle(AppTheme.brandPaper)
        }
      }
      .frame(maxWidth: .infinity)
      .frame(height: 44)
      .background(AppTheme.brandInk)
      .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
    .buttonStyle(.plain)
    .disabled(isLoading)
  }
}

struct OutlinePillButton: View {
  let title: String
  var action: () -> Void

  var body: some View {
    Button(action: action) {
      Text(title)
        .font(.system(size: 15, weight: .semibold))
        .foregroundStyle(AppTheme.brandInk)
        .frame(maxWidth: .infinity)
        .frame(height: 44)
        .background(AppTheme.brandPaper)
        .overlay(
          RoundedRectangle(cornerRadius: 10, style: .continuous)
            .stroke(AppTheme.brandInk, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
    .buttonStyle(.plain)
  }
}

/// Filled black / white label — use instead of `.borderedProminent`.
struct ThemeFilledButtonStyle: ButtonStyle {
  var fullWidth = false

  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.system(size: 15, weight: .semibold))
      .foregroundStyle(AppTheme.brandPaper)
      .padding(.horizontal, 14)
      .frame(maxWidth: fullWidth ? .infinity : nil)
      .frame(height: 36)
      .background(AppTheme.brandInk.opacity(configuration.isPressed ? 0.75 : 1))
      .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
  }
}

/// Outlined black / white — use instead of `.bordered`.
struct ThemeOutlineButtonStyle: ButtonStyle {
  var fullWidth = false

  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.system(size: 15, weight: .semibold))
      .foregroundStyle(AppTheme.brandInk)
      .padding(.horizontal, 14)
      .frame(maxWidth: fullWidth ? .infinity : nil)
      .frame(height: 36)
      .background(AppTheme.brandPaper.opacity(configuration.isPressed ? 0.7 : 1))
      .overlay(
        RoundedRectangle(cornerRadius: 10, style: .continuous)
          .stroke(AppTheme.brandInk, lineWidth: 1)
      )
      .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
  }
}

struct AuthTextField: View {
  let placeholder: String
  @Binding var text: String
  var isSecure = false

  var body: some View {
    Group {
      if isSecure {
        SecureField(placeholder, text: $text)
      } else {
        TextField(placeholder, text: $text)
          .textInputAutocapitalization(.never)
          .keyboardType(.emailAddress)
          .autocorrectionDisabled()
      }
    }
    .font(.system(size: 16))
    .padding(.horizontal, 18)
    .frame(height: 52)
    .background(Color.white)
    .overlay(
      RoundedRectangle(cornerRadius: 14, style: .continuous)
        .stroke(Color(hex: 0xE5E5E5), lineWidth: 1)
    )
    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
  }
}

struct StoryRingAvatar: View {
  let urlString: String?
  let name: String
  var size: CGFloat = 56

  var body: some View {
    VStack(spacing: 4) {
      ZStack {
        Circle()
          .fill(AppTheme.storyGradient)
          .frame(width: size, height: size)
        AsyncAvatar(urlString: urlString, size: size - 6)
          .overlay(Circle().stroke(AppTheme.pageBackground, lineWidth: 2))
      }
      Text(name)
        .font(.system(size: 11))
        .foregroundStyle(AppTheme.primaryText)
        .lineLimit(1)
        .frame(width: 70)
    }
  }
}
