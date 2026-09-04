# ExploreChat Quick Start Guide

## ExploreChat 快速入门指南

---

## 1. Prerequisites | 前置条件

| Software | Version    | Notes                    |
| -------- | ---------- | ------------------------ |
| Node.js  | >= 22      | 与 CI 一致               |
| pnpm     | >= 9       | 仓库包管理器             |
| Docker   | 近期稳定版 | 本地 Postgres / Redis 等 |
| Git      | —          |                          |

```bash
node --version
pnpm --version
docker --version
```

---

## 2. Install | 安装

```bash
git clone <repo-url> explore-chat
cd explore-chat
pnpm install
```

---

## 3. Infrastructure | 基础设施

在 `services/server` 启动 compose（至少 Postgres + Redis）：

```bash
cd services/server
docker compose up -d postgres redis
```

默认映射：Postgres `localhost:5433`，Redis `localhost:6379`。

复制并编辑环境变量：

```bash
cp services/server/.env.example services/server/.env
# 设置 DATABASE_URL、REDIS_URL、JWT_SECRET（生产需 ≥32 字符）
```

迁移与生成：

```bash
cd services/server
pnpm db:generate
pnpm migrate:deploy   # 或 pnpm migrate（开发）
```

---

## 4. Run | 启动

仓库根目录：

```bash
# Web + API
pnpm dev

# 或分别
pnpm start:web
pnpm start:server
```

| 服务                     | 默认地址                            |
| ------------------------ | ----------------------------------- |
| Web                      | http://localhost:3000               |
| API                      | http://localhost:3001               |
| API 健康检查             | http://localhost:3001/api/v1/health |
| Swagger（非 production） | http://localhost:3001/api/docs      |

可选旁路服务：recommendation `:8000`、vision `:8001`、rag `:8002`、media-gen `:3456`。

---

## 5. Checks | 校验

```bash
pnpm check-types
pnpm lint
pnpm test
```

Pre-commit：`lint-staged` + `pnpm check-types`（Husky）。

---

## 6. Docs | 文档

| 文档            | 路径                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| Guideline       | [../Guideline.md](../Guideline.md)                                       |
| Glossary        | [../Glossary.md](../Glossary.md)                                         |
| API             | [api.md](./api.md)                                                       |
| Postman         | [postman_collection.json](./postman_collection.json)                     |
| C4              | [c4-model/](./c4-model/)                                                 |
| User Story Map  | [../product-owner/User-Story-Map.md](../product-owner/User-Story-Map.md) |
| Python services | [python-services.md](./python-services.md)                               |
