import SwiftUI

struct RegisterView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var session: SessionStore
  @EnvironmentObject private var settings: SettingsStore
  @State private var email = ""
  @State private var username = ""
  @State private var password = ""
  @State private var errorMessage: String?
  @State private var isLoading = false

  var body: some View {
    ZStack {
      AppTheme.pageBackground.ignoresSafeArea()
      ScrollView {
        VStack(spacing: 10) {
          ChatLogo(size: 64)
            .padding(.top, 24)
            .padding(.bottom, 16)
          AuthTextField(placeholder: "Email", text: $email)
          AuthTextField(placeholder: "Username", text: $username)
          AuthTextField(placeholder: "Password", text: $password, isSecure: true)
          if let errorMessage {
            Text(errorMessage)
              .font(.footnote)
              .foregroundStyle(AppTheme.likeRed)
              .frame(maxWidth: .infinity, alignment: .leading)
          }
          PrimaryPillButton(
            title: L10n.t("register", language: settings.languageCode),
            isLoading: isLoading
          ) {
            Task { await register() }
          }
          .padding(.top, 8)
        }
        .padding(.horizontal, 24)
      }
    }
    .navigationBarTitleDisplayMode(.inline)
  }

  private func register() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      let dto: AuthSessionDTO = try await environment.api.post(
        "auth/register",
        body: RegisterBody(email: email, password: password, username: username, phone: nil)
      )
      session.apply(session: dto)
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
