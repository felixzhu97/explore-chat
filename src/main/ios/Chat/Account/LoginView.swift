import SwiftUI

struct LoginView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var session: SessionStore
  @EnvironmentObject private var settings: SettingsStore
  @State private var email = "alice@example.com"
  @State private var password = "123456"
  @State private var errorMessage: String?
  @State private var isLoading = false
  @State private var isIamLoading = false

  private var busy: Bool { isLoading || isIamLoading }

  var body: some View {
    ZStack {
      AppTheme.pageBackground.ignoresSafeArea()
      VStack(spacing: 0) {
        Spacer(minLength: 24)
        ChatLogo(size: 72)
          .padding(.bottom, 28)

        VStack(spacing: 10) {
          AuthTextField(placeholder: "Email", text: $email)
          AuthTextField(placeholder: "Password", text: $password, isSecure: true)
          if let errorMessage {
            Text(errorMessage)
              .font(.footnote)
              .foregroundStyle(AppTheme.likeRed)
              .frame(maxWidth: .infinity, alignment: .leading)
              .accessibilityLabel(errorMessage)
          }
          PrimaryPillButton(
            title: L10n.t("login", language: settings.languageCode),
            isLoading: isLoading
          ) {
            Task { await login() }
          }
          .padding(.top, 2)
          .disabled(busy && !isLoading)

          authDivider

          // Google-style secondary provider button: outline + identity mark.
          OutlinePillButton(
            title: "Sign in with IAM",
            isLoading: isIamLoading,
            systemImage: "person.badge.key.fill"
          ) {
            Task { await loginWithIam() }
          }
          .disabled(busy && !isIamLoading)
          .accessibilityHint("Opens an in-app sign-in sheet for Explore IAM")

          Button("Forgot password?") {}
            .font(.system(size: 13))
            .foregroundStyle(Color(hex: 0x262626))
            .padding(.top, 4)
            .disabled(busy)
        }
        .padding(.horizontal, 24)

        Spacer()

        VStack(spacing: 16) {
          NavigationLink {
            RegisterView()
          } label: {
            Text(L10n.t("register", language: settings.languageCode))
              .frame(maxWidth: .infinity)
              .frame(height: 44)
          }
          .buttonStyle(ThemeOutlineButtonStyle(fullWidth: true))
          .disabled(busy)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
      }
    }
    .toolbar(.hidden, for: .navigationBar)
  }

  private var authDivider: some View {
    HStack(spacing: 12) {
      Rectangle()
        .fill(AppTheme.border.opacity(0.8))
        .frame(height: 1)
      Text("or")
        .font(.system(size: 13, weight: .medium))
        .foregroundStyle(AppTheme.secondaryText)
      Rectangle()
        .fill(AppTheme.border.opacity(0.8))
        .frame(height: 1)
    }
    .padding(.vertical, 6)
  }

  private func login() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      let dto: AuthSessionDTO = try await environment.api.post(
        "auth/login",
        body: LoginBody(email: email, password: password)
      )
      session.apply(session: dto)
      environment.analytics.track("auth_login")
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  private func loginWithIam() async {
    isIamLoading = true
    errorMessage = nil
    defer { isIamLoading = false }
    do {
      let iam = IamAuthService(config: environment.config)
      let tokens = try await iam.signIn()
      try await session.applyIam(accessToken: tokens.accessToken, refreshToken: tokens.refreshToken)
      environment.analytics.track("auth_login_iam")
    } catch {
      if case IamAuthService.AuthError.cancelled = error {
        return
      }
      errorMessage = error.localizedDescription
    }
  }
}
