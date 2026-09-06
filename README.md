# Chat

`Chat` is a social messaging app you can use to share posts, browse Feed and Reels, message friends, and place calls. It is a pnpm + Turbo monorepo with a **Spring Boot API at the repo root**, Next.js web/admin under `src/main/web` and `src/main/admin`, Expo mobile under `src/main/mobile`, and optional Python side services in sibling [explore-ml](https://github.com/felixzhu97/explore-ml).

Clients talk only to the Spring API over HTTPS and Socket.IO (plus WebRTC signaling). Optional AI, vision, recommendation, and RAG side services stay behind the API. Local Java defaults use H2 + Liquibase.

**Live:** [https://whatschat-web.vercel.app](https://whatschat-web.vercel.app)

## Get started

### Requirements

- **JDK 25** (Java API)
- Node.js 22 or later
- pnpm 10 or later
- Git

Optional: [Ollama](https://ollama.com/) and Python services in [explore-ml](https://github.com/felixzhu97/explore-ml) (`python_ml/`). See [Guideline](docs/Guideline.md) and [Glossary](docs/Glossary.md).

### Initial setup

```bash
git clone https://github.com/felixzhu97/explore-chat.git
cd explore-chat
pnpm install
```

### Run

```bash
# API only
./gradlew bootRun

# Web + API (scripts/app/start.sh)
pnpm dev

# Mobile (Expo)
pnpm start:mobile
```

| Surface   | Default URL                           |
| --------- | ------------------------------------- |
| Web       | http://localhost:4000                 |
| Admin     | http://localhost:4001                 |
| Mobile    | Expo (`pnpm start:mobile`)                |
| HTTP API  | http://localhost:9001                 |
| Health    | http://localhost:9001/api/v1/health   |
| Socket.IO | http://localhost:9002 (`/socket.io`)  |

Demo user (seeded on API boot): `alice@example.com` / `123456`.

```bash
./gradlew checkstyleMain checkstyleTest test
pnpm check-types
pnpm lint
pnpm test
```

### Configuration

| App / service | Example |
| ------------- | ------- |
| Java API | [`src/main/resources/application.yml`](src/main/resources/application.yml) |
| Web | `NEXT_PUBLIC_API_URL=http://localhost:9001/api/v1` · `NEXT_PUBLIC_SOCKET_IO_URL=http://localhost:9002` |
| Admin | `NEXT_PUBLIC_API_URL=http://localhost:9001/api/v1` |
| Mobile (Expo) | `EXPO_PUBLIC_API_URL=http://localhost:9001` · `EXPO_PUBLIC_SOCKET_IO_URL=http://localhost:9002` |

## Screenshots

<p align="center">
  <img src="./screenshots/mobile-feed-new-01.png" width="180" alt="Mobile feed">
  <img src="./screenshots/web-screen-1.png" width="280" alt="Web">
  <img src="./screenshots/admin-dashboard.png" width="280" alt="Admin">
</p>

## Next steps

- [QUICKSTART](docs/developer/QUICKSTART.md)
- [Guideline](docs/Guideline.md) · [Glossary](docs/Glossary.md)
- [API notes](docs/developer/api.md) · [Python services](docs/developer/python-services.md) (→ [explore-ml](https://github.com/felixzhu97/explore-ml))
- [C4 model](docs/developer/c4-model/README.md)
- [User Story Map](docs/product-owner/User-Story-Map.md)

## Repository layout

```text
src/main/java            Spring Boot API (:9001 HTTP, :9002 Socket.IO)
src/main/web             Next.js (:4000)
src/main/admin           Admin (:4001)
src/main/mobile          Expo / React Native
packages/                Shared types, IM, analytics (web / Expo)
docs/                    Guideline, Glossary, developer, C4
```

Optional ML helpers live in sibling [`explore-ml`](https://github.com/felixzhu97/explore-ml) under `python_ml/` (ports `:8000` / `:8001` / `:8002` / `:3456`).

Java features use per-feature packages: `controller` → `service` → `domain` ← `infra`, plus `mapper`.

## Contributing

Prefer a single English kebab-case branch slug, small PRs with a clear why and References, and keep Glossary terms plus C4 docs in sync when packages or APIs change.

## License

See repository license file.
