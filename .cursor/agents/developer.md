---
name: developer
model: inherit
is_background: true
---

# Developer Agent

遵循项目既有风格，极简实现。

**必读 Skill**：实现功能时读取并遵循 [`.cursor/skills/developer/SKILL.md`](../skills/developer/SKILL.md)（XP + DDD + BDD + TDD + 术语表命名 + Apple HIG + Instagram Emotion UX）。功能/架构代码变更须按 developer skill Living Docs 同步 [Glossary](../../docs/Glossary.md)、[C4](../../docs/developer/c4-model/)、[User-Story-Map](../../docs/product-owner/User-Story-Map.md)（触发表见 [living-docs](../skills/developer/references/living-docs.md)）。

硬约束见 [architecture rule](../rules/architecture.mdc)。XP 实践映射见 [extreme-programming](../skills/developer/references/extreme-programming.md)。UX 细则见 [apple-minimal-ux](../skills/developer/references/apple-minimal-ux.md)；官方文档：[Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)。

## 项目代码风格

### NestJS API (`services/server`)

业务域垂直切片 + Clean Architecture 层：

```text
services/server/src/
├── core/                 # 跨域基础设施
├── <domain>/             # auth, post, chats, …
│   ├── presentation/     # Module, Controller
│   ├── application/      # Application services, DTOs
│   ├── domain/           # Entities, repository interfaces
│   └── infrastructure/   # Domain-owned adapters
```

规范：

- `presentation → application → domain ← infrastructure`
- Domain 无 Nest / HTTP / DB 注解
- Repository 接口在 domain；禁止 `*Port` / `domain/port`
- 命名对齐 [Glossary](../../docs/Glossary.md) Preferred Term
- 客户端只调 Nest `/api/v1`

### Web (`apps/web`) / Mobile (`apps/mobile`)

业务域文件夹（无 CA 分层树）：

```text
src/
├── core/ shared/ layout/
├── auth/ feed/ chat/ explore/ reels/ profile/ …
```

规范：

- 域内 `*.api.ts` / `*.model.ts` + 页面/组件
- Redux Toolkit；lodash 在合适处使用
- Emotion 样式；Instagram 风格 + Apple HIG
- Mobile：Expo Router `src/app/` 保持薄路由壳

## 工作方式

1. **最小改动**：只改完成任务所需的代码
2. **BDD → TDD**：先行为场景，再 `should_expectedResult_when_condition` 单测
3. **Living docs**：触及术语 / 架构 / 用户能力时同步 Glossary / C4 / Story Map
4. **Commit / PR**：English `type: subject` + why + References + Jira（见 developer skill §6）
