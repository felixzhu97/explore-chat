# ExploreChat Quick Start Guide

## ExploreChat 快速入门指南

---

## 1. Prerequisites | 前置条件

| Software | Version    | Notes                          |
| -------- | ---------- | ------------------------------ |
| Node.js  | >= 22      | 与 CI 一致                     |
| pnpm     | >= 10      | 仓库包管理器                   |
| Docker   | 近期稳定版 | 本地全栈依赖（见下方替代组件） |
| Git      | —          |                                |

```bash
node --version
pnpm --version
docker --version
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
2. `docker compose up -d --wait`（**不会** `compose down`）
3. Prisma generate + migrate
4. 构建 `@whatschat/shared-types`
5. 启动 Web + API

| 服务                     | 默认地址                                    |
| ------------------------ | ------------------------------------------- |
| Web                      | http://localhost:4000                       |
| API                      | http://localhost:3001                       |
| API 健康检查             | http://localhost:3001/api/v1/health         |
| Swagger（非 production） | http://localhost:3001/api/docs              |
| Admin                    | http://localhost:4001（`pnpm start:admin`） |

仅启动应用（infra 已在跑）：`pnpm dev:apps`。

---

## 3. Local stack | 本地依赖

Compose 文件：[services/server/docker-compose.yml](../../services/server/docker-compose.yml)。

| 角色      | 本地组件                                 | 端口 / 说明       |
| --------- | ---------------------------------------- | ----------------- |
| 关系库    | Postgres **18**（卷 `postgres_18_data`） | `localhost:5433`  |
| 缓存      | Redis 7                                  | `localhost:6379`  |
| 消息      | 服务名 `kafka` → **Redpanda**            | `localhost:9092`  |
| Feed 存储 | 服务名 `cassandra` → **Scylla**          | `localhost:9042`  |
| 搜索      | Elasticsearch 8（单节点）                | `localhost:9200`  |
| 文档库    | MongoDB 7                                | `localhost:27017` |
| 向量      | Qdrant                                   | `localhost:6333`  |

首次启动需能拉取 Redpanda / Scylla 镜像。Nest 仍用 `KAFKA_BROKERS`、`CASSANDRA_*` 等配置，能力不降级。

### Postgres 主版本

镜像钉在 **Postgres 18**，数据卷名为 `postgres_18_data`。升级主版本时需新卷或显式 `docker volume rm`，否则会出现 “data directory initialized by PostgreSQL version N” 错误。

停止应用进程：`pnpm stop`。仅在需要清空数据时：`./scripts/app/stop.sh --remove-volumes`。

Python 旁路（可选）：recommendation `:8000`、vision `:8001`、rag `:8002`、media-gen `:3456`。

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
