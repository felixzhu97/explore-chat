# C4 模型

ExploreChat 的架构视图。源文件为 `.puml`；PNG 可选。术语见 [Glossary](../../Glossary.md)；产品状态见 [User Story Map](../../product-owner/User-Story-Map.md)。

命名对齐 C4：`C1-Context` / `C2-Container` / `C3-Component` / `C4-Code-*` / `C4-Deployment` / `C4-Dynamic-*`。

视觉对齐 partner/iam：**白底黑字黑边框**；结构图内联 `style.puml` 同等语句（勿 `!include`，预览临时目录会失败）。**不要**启用 `!NEW_C4_STYLE`。

---

## 文件

| 文件                               | 层级       | 说明                                                |
| ---------------------------------- | ---------- | --------------------------------------------------- |
| `C1-Context.puml`                  | C1         | 系统上下文                                          |
| `C2-Container.puml`                | C2         | 容器（Web / Admin / Mobile / Nest / SQLite / 旁路） |
| `C3-Component.puml`                | C3         | 组件（Web UI + Nest 限界上下文）                    |
| `C4-Code-Domain-Model.puml`        | Code       | 领域模型（对齐当前代码）                            |
| `C4-Code-Domain-Model-Plan.puml`   | Code       | 领域模型规划差分（绿增 / 红删）                     |
| `C4-Deployment.puml`               | Deployment | 本地开发部署（含生产简述）                          |
| `C4-Dynamic-Auth-Login.puml`       | Dynamic    | 登录 → JWT                                          |
| `C4-Dynamic-Post-Create-Feed.puml` | Dynamic    | 发帖 → SQLite → fan-out → 读帖                      |
| `C4-Dynamic-Search-FTS.puml`       | Dynamic    | 搜索（FTS5 / LIKE）                                 |
| `style.puml`                       | Shared     | 结构图规范副本（内联用）                            |

---

## Context

![C1-Context](png/C1-Context.png)

---

## Container

![C2-Container](png/C2-Container.png)

---

## Component

![C3-Component](png/C3-Component.png)

---

## Code

![C4-Code-Domain-Model](png/C4-Code-Domain-Model.png)

对齐 feature 包：`controller` / `service` / `domain` / `infra`（Nest module 在 feature 根），以及 `base/domain`、`base/infra` 与 Prisma SQLite（含 social 表）。

Message 写路径：`Chat.ensureParticipant` → `Message.assertSendableBy` → `MessageRepository.save`；删消息为 soft delete（`isDeleted`）。`PrismaMessageRepository` / `PrismaChatRepository` 继承 `AbstractPrismaRepository`；User 侧为 `PrismaUserRepository`。

### Plan

![C4-Code-Domain-Model-Plan](png/C4-Code-Domain-Model-Plan.png)

相对 as-built 的规划差分：绿 = 待实现新增，红 = 待实现删除。

DDD 内核（对齐 Nest + Prisma cuid / `createdAt` / `updatedAt`）：

- `AbstractImmutable` → `AbstractEntity`（含计划中的 `version`）
- `AbstractAggregateRoot`：User / Chat / Message / Group / Post
- `AbstractParticipant`：ChatParticipant / GroupParticipant 共用成员字段
- `AbstractEmbeddable`：无独立聚合身份的值对象

Chat / Message 行为收敛：`ensureParticipant`、`assertSendableBy`、`MessageRepository`、Message Soft Delete（`delete()` → `isDeleted`）。

infra：`AbstractPrismaRepository`（持有 PrismaClient）；`PrismaMessageRepository` 继承它并实现 `MessageRepository`。domain 端口保留，仅减实现样板。类框与 stereotype 为黑白灰。

```bash
cd docs/developer/c4-model && plantuml -tpng -o png C4-Code-Domain-Model-Plan.puml
```

---

## Deployment

![C4-Deployment](png/C4-Deployment.png)

本地：`pnpm dev` → Web `:4000` + API `:3001` + `file:./dev.db`。生产拓扑以图内 note 简述；**不**默认 docker compose。

---

## Dynamic

仅保留关键运行时路径。

### Auth Login

![C4-Dynamic-Auth-Login](png/C4-Dynamic-Auth-Login.png)

用户提交凭据 → `POST /api/v1/auth/login` → 校验 SQLite 用户 → 签发 JWT。

### Post Create → Feed

![C4-Dynamic-Post-Create-Feed](png/C4-Dynamic-Post-Create-Feed.png)

发帖写入 `social_posts` → 进程内 fan-out `feed_entries` → 再 `GET` 同帖（避免空写 404）。

### Search FTS

![C4-Dynamic-Search-FTS](png/C4-Dynamic-Search-FTS.png)

`/api/v1/search` 走 SQLite FTS5，失败时 LIKE 回退。

---

## 技术栈

| 层           | 要点                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| Web / Admin  | Next.js、React、TypeScript；`:4000` / `:4001`                                          |
| Mobile       | Expo / React Native                                                                    |
| API          | NestJS 10；REST / GraphQL / Socket.IO；`:3001`                                         |
| 持久化       | SQLite（Prisma）；进程内 Memory 缓存；FTS5 搜索                                        |
| 旁路（可选） | recommendation `:8000`、vision `:8001`、rag `:8002`（本地向量目录）、media-gen `:3456` |
| AI           | 本地 Ollama；Explore AI 经 Nest BFF                                                    |

限界上下文（Nest）：`auth` / `users` / `post` / `comments` / `chats` / `search` / `notifications` / …

---

## 渲染

```bash
cd docs/developer/c4-model && mkdir -p png && plantuml -tpng -o png *.puml
```

或：

```bash
cd docs/developer/c4-model && docker run --rm -v "$PWD":/data plantuml/plantuml -tpng -o png '*.puml'
```

依赖 [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML) 远程 include。

---

## 相关内容

- [Glossary](../../Glossary.md)
- [Guideline](../../Guideline.md)
- [QUICKSTART](../QUICKSTART.md)
- [User Story Map](../../product-owner/User-Story-Map.md)
