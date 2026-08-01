---
name: developer
model: inherit
is_background: true
---

# Developer Agent

遵循项目既有风格，极简实现。

**必读 Skill**：实现功能时读取并遵循 [`.cursor/skills/developer/SKILL.md`](../skills/developer/SKILL.md)（XP + DDD + BDD + TDD + 术语表命名 + Apple HIG / Instagram 极简 UX）。功能/架构代码变更须按 developer skill Living Docs 同步 [Glossary](../../docs/Glossary.md)、[C4](../../docs/zh/rd/c4/)、[User-Story-Map](../../docs/zh/product/User-Story-Map.md)（触发表见 [living-docs](../skills/developer/references/living-docs.md)）。

硬约束见 [architecture rule](../rules/architecture.mdc)。XP 实践映射见 [extreme-programming](../skills/developer/references/extreme-programming.md)。UX 细则见 [apple-minimal-ux](../skills/developer/references/apple-minimal-ux.md)；官方文档：[Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)。

## 项目代码风格

### NestJS / TypeScript（后端）

**包结构**：
```
services/server/src/
├── domain/              # 领域模型、仓储接口
├── application/         # 用例 / 应用服务
├── infrastructure/      # 持久化、外部 HTTP、配置
└── presentation/        # Controller、Guard、Filter
```

**关键规范**：
- 工厂方法 / 明确不变量；行为在领域对象内（充血）
- Repository / Gateway 接口在 `domain/`（禁止新 `*Port` / `domain/port`）
- 变量与方法命名对齐 [领域术语表](../../docs/Glossary.md) Preferred Term
- 客户端只打 Nest `/api/v1`；Explore AI 经 BFF，不直连上游

**示例 - 应用服务编排**：
```typescript
async rankExplore(userId: string, candidates: string[]): Promise<string[]> {
  return this.recommendationClient.rankExplore({ userId, candidates });
}
```

### Next.js / Emotion（Web）

**包结构**：
```
apps/web/src/
├── domain/
├── application/
├── infrastructure/adapters/api/
└── presentation/components/
```

**关键规范**：
- Emotion 样式；Instagram + Apple 视觉一致
- 状态优先 Redux Toolkit；集合工具优先 lodash
- 命名对齐 Glossary Preferred Term + clean-code-naming
- API 经 `ApiClientAdapter` / `*ApiAdapter`，基址 `NEXT_PUBLIC_API_URL`

**示例 - API adapter**：
```typescript
export class AiApiAdapter {
  constructor(private apiClient: IApiClient) {}

  async postExploreChatStream(
    messages: AiChatMessage[],
    onChunk: (text: string) => void,
  ): Promise<void> {
    const res = await this.apiClient.postStream("/ai/explore/chat/stream", { messages });
    // parse SSE data: {"text":"..."}
  }
}
```

### Expo / React Native（Mobile）

同样 Clean Architecture + repository adapters；`EXPO_PUBLIC_API_URL` → Nest。

## 实现流程

1. **XP**：先对齐客户价值 / Jira AC；小步切片可合并
2. **BDD**：用 Given-When-Then 澄清行为（对齐 Jira AC）
3. **TDD**：Red → Green → Refactor；测试名 `should_expected_when_condition`
4. **DDD**：规则落在 domain；use case 只编排
5. **领域命名**：变量/方法用术语表 Preferred Term，再套 Clean Code 形式
6. **UI/UX**：Apple HIG + Instagram + Emotion（见 apple-minimal-ux）
7. **分支 / Commit / PR / Jira**：`<type>/<slug>` + Chain PR；沿用 [developer](../skills/developer/SKILL.md) §6 与 [Product Owner](../skills/product-owner/SKILL.md)
8. **运行测试 / CI 绿** → 再按上述规范提交

## 极简原则

- 每次改动最小化（Small Releases）
- YAGNI / Simple Design：不添加无关功能或投机抽象
- 不写冗余注释
- 保持代码简洁；绿后持续 Refactor
