# ExploreChat

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10-orange.svg)](https://pnpm.io/)

ExploreChat brings social connection into everyday life. Our mission is to help people share, message, and discover — simply and beautifully.

**Live:** [https://whatschat-web.vercel.app](https://whatschat-web.vercel.app)

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Development](#development)
- [Documentation](#documentation)
- [C4 model](#c4-model)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time messaging (Socket.IO) and WebRTC voice/video calls
- Social feed, Reels, stories, comments, likes, and saves
- Explore grid and global search (Elasticsearch in local compose)
- Media upload and post creation
- JWT authentication
- AI text/image/video/voice flows proxied through Nest (including Explore AI BFF)
- Content moderation and vision side services (via Nest)
- Recommendation and RAG side services (via Nest)
- Ads, analytics, and admin tools
- Web (Next.js), mobile (Expo), and admin apps

## Architecture

pnpm + Turbo monorepo.

| Layer                            | Layout                                                                                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web / Mobile**                 | Business-domain folders (`auth/`, `feed/`, `chat/`, …) with colocated API and UI. Redux Toolkit on clients. No Clean Architecture layer trees.                                                                |
| **Nest API** (`services/server`) | Business-domain vertical slices (`auth/`, `post/`, `chats/`, …). Each domain keeps Clean Architecture layers: `presentation` → `application` → `domain` ← `infrastructure`. Shared infra lives under `core/`. |
| **Python services**              | Media generation, vision, recommendation, RAG — reached only through Nest.                                                                                                                                    |

Canonical terms and package paths: [docs/Glossary.md](docs/Glossary.md).  
Design guideline: [docs/Guideline.md](docs/Guideline.md).  
Architecture diagrams: [docs/developer/c4-model/README.md](docs/developer/c4-model/README.md).

```text
Browser / Mobile ──HTTPS / WS──► NestJS (:3001, /api/v1)
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              media-gen          vision / RAG      recommendation
```

## Repository structure

```text
apps/
  web              # Next.js web app (:4000)
  admin            # Admin console (:4001)
  mobile           # Expo / React Native
services/
  server           # NestJS API (:3001)
  media-gen        # Media generation (:3456)
  recommendation   # Recommendation + Celery
  vision           # Moderation / vision (:8001)
  rag              # RAG Q&A (:8002)
packages/
  shared-types     # Shared TypeScript types and consts
  im               # IM / RTC client module
  analytics        # Analytics SDK
docs/
  Guideline.md     # Product / integration design guideline
  Glossary.md      # Ubiquitous language
  developer/       # Quick start, API, C4, CI notes
  product-owner/   # User story map
```

## Screenshots

### Mobile

<p align="center">
  <img src="./screenshots/mobile-feed-new-01.png" width="220" alt="Mobile feed screenshot 1">
  <img src="./screenshots/mobile-feed-new-02.png" width="220" alt="Mobile feed screenshot 2">
  <img src="./screenshots/mobile-feed-new-03.png" width="220" alt="Mobile feed screenshot 3">
</p>
<p align="center">
  <img src="./screenshots/mobile-feed-new-04.png" width="220" alt="Mobile feed screenshot 4">
  <img src="./screenshots/mobile-feed-new-05.png" width="220" alt="Mobile feed screenshot 5">
</p>

### Web

<p align="center">
  <img src="./screenshots/web-screen-1.png" width="340" alt="Web screenshot 1">
  <img src="./screenshots/web-screen-2.png" width="340" alt="Web screenshot 2">
</p>
<p align="center">
  <img src="./screenshots/web-screen-3.png" width="340" alt="Web screenshot 3">
  <img src="./screenshots/web-screen-4.png" width="340" alt="Web screenshot 4">
</p>
<p align="center">
  <img src="./screenshots/web-screen-5.png" width="340" alt="Web screenshot 5">
  <img src="./screenshots/web-screen-6.png" width="340" alt="Web screenshot 6">
</p>
<p align="center">
  <img src="./screenshots/web-screen-7.png" width="340" alt="Web screenshot 7">
  <img src="./screenshots/web-screen-8.png" width="340" alt="Web screenshot 8">
</p>
<p align="center">
  <img src="./screenshots/web-screen-9.png" width="340" alt="Web screenshot 9">
</p>

### Admin

<p align="center">
  <img src="./screenshots/admin-dashboard.png" width="340" alt="Admin dashboard">
  <img src="./screenshots/admin-users.png" width="340" alt="Admin users">
</p>

## Prerequisites

| Tool                    | Version                                               |
| ----------------------- | ----------------------------------------------------- |
| Node.js                 | >= 22 (aligned with CI)                               |
| pnpm                    | >= 10                                                 |
| Docker + Docker Compose | Recent stable (Postgres, Redis, and other local deps) |
| Git                     | Any recent version                                    |

Optional for AI / media flows: Ollama, and the Python services under `services/`.

## Quick start

```bash
git clone https://github.com/felixzhu97/explore-chat.git
cd explore-chat
pnpm install
pnpm dev
```

That single command ensures `.env`, starts the full local Docker stack
(Postgres 18, Redis, Redpanda, ScyllaDB, Elasticsearch, MongoDB, Qdrant),
runs migrations, builds shared types, and runs Web + API. It never runs
`docker compose down`.

| Service                  | Default URL                         |
| ------------------------ | ----------------------------------- |
| Web                      | http://localhost:4000               |
| Admin                    | http://localhost:4001               |
| API                      | http://localhost:3001               |
| Health                   | http://localhost:3001/api/v1/health |
| Swagger (non-production) | http://localhost:3001/api/docs      |

Local Kafka/CQL drop-ins: **Redpanda** (`KAFKA_BROKERS`) and **ScyllaDB**
(`CASSANDRA_*`) — same Nest clients, lighter containers. Postgres major is
pinned to 18 (`postgres_18_data` volume); bumping the image major needs a
new volume or an explicit volume remove.

Apps only (infra already up): `pnpm dev:apps`.  
Admin / mobile: `pnpm start:admin`, `pnpm start:mobile:ios`, …  
Stop helpers: `pnpm stop` (dev). Wipe volumes only with
`./scripts/app/stop.sh --remove-volumes`.

More detail: [docs/developer/QUICKSTART.md](docs/developer/QUICKSTART.md).

## Configuration

Copy examples and adjust for your machine:

| App / service | Example file                                                                         |
| ------------- | ------------------------------------------------------------------------------------ |
| Nest API      | [`services/server/.env.example`](services/server/.env.example)                       |
| Mobile        | [`apps/mobile/.env.example`](apps/mobile/.env.example)                               |
| Web           | `apps/web/.env.local` — typically `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` |
| Admin         | `apps/admin/.env.local` — API URL + `ADMIN_EMAILS`                                   |

Common server variables (defaults match `pnpm dev` / `.env.example`):

```bash
DATABASE_URL=postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=whatschat-dev-jwt-secret-key-32chars
KAFKA_BROKERS=localhost:9092
CASSANDRA_CONTACT_POINTS=localhost:9042
ELASTICSEARCH_NODE=http://localhost:9200
MONGODB_URI=mongodb://localhost:27017/whatschat
OLLAMA_BASE_URL=http://localhost:11434
MEDIA_GENERATION_API_URL=http://localhost:3456
VISION_SERVICE_URL=http://localhost:8001
RAG_SERVICE_URL=http://localhost:8002
```

Mobile physical devices should set `EXPO_PUBLIC_API_URL` to your LAN host (see `apps/mobile/.env.example`).

## Development

```bash
pnpm check-types    # TypeScript across packages
pnpm lint
pnpm test
pnpm test:watch
pnpm format
pnpm build
```

Pre-commit hooks run via Husky (`lint-staged` + typecheck).

## Documentation

| Doc             | Path                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| Guideline       | [docs/Guideline.md](docs/Guideline.md)                                       |
| Glossary        | [docs/Glossary.md](docs/Glossary.md)                                         |
| Quick start     | [docs/developer/QUICKSTART.md](docs/developer/QUICKSTART.md)                 |
| API             | [docs/developer/api.md](docs/developer/api.md)                               |
| Python services | [docs/developer/python-services.md](docs/developer/python-services.md)       |
| C4 model        | [docs/developer/c4-model/](docs/developer/c4-model/)                         |
| User story map  | [docs/product-owner/User-Story-Map.md](docs/product-owner/User-Story-Map.md) |
| CI / coverage   | [docs/developer/cicd/](docs/developer/cicd/)                                 |

## C4 model

Architecture diagrams live under [docs/developer/c4-model/](docs/developer/c4-model/).

### C1 — System context

![C1 system context](./docs/developer/c4-model/png/C1-Context.png)

### C2 — Containers

![C2 containers](./docs/developer/c4-model/png/C2-Container.png)

### C3 — Components

![C3 components](./docs/developer/c4-model/png/C3-Component.png)

## Contributing

1. Use branch names as a single English kebab-case slug (for example `c3-component-diagram`, `remove-cursor-config`).
2. Prefer small PRs with a clear why, References, and linked Jira when applicable.
3. Keep Glossary Preferred Terms and architecture docs in sync when package layout or APIs change.

## License

MIT (see `license` in the root [`package.json`](package.json)).
