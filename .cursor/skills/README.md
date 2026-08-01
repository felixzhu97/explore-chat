# Skills 索引

本目录包含 WhatsFeed 项目的 Skills。Rules（始终遵守的薄约束）只有 [`.cursor/rules/architecture.mdc`](../rules/architecture.mdc)。

## Rules vs Skills

| | Rules | Skills |
|--|-------|--------|
| 何时加载 | alwaysApply | Agent 按 description 按需读取 |
| 本仓库 | 唯一 `architecture.mdc` | 下方按任务触发 |

## Skills

| Skill | 描述 |
|-------|------|
| [developer](./developer/) | **主技能**：XP / DDD / BDD / TDD / 术语表 / Apple HIG + Instagram 极简 UX / Commit·PR / 测试核心 |
| [business-tech-analysis](./business-tech-analysis/) | 商业动向 + 技术分析 → 技术商业建议（需实时检索） |
| [product-owner](./product-owner/) | Product Owner：用户故事、验收标准、DoD、Jira MCP |

## 刻意未从 explore-ai 拷贝

- `angular-developer` / `angular-new-app` — 本仓为 Next.js + Expo，非 Angular
- `spring-ai` — 本仓 AI 经 NestJS + Ollama / explore-ai BFF / Python RAG，非 Spring AI

## 如何使用

- 日常开发 / 测试 / 提交 / UX / XP 节奏 → `developer`
- 商业动向 / 竞品 / GTM → Agent `business-analyst`（skill：`business-tech-analysis`）
- 前沿研究 / 论文 / 模型趋势 → Agent `tech-analyst`（skill：`business-tech-analysis`）
- 写用户故事 / 梳理待办 / 建 Jira 票 → `product-owner`
