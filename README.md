# WhatsFeed

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10-orange.svg)](https://pnpm.io/)

WhatsFeed brings social connection into everyday life. Our mission is to help people share, message, and discover — simply and beautifully.

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
- Explore grid and global search (Elasticsearch optional)
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
Rules summary: [.cursor/rules/architecture.mdc](.cursor/rules/architecture.mdc).

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
git clone https://github.com/felixzhu97/whatsfeed.git
cd whatsfeed
pnpm install
pnpm setup
```

Start local data stores (from `services/server`, at least Postgres and Redis):

```bash
cd services/server
docker compose up -d postgres redis
cd ../..
cp services/server/.env.example services/server/.env
# Set DATABASE_URL, REDIS_URL, JWT_SECRET (production secrets must be strong)
```

Migrate and generate Prisma client:

```bash
cd services/server
pnpm db:generate
pnpm migrate          # or: pnpm exec prisma migrate deploy
pnpm db:seed          # optional demo data
cd ../..
```

Run apps (from repo root):

```bash
pnpm start:server          # Nest API — http://localhost:3001
pnpm start:web             # Web — http://localhost:4000
pnpm start:admin           # Admin — http://localhost:4001
pnpm start:mobile:ios      # Expo iOS (or start:mobile / start:mobile:android)

# Web + API together
pnpm dev
```

| Service                  | Default URL                         |
| ------------------------ | ----------------------------------- |
| Web                      | http://localhost:4000               |
| Admin                    | http://localhost:4001               |
| API                      | http://localhost:3001               |
| Health                   | http://localhost:3001/api/v1/health |
| Swagger (non-production) | http://localhost:3001/api/docs      |

Stop helpers: `pnpm stop` (dev) / `pnpm stop:prod`.

More detail: [docs/developer/QUICKSTART.md](docs/developer/QUICKSTART.md).

## Configuration

Copy examples and adjust for your machine:

| App / service | Example file                                                                         |
| ------------- | ------------------------------------------------------------------------------------ |
| Nest API      | [`services/server/.env.example`](services/server/.env.example)                       |
| Mobile        | [`apps/mobile/.env.example`](apps/mobile/.env.example)                               |
| Web           | `apps/web/.env.local` — typically `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` |
| Admin         | `apps/admin/.env.local` — API URL + `ADMIN_EMAILS`                                   |

Common server variables:

```bash
# services/server/.env (illustrative)
DATABASE_URL=postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=whatschat-dev-jwt-secret
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
| Quick start     | [docs/developer/QUICKSTART.md](docs/developer/QUICKSTART.md)                 |
| API             | [docs/developer/api.md](docs/developer/api.md)                               |
| Python services | [docs/developer/python-services.md](docs/developer/python-services.md)       |
| C4 model        | [docs/developer/c4-model/](docs/developer/c4-model/)                         |
| Glossary        | [docs/Glossary.md](docs/Glossary.md)                                         |
| User story map  | [docs/product-owner/User-Story-Map.md](docs/product-owner/User-Story-Map.md) |
| CI / coverage   | [docs/developer/cicd/](docs/developer/cicd/)                                 |

## C4 model

Architecture diagrams live under [docs/developer/c4-model/](docs/developer/c4-model/).

### C1 — System context

![C1 system context](./docs/developer/c4-model/png/C1-Context.png)

### C2 — Containers

![C2 containers](./docs/developer/c4-model/png/C2-Container.png)

### C3 — Components

#### API server

![C3 API server](./docs/developer/c4-model/png/C3-Component-Backend.png)

#### Web app

![C3 web app](./docs/developer/c4-model/png/C3-Component-Frontend.png)

## Contributing

1. Use branch names `<type>/<slug>` (for example `feat/…`, `fix/…`, `docs/…`, `refactor/…`).
2. Prefer small PRs with a clear why, References, and linked Jira when applicable.
3. Keep Glossary Preferred Terms and architecture docs in sync when package layout or APIs change.

See [.cursor/skills/developer/SKILL.md](.cursor/skills/developer/SKILL.md) for project commit and PR conventions.

## License

MIT (see `license` in the root [`package.json`](package.json)).
