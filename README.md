# Chat

`Chat` is a social messaging app you can use to share posts, browse Feed and Reels, message friends, and place calls. It is a pnpm + Turbo monorepo with a **Spring Boot API at the repo root**, Next.js web and admin apps, an Expo mobile client, and optional Python side services.

Clients talk only to the Spring API over HTTPS and Socket.IO (plus WebRTC signaling). Optional AI, vision, recommendation, and RAG side services stay behind the API. Local Java defaults use H2 + Liquibase.

**Live:** [https://whatschat-web.vercel.app](https://whatschat-web.vercel.app)

## Get started

### Requirements

- **JDK 25** (Java API)
- Node.js 22 or later
- pnpm 10 or later
- Git

Optional: [Ollama](https://ollama.com/) and Python services under `services/`. See [Guideline](docs/Guideline.md) and [Glossary](docs/Glossary.md).

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
```

| Surface   | Default URL                           |
| --------- | ------------------------------------- |
| Web       | http://localhost:4000                 |
| Admin     | http://localhost:4001                 |
| HTTP API  | http://localhost:9001                 |
| Health    | http://localhost:9001/api/v1/health   |
| Socket.IO | http://localhost:9002 (`/socket.io`)  |

Demo user (seeded on API boot): `cristiano@whatschat.com` / `123456`.

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
| Mobile | `EXPO_PUBLIC_API_URL=http://localhost:9001` · `EXPO_PUBLIC_SOCKET_IO_URL=http://localhost:9002` |

## Screenshots

<p align="center">
  <img src="./screenshots/mobile-feed-new-01.png" width="180" alt="Mobile feed">
  <img src="./screenshots/web-screen-1.png" width="280" alt="Web">
  <img src="./screenshots/admin-dashboard.png" width="280" alt="Admin">
</p>

## Next steps

- [QUICKSTART](docs/developer/QUICKSTART.md)
- [Guideline](docs/Guideline.md) · [Glossary](docs/Glossary.md)
- [API notes](docs/developer/api.md) · [Python services](docs/developer/python-services.md)
- [C4 model](docs/developer/c4-model/README.md)
- [User Story Map](docs/product-owner/User-Story-Map.md)

## Repository layout

```text
src/main/java/com.chat   Spring Boot API (:9001 HTTP, :9002 Socket.IO)
apps/web                 Next.js (:4000)
apps/admin               Admin (:4001)
apps/mobile              Expo / React Native
services/media-gen       Media generation (:3456)
services/recommendation  Recommendation
services/vision          Moderation / vision (:8001)
services/rag             RAG Q&A (:8002)
packages/                Shared types, IM, analytics
docs/                    Guideline, Glossary, developer, C4
```

Java features use per-feature packages: `controller` → `service` → `domain` ← `infra`, plus `mapper`.

## Contributing

Prefer a single English kebab-case branch slug, small PRs with a clear why and References, and keep Glossary terms plus C4 docs in sync when packages or APIs change.

## License

See repository license file.
