import SwiftUI

struct LoginView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var session: SessionStore
  @EnvironmentObject private var settings: SettingsStore
  @State private var email = "alice@example.com"
  @State private var password = "123456"
  @State private var errorMessage: String?
  @State private var isLoading = false

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
          }
          PrimaryPillButton(
            title: L10n.t("login", language: settings.languageCode),
            isLoading: isLoading
          ) {
            Task { await login() }
          }
          .padding(.top, 2)
          Button("Forgot password?") {}
            .font(.system(size: 13))
            .foregroundStyle(Color(hex: 0x262626))
            .padding(.top, 4)
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
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
      }
    }
    .toolbar(.hidden, for: .navigationBar)
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
}
