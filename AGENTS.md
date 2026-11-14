# Explore Chat — agent guide

Social messaging app: Feed, Post, Chat, Message, Group, Call,
Notification and optional generative assistance. Java 25 + Spring Boot
API (REST + Socket.IO), Next.js web and admin, Expo React Native app,
SwiftUI hello-world app.

Start here, then follow links. This file is a map; detail lives in `docs/`.

## Map

| Path | What lives there |
|------|------------------|
| `src/main/java/com/chat/<feature>/` | API feature modules: `chats`, `messages`, `groups`, `calls`, `post`, `follow`, `notifications`, `media`, `search`, `ai`, `auth`, `users`, … |
| `src/main/java/com/chat/common/` | Shared kernel |
| `src/main/resources/` | `application*.yml`, DB migrations |
| `src/main/im-contract/openapi.yaml` | IM API contract, linted by Spectral |
| `src/test/java/com/chat/architecture/` | ArchUnit rules — the mechanical form of the hard rules below |
| `src/main/web/` | Next.js web app (`chat-web`, :4000) |
| `src/main/admin/` | Next.js admin (`chat-admin`, :4001) |
| `src/main/mobile/` | Expo React Native app |
| `packages/analytics/` | Shared analytics package |
| `src/main/ios/` | SwiftUI app |
| `docs/Glossary.md` | Ubiquitous language — name code after Preferred Terms |
| `docs/Guideline.md` | Product rules (start at "Best practices") |
| `docs/developer/QUICKSTART.md` | Environment and first run |
| `docs/developer/c4-model/` | C4 views; domain model in `C4-Code-Domain-Model.puml` |
| `docs/product-owner/` | User Story Map and stories |

## Commands

| Need | Command |
|------|---------|
| Verify everything (run before every commit) | `pnpm verify` |
| API only: style, tests, ArchUnit | `pnpm verify:server` |
| Clients only: build packages, types, lint, tests, OpenAPI lint | `pnpm verify:web` |
| Docs only: relative Markdown links | `pnpm verify:docs` |
| Start API (:9001) and web (:4000), wait for health | `pnpm dev` (stop with `pnpm stop`) |
| API only | `pnpm dev:api` |
| Admin only | `pnpm start:admin` |

## Hard rules (enforced by `verify`)

1. Per feature: `controller → service → domain ← infra`. Domain depends
   on neither Spring nor `infra`.
2. Clients reach every capability through Spring `/api/v1` (REST and
   Socket.IO). Never call AI or media side services from a client;
   upstream credentials stay on the server.
3. The API stays the source of truth for Chat and Message history;
   Socket.IO events are reconciled with durable reads.
4. API changes update `src/main/im-contract/openapi.yaml` in the same PR.
5. Never log message content, Media, tokens, emails or IPs.

When an ArchUnit rule fails, its message ends with `Fix:` — do that.
Never add lines to `src/test/resources/archunit_store/`; it only shrinks.

## Conventions

- Tests: `should <result> when <condition>` (`@DisplayName` with spaces;
  Java method names in camelCase).
- Domain language changes: update `docs/Glossary.md` and
  `C4-Code-Domain-Model.puml` before the code.
- Branch `<slug>` (no prefix); commit subject = PR title; body why +
  References; fine-grained Draft PRs via `gh stack`.

## Where to record work

- Multi-step plan: `docs/developer/exec-plans/` (see its README)
- Known debt: `docs/developer/tech-debt.md`
- Module health: `docs/developer/quality.md`

## Agents

Team agent definitions in `.cursor/agents/` are synced from the
`public` meta-repo — edit them there, not here.
