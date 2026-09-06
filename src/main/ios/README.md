# Chat iOS (SwiftUI)

Native iOS client for Chat. Talks to the Spring API (`:9001`) and Socket.IO (`:9002`).

## Requirements

- Xcode 16+
- iOS 17+ simulator or device
- Running Java API (`./gradlew bootRun` from repo root)

## Generate & open

```bash
cd src/main/ios
xcodegen generate
open Chat.xcworkspace 2>/dev/null || open Chat.xcodeproj
```

## Configure

Defaults: `http://localhost:9001` and `http://localhost:9002`.

Override with env vars when launching tests / schemes:

- `API_BASE_URL`
- `SOCKET_IO_URL`

On a physical device, use your Mac LAN IP instead of `localhost`.

## Test

```bash
cd src/main/ios
xcodegen generate
xcodebuild test -scheme Chat -destination 'platform=iOS Simulator,name=iPhone 16' -quiet
```

## Layout

- `Chat/App` — root navigation
- `Chat/Core` — network, keychain, socket, analytics, RTC signaling
- `Chat/Features/*` — Auth, Feed, Reels, Explore, Chat, Profile, Calls, …
- `docs/API-Contract.md` — frozen REST / Socket contract

See repo Glossary for Preferred Terms. Expo `src/main/mobile` remains the Android / legacy client.
