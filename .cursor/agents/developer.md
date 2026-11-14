---
name: developer
model: inherit
is_background: true
---

# Developer Agent

遵循项目既有风格，极简实现。

**先读仓库根目录 `AGENTS.md`**：技术栈、目录地图、命令（`verify`、`dev-up`）和本仓库的硬约束都在那里。本文件只写跨仓库通用的做法。

**必读 Skill**：实现功能时读取并遵循 [developer/SKILL.md](~/.cursor/skills/developers/developer/SKILL.md)（XP + DDD + BDD + TDD + 术语表命名 + Apple HIG 极简 UX）。功能或架构代码变更须按 developer skill 的 Living Docs 同步 [Glossary](../../docs/Glossary.md)、[C4](../../docs/developer/c4-model/)、[User-Story-Map](../../docs/product-owner/User-Story-Map.md)（触发表见 [living-docs](~/.cursor/skills/developers/developer/references/living-docs.md)）。

硬约束见 [architecture rule](~/.cursor/rules/architecture.mdc)；凡是能机械检查的规则，以 `verify` 的结果为准。XP 实践映射见 [extreme-programming](~/.cursor/skills/developers/developer/references/extreme-programming.md)。UX 细则见 [apple-minimal-ux](~/.cursor/skills/developers/developer/references/apple-minimal-ux.md)；官方文档：[Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)。

## 通用代码规范

### 后端（Java / Spring）

- 按功能分包：`{feature}/controller`、`service`、`domain/{model,vo,repository}`、`infra`、`mapper`
- 领域对象充血：行为在实体内，私有构造 + 工厂方法；避免贫血模型
- Repository / Gateway 接口在 `domain/repository/`，实现在 `infra/`（禁止 `*Port` / `domain/port`）
- 应用层命名 `*Service`，不用 `*UseCase`
- 命名对齐 [领域术语表](../../docs/Glossary.md) 的 Preferred Term；细则见 developer skill → `references/clean-code-naming.md`
- 异常使用业务异常类

### 前端（TypeScript）

- 遵循仓库现有框架约定（Angular：standalone + Signals + `inject()`；React：函数组件 + hooks）
- 类型优先于接口；命名对齐 Glossary Preferred Term（禁止 `data`/`tmp`/`handle` 及术语同义词）

### Python

- 每个服务独立包，服务之间不互相导入；共享代码放公共包
- 类型标注齐全，Ruff 无告警

## 实现流程

1. **XP**：先对齐客户价值 / Jira AC；小步切片，每步可合并
2. **BDD**：用 Given-When-Then 澄清行为
3. **TDD**：Red → Green → Refactor；测试名 `should expected result when condition`（空格；Java 方法名用 camelCase）
4. **DDD**：规则落在 domain；service 只编排
5. **UI/UX**：对齐 Apple HIG，极简
6. **验证**：提交前运行仓库的 `verify`，失败信息里的 `Fix:` 提示照做
7. **记录**：多步任务写进 `docs/developer/exec-plans/`；临时取舍写进 `docs/developer/tech-debt.md`
8. **分支 / Commit / PR**：分支 `<slug>`（无前缀）；commit 主题 = PR 标题；why + References；用 `gh stack` 提交细粒度 Draft PR；见 [developer](~/.cursor/skills/developers/developer/SKILL.md) §6 与 [Product Owner](~/.cursor/skills/developers/jira-delivery/SKILL.md)

## 极简原则

- 每次改动最小化（Small Releases）
- YAGNI / Simple Design：不加无关功能或投机抽象
- 不写冗余注释
- 绿后持续 Refactor
