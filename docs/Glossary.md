# WhatsFeed Domain Glossary

Preferred Terms for ubiquitous language. Update this file in the **same PR** when you introduce or rename a business concept, module, route, or API prefix. See [living-docs](../.cursor/skills/developer/references/living-docs.md).

| Preferred Term (EN) | 中文 | Notes / API / Module |
|---------------------|------|----------------------|
| Feed | 信息流 | Home timeline; GraphQL + REST |
| Explore | 探索 | Discovery grid; `GET /api/v1/posts/explore` |
| Post | 帖子 | Core content aggregate |
| Reel | 短视频 | Reels surface |
| Story | 快拍 | Ephemeral status |
| Session (IM) | 会话 | Chat / messaging |
| Explore AI BFF | Explore AI 网关 | Nest `/api/v1/ai/explore/*` → explore-ai |
| Ollama Chat | 本地对话 | Nest `/api/v1/ai/chat` |
| Recommendation | 推荐服务 | `services/recommendation` |
| Vision | 视觉审核 | `services/vision` |
| RAG | 检索增强 | `services/rag` + Qdrant |
| Media Gen | 媒体生成 | `services/media-gen` |

## Maintenance

1. Add a row before shipping a new Preferred Term.
2. Use the English Preferred Term in TypeScript identifiers and tests.
3. Keep synonyms out of new code (document legacy aliases in Notes if needed).
