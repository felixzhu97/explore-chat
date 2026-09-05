# ExploreChat

`ExploreChat` is a social messaging app you can use to share posts, browse Feed and Reels, message friends, and place calls. It is a pnpm + Turbo monorepo with a NestJS API, Next.js web and admin apps, and an Expo mobile client.

Clients talk only to Nest over HTTPS, WebSocket, and WebRTC signaling. Optional AI, vision, recommendation, and RAG side services stay behind Nest. Local development uses SQLite, in-process cache, and SQLite FTS5 — no Docker for the default stack.

**Live:** [https://whatschat-web.vercel.app](https://whatschat-web.vercel.app)

## Get started

### Requirements

You need:

- Node.js 22 or later (aligned with CI)
- pnpm 10 or later
- Git

Optional for AI and media flows: [Ollama](https://ollama.com/) and the Python services under `services/`. To learn the product language and design intent, see [Guideline](docs/Guideline.md) and [Glossary](docs/Glossary.md).

### Initial setup

```bash
git clone https://github.com/felixzhu97/explore-chat.git
cd explore-chat
pnpm install
```

### Run your first session

```bash
pnpm dev
```

That command ensures `services/server/.env`, runs Prisma migrations against local SQLite (`file:./dev.db`), builds shared types, and starts Web + API. Cache, feed fan-out, and search run in-process. See [QUICKSTART](docs/developer/QUICKSTART.md) for a fuller walkthrough.

| Surface                  | Default URL                         |
| ------------------------ | ----------------------------------- |
| Web                      | http://localhost:4000               |
| Admin                    | http://localhost:4001               |
| API                      | http://localhost:3001               |
| Health                   | http://localhost:3001/api/v1/health |
| Swagger (non-production) | http://localhost:3001/api/docs      |

Seed a demo user with:

```bash
pnpm --filter whatschat-server db:seed
```

Then sign in as `cristiano@whatschat.com` / `123456`. Optional sample posts: `pnpm --filter whatschat-server db:seed:posts`.

Apps only: `pnpm dev:apps`. Admin / mobile helpers: `pnpm start:admin`, `pnpm start:mobile:ios`, …. Stop the stack with `pnpm stop`.

### Configuration

Copy examples and adjust for your machine:

| App / service | Example                                                                              |
| ------------- | ------------------------------------------------------------------------------------ |
| Nest API      | [`services/server/.env.example`](services/server/.env.example)                       |
| Mobile        | [`apps/mobile/.env.example`](apps/mobile/.env.example)                               |
| Web           | `apps/web/.env.local` — typically `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` |
| Admin         | `apps/admin/.env.local` — API URL + `ADMIN_EMAILS`                                   |

Local defaults match `.env.example` (SQLite). Production can point `DATABASE_URL` at Postgres later. Physical devices should set `EXPO_PUBLIC_API_URL` to your LAN host.

### Checks

```bash
pnpm check-types
pnpm lint
pnpm test
pnpm build
```

Checks run in GitHub Actions CI on pull requests; locally use
`pnpm check-types`, `pnpm lint`, and `pnpm test` as needed.

## Screenshots

<p align="center">
  <img src="./screenshots/mobile-feed-new-01.png" width="180" alt="Mobile feed">
  <img src="./screenshots/web-screen-1.png" width="280" alt="Web">
  <img src="./screenshots/admin-dashboard.png" width="280" alt="Admin">
</p>

More captures live under [`screenshots/`](./screenshots/).

## Next steps

- Follow the [developer quick start](docs/developer/QUICKSTART.md) for env, seed, and mobile LAN setup.
- Read the [product guideline](docs/Guideline.md) and [Glossary](docs/Glossary.md) Preferred Terms.
- Browse the [API notes](docs/developer/api.md) and [Python side services](docs/developer/python-services.md).
- Open the [C4 model](docs/developer/c4-model/README.md) for context, containers, components, and dynamics.
- Review the [User Story Map](docs/product-owner/User-Story-Map.md) for delivery status.
- Inspect the monorepo layout under `apps/`, `services/`, and `packages/`.

## Repository layout

```text
apps/web                 Next.js (:4000)
apps/admin               Admin (:4001)
apps/mobile              Expo / React Native
services/server          NestJS API (:3001)
services/media-gen       Media generation (:3456)
services/recommendation  Recommendation
services/vision          Moderation / vision (:8001)
services/rag             RAG Q&A (:8002)
packages/                Shared types, IM, analytics
docs/                    Guideline, Glossary, developer, C4
```

Web and mobile use business-domain folders with colocated API and UI. Nest keeps vertical slices (`auth/`, `post/`, `chats/`, …) with `presentation` → `application` → `domain` ← `infrastructure`.

## Contributing

Contributions are welcome. Prefer a single English kebab-case branch slug, small PRs with a clear why and References, and keep Glossary terms plus C4 docs in sync when packages or APIs change.

## License

MIT — see `license` in the root [`package.json`](package.json).
