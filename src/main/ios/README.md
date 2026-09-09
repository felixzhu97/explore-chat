# Chat iOS (SwiftUI)

Native Chat client with password login and **in-app** Explore IAM Sign in
(Authorization Code + PKCE via `ASWebAuthenticationSession`).

The IAM button opens a **system auth sheet** over the app (Google / Apple OAuth
style), not an external Safari hand-off.

## Requirements

- Xcode 16+ / [XcodeGen](https://github.com/yonaskolb/XcodeGen)
- iOS 17+
- Explore IAM (`http://localhost:9100`) and Chat API (`http://localhost:9001`)
  with `CHAT_IAM_ENABLED=true`

## Open

```bash
cd src/main/ios
xcodegen generate   # if Chat.xcodeproj is missing
open Chat.xcodeproj
```

## Sign in with IAM (self-test)

1. Start IAM (`:9100`) and Chat (`:9001`).
2. On the login screen, tap **Sign in with IAM** (below the password form,
   after the “or” divider).
3. Complete login in the system sheet:
   - client: `explore-chat-ios`
   - redirect: `com.explore.chat://oauth/callback`
   - demo: `demo` / `demo-password`
4. The app exchanges the code with PKCE, stores the IAM access token, and
   loads `/api/v1/auth/me`.
5. Cancel the sheet — stay on login with no error toast.
6. Password login (`alice@example.com` / `123456`) still works independently.

## URL scheme

`CFBundleURLTypes` registers `com.explore.chat` in [`project.yml`](project.yml).
Regenerate the Xcode project after changing URL types.
