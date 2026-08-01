# Architecture Vision（Phase A）

> 负责人：Product Owner  
> 基线：WhatsFeed as-is  
> 相关：[Architecture Principles](./architecture-principles.md) · [Stakeholders](./stakeholders.md)

## 目的

界定 WhatsFeed 业务架构的范围、约束与价值主张，作为 Phase B（Capability / Value Stream）的上游 Deliverable。不替代解决方案或技术架构（见 [C4](../../developer/c4-model/)）。

## 业务驱动因素（as-is）

- 终端用户需要低摩擦的信息流、探索、私信与通话体验
- 创作者需要可靠发帖与媒体呈现（含视频封面）
- 管理员需要基础运营与内容安全入口
- 协作方需要 Capability / Value Stream 与 User Story Map 对齐的交付语言

## 范围

| 范围内（Business Architecture）                                   | 范围外                                                    |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| 身份、通讯、内容、发现、互动、通话、运营、AI 代理等 L1 Capability | Application / Data / Technology Catalog（Phase C/D → C4） |
| 三条 as-is Value Stream 及 Stage                                  | Phase E–H（Roadmap / Contract / Compliance 全套）         |
| Stakeholder concerns 与 Organization Mapping（light）             | L2 Capability 抄写 User Story（见 User Story Map）        |

## 约束

- Web / Mobile / Admin 与 Nest API 分离交付（拓扑见 C4）
- 生产 MVP 以 PostgreSQL + Redis 为必需数据路径；宽表/搜索等为可选扩展
- Explore AI 仅经 Nest BFF 暴露，客户端不得持有上游服务密钥

## 价值主张（as-is）

沿 Value Stream，用户可获得：可消费的信息流与探索、实时私信与通话、经 BFF 的 AI 能力；Product Owner 用 Business Capability 与 [User Story Map](../User-Story-Map.md) 对齐交付状态。

## Stakeholders（摘要）

见 [Stakeholders Catalog](./stakeholders.md) 与 [Stakeholder Map](./stakeholder-map.md)。主要 concerns：可用性、创作可靠、通讯实时、运营可控、AI 边界清晰。

## Architecture Principles

见 [Architecture Principles](./architecture-principles.md)。
