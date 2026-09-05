# ExploreChat Quick Start Guide

## ExploreChat 快速入门指南

---

## 1. Prerequisites | 前置条件

| Software | Version | Notes        |
| -------- | ------- | ------------ |
| Node.js  | >= 22   | 与 CI 一致   |
| pnpm     | >= 10   | 仓库包管理器 |
| Git      | —       |              |

**不需要 Docker。** 本地默认：Node + SQLite + 进程内缓存/事件。

```bash
node --version
pnpm --version
```

---

## 2. Install & run | 安装并启动

```bash
git clone <repo-url> explore-chat
cd explore-chat
pnpm install
pnpm dev
```

`pnpm dev`（[`scripts/app/start.sh`](../../scripts/app/start.sh)）会：

1. 若缺少 `services/server/.env`，从 `.env.example` 复制
2. Prisma generate + migrate（SQLite `file:./dev.db`）
3. 构建 `@whatschat/shared-types`
4. 启动 Web + API

| 服务                     | 默认地址                                    |
| ------------------------ | ------------------------------------------- |
| Web                      | http://localhost:4000                       |
| API                      | http://localhost:3001                       |
| API 健康检查             | http://localhost:3001/api/v1/health         |
| Swagger（非 production） | http://localhost:3001/api/docs              |
| Admin                    | http://localhost:4001（`pnpm start:admin`） |

种子数据：

```bash
pnpm --filter whatschat-server db:seed
pnpm --filter whatschat-server db:seed:posts
```

演示账号：`cristiano@whatschat.com` / `123456`。

仅启动应用：`pnpm dev:apps`。

---

## 3. Local stack | 本地依赖（无 Docker）

| 能力               | 实现                                           |
| ------------------ | ---------------------------------------------- |
| 持久化             | SQLite（Prisma，`DATABASE_URL=file:./dev.db`） |
| 缓存 / presence    | 进程内 Memory（原 Redis API）                  |
| Feed fan-out       | 进程内 `FeedFanoutService`（原 Kafka）         |
| 搜索               | SQLite FTS5 + LIKE                             |
| Feed / 评论 / 通知 | 同一 SQLite 表                                 |

### 生产 Postgres（可选）

本轮本地默认 SQLite。生产可把 `DATABASE_URL` 换成 Postgres，并使用对应 Prisma schema 档（后续可加多 datasource）。不引入 Docker 作为本地前置。

遗留 [`docker-compose.yml`](../../services/server/docker-compose.yml) 仅供 CI / 实验，**不是** `pnpm dev` 路径。

Python 旁路（可选）：recommendation `:8000`、vision `:8001`、rag `:8002`（向量库默认本地目录，见 RAG `.env.example`）、media-gen `:3456`。

---

## 4. Checks | 校验

```bash
pnpm check-types
pnpm lint
pnpm test
```

Pre-commit：`lint-staged` + `pnpm check-types`（Husky）。

---

## 5. Docs | 文档

| 文档            | 路径                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| Guideline       | [../Guideline.md](../Guideline.md)                                       |
| Glossary        | [../Glossary.md](../Glossary.md)                                         |
| API             | [api.md](./api.md)                                                       |
| Postman         | [postman_collection.json](./postman_collection.json)                     |
| C4              | [c4-model/](./c4-model/)                                                 |
| User Story Map  | [../product-owner/User-Story-Map.md](../product-owner/User-Story-Map.md) |
| Python services | [python-services.md](./python-services.md)                               |
