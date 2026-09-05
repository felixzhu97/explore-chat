# Chat Quick Start Guide

## 1. Prerequisites

| Software | Version | Notes |
| -------- | ------- | ----- |
| JDK | 25 | Spring Boot API |
| Node.js | >= 22 | Clients |
| pnpm | >= 10 | Package manager |
| Git | — | |

```bash
java -version
node --version
pnpm --version
```

## 2. Install & run

```bash
git clone <repo-url> explore-chat
cd explore-chat
pnpm install
./gradlew bootRun
```

In another terminal:

```bash
pnpm start:web
```

Or both via `pnpm dev` ([`scripts/app/start.sh`](../../scripts/app/start.sh)).

| Surface | URL |
| ------- | --- |
| Web | http://localhost:4000 |
| HTTP API | http://localhost:9001 |
| Health | http://localhost:9001/api/v1/health |
| Socket.IO | http://localhost:9002 |
| AIP REST | [`aip-rest.md`](./aip-rest.md) |
| Admin | http://localhost:4001 (`pnpm start:admin`) |

Demo login (seeded on boot): `cristiano@whatschat.com` / `123456`.

### Kafka (optional)

Kafka is enabled when `KAFKA_BROKERS` is non-empty (default `localhost:9092`). Set
`KAFKA_BROKERS=` (empty) to disable; the publisher no-ops and the API still boots.

Topics (Nest-aligned): `post.created`, `post.deleted`, `feed.fanout`,
`comment.created`, `offline-messages`, `analytics.events`.

Client env:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9001/api/v1
NEXT_PUBLIC_SOCKET_IO_URL=http://localhost:9002
EXPO_PUBLIC_API_URL=http://localhost:9001
EXPO_PUBLIC_SOCKET_IO_URL=http://localhost:9002
```

## 3. Checks

```bash
./gradlew checkstyleMain checkstyleTest test
pnpm check-types
pnpm lint
pnpm test
```
