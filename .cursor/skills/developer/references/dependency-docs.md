# Project Dependency Reference

**Why-corroboration catalog.** Every row is a `Claim in why` you can paste or adapt into a commit/PR why paragraph, plus an official URL that supports that claim. Prefer specific docs pages over marketing homepages.

When adding a dependency: add a row with claim + deep link — never library name alone.

For lab research / open-source hubs and open models, also use [business-tech-analysis sources](../../business-tech-analysis/references/sources.md) and arXiv abs pages.

## AI / Model reference set

For model-driven changes such as ASR, TTS, LLM, RAG, agent, benchmark, or algorithm updates, do not stop at a single docs link.

When available, use this full reference set in both the commit and the PR:

1. One **academic** source, preferably the arXiv abs page or official paper page
2. One **Hugging Face** model, collection, or paper page
3. One official **vendor blog**, release note, or announcement page
4. The upstream **GitHub repository** or official implementation docs when they are the implementation source

Example (claims → URLs):

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Cite the ASR method paper for Qwen3-ASR work | Qwen3-ASR Technical Report | [arXiv:2601.21337](https://arxiv.org/abs/2601.21337) |
| Point reviewers at model cards / collection | Qwen3-ASR HF collection | [Hugging Face collection](https://huggingface.co/collections/Qwen/qwen3-asr) |
| Cite official release notes | Qwen3-ASR blog | [qwen.ai blog](https://qwen.ai/blog?id=qwen3asr) |
| Point at upstream implementation | QwenLM/Qwen3-ASR | [GitHub](https://github.com/QwenLM/Qwen3-ASR) |

Open models (Qwen / DeepSeek / 智谱 GLM / Intern / Llama / Gemma / Mistral): [Open models](../../business-tech-analysis/references/sources.md#open-models). Research hubs: [Open-source & research hubs](../../business-tech-analysis/references/sources.md#open-source--research-hubs-required). Speech & image: [Open-source speech & image](../../business-tech-analysis/references/sources.md#open-source-speech--image).

## Frontend (Web / Admin)

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| App Router / RSC patterns for web | Next.js | [Next.js docs](https://nextjs.org/docs) |
| Component model and hooks | React | [React docs](https://react.dev) |
| CSS-in-JS for Instagram-consistent UI | Emotion | [Emotion docs](https://emotion.sh/docs/introduction) |
| Predictable client state | Redux Toolkit | [Redux Toolkit](https://redux-toolkit.js.org) |
| Lodash helpers instead of ad-hoc utils | lodash | [lodash docs](https://lodash.com/docs) |
| Type-check frontend with TypeScript | TypeScript | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) |
| Lint TS/JS with project ESLint rules | ESLint | [ESLint docs](https://eslint.org/docs/latest/) |
| Unit-test frontend with Vitest | Vitest | [Vitest guide](https://vitest.dev/guide/) |
| Install and run frontend scripts with pnpm | pnpm | [pnpm CLI](https://pnpm.io/cli/install) |
| Monorepo task orchestration | Turborepo | [Turborepo docs](https://turbo.build/repo/docs) |

## Mobile

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Expo app / native modules workflow | Expo | [Expo docs](https://docs.expo.dev) |
| Cross-platform UI primitives | React Native | [React Native docs](https://reactnative.dev/docs/getting-started) |
| Shared mobile client state | Redux Toolkit | [Redux Toolkit](https://redux-toolkit.js.org) |

## Backend (NestJS)

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Nest modules / DI / controllers for BFF | NestJS | [NestJS docs](https://docs.nestjs.com) |
| Type-safe DB access / migrations | Prisma | [Prisma docs](https://www.prisma.io/docs) |
| Relational store for users / posts | PostgreSQL | [PostgreSQL docs](https://www.postgresql.org/docs/) |
| Cache / rate-limit / sessions | Redis | [Redis docs](https://redis.io/docs/) |
| Realtime chat / presence | Socket.IO | [Socket.IO docs](https://socket.io/docs/v4/) |
| OpenAPI for Nest endpoints | NestJS OpenAPI | [OpenAPI](https://docs.nestjs.com/openapi/introduction) |
| Unit / integration tests on Node | Vitest | [Vitest guide](https://vitest.dev/guide/) |
| Proxy Explore AI via Nest BFF (not browser→explore-ai) | Explore AI BFF | [explore-ai api.md Service-to-service](https://github.com/felixzhu97/explore-ai/blob/main/docs/developer/api.md) |

## Python microservices

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Fast HTTP APIs for RAG / recommendation | FastAPI | [FastAPI](https://fastapi.tiangolo.com) |
| Background / async workers | Celery | [Celery](https://docs.celeryq.dev) |
| Vector search for RAG | Qdrant | [Qdrant docs](https://qdrant.tech/documentation/) |
| Local LLM inference API | Ollama | [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md) |

## Build & Tooling

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Install workspace packages with pnpm | pnpm | [pnpm](https://pnpm.io) |
| Pipeline tasks across apps/packages | Turborepo | [Turborepo](https://turbo.build/repo/docs) |
| Git hook runner for local quality gates | Husky | [Husky](https://typicode.github.io/husky/) |
| Run linters only on staged files | lint-staged | [lint-staged](https://github.com/lint-staged/lint-staged#readme) |
| Containerize local infra / deploy | Docker | [Docker docs](https://docs.docker.com) |

## Learning References

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Use evolutionary design / refactoring vocabulary | Martin Fowler | [martinfowler.com](https://martinfowler.com/) |
| Cite Clean Code / craftsmanship practices | Robert C. Martin | [cleancoder.com](https://blog.cleancoder.com/) |
| Cite XP / manifesto values for delivery trade-offs | Agile Manifesto | [agilemanifesto.org](https://agilemanifesto.org/) |
| Cite academic papers (abs page) | arXiv | [arxiv.org](https://arxiv.org/) |
| Cite model cards / collections / spaces | Hugging Face | [huggingface.co](https://huggingface.co/) |
| Google eng / SRE / style / Cloud claim rows | Google Ecosystem | [§ Google Ecosystem](#google-ecosystem) below |

## Google Ecosystem

**Full Google ecosystem** (engineering, SRE, AI/research, Android, Cloud) — not Cloud-only. **Product UI stays Apple HIG + Instagram/Emotion** (do not cite Material Design for product UI in this repo). Pick the row whose claim matches the commit/PR why. Prefer deep links over homepages.

### Engineering practices & style

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Code review / CL quality | Google eng-practices | [Code Review](https://google.github.io/eng-practices/review/) |
| TypeScript style (frontend when relevant) | Google TypeScript Style Guide | [tsguide.html](https://google.github.io/styleguide/tsguide.html) |
| JavaScript style (frontend when relevant) | Google JavaScript Style Guide | [jsguide.html](https://google.github.io/styleguide/jsguide.html) |
| Style guide index (other languages) | Google Style Guides | [styleguide index](https://google.github.io/styleguide/) |

### SRE & production

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| SRE practices / reliability culture | sre.google | [Site Reliability Engineering](https://sre.google/) |
| Latency / traffic / errors / saturation (golden signals) | SRE Book | [Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) |
| Eliminating toil / automation | SRE Book | [Eliminating Toil](https://sre.google/sre-book/eliminating-toil/) |

### Android / mobile (when relevant)

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Android app architecture / quality | Android Developers | [Guide to app architecture](https://developer.android.com/topic/architecture) |

### AI & research (complements arXiv / Hugging Face sets)

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Gemini / Google AI developer APIs | ai.google.dev | [Google AI for Developers](https://ai.google.dev/) |
| Google Research publications | research.google | [research.google](https://research.google/) · [Publications](https://research.google/pubs/) |

### Google Cloud (subset of ecosystem)

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Secure / resilient / performant / cost-effective topology | Well-Architected Framework | [Architecture Framework](https://docs.cloud.google.com/architecture/framework) |
| Reliability as a design pillar | Well-Architected Reliability | [Reliability pillar](https://docs.cloud.google.com/architecture/framework/reliability) |
| Performance optimization | Well-Architected Performance | [Performance optimization](https://docs.cloud.google.com/architecture/framework/performance-optimization) |
| Cost / right-sizing | Well-Architected Cost | [Cost optimization](https://docs.cloud.google.com/architecture/framework/cost-optimization) |
| SLOs, ops readiness, reduce toil | Well-Architected Ops | [Operational excellence](https://docs.cloud.google.com/architecture/framework/operational-excellence) |
| Scalable / resilient app patterns (incl. golden signals) | Cloud Architecture Center | [Scalable and resilient apps](https://docs.cloud.google.com/architecture/scalable-and-resilient-apps) |

## Design References

Product UI for this repo: **Apple HIG + Instagram-consistent Emotion** (not Material).

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Product UI follows Apple design principles | Apple Human Interface Guidelines | [Apple Design](https://developer.apple.com/design/) |
| Guidelines hub for HIG topics | Apple HIG | [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) |
| Match Instagram-style patterns already in the app | WhatsFeed web screens | Prefer existing `apps/web` patterns over inventing a new visual language |
| Style components with Emotion | Emotion | [Emotion docs](https://emotion.sh/docs/introduction) |

## UX References

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Clarity and layout deference in product UI | Apple HIG Layout | [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| Typography hierarchy | Apple HIG Typography | [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| Color system and contrast | Apple HIG Color | [Color](https://developer.apple.com/design/human-interface-guidelines/color) |
| Purposeful motion | Apple HIG Motion | [Motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| Accessibility for inclusive UI | Apple HIG Accessibility | [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |

## Jira

| Claim in why | Artifact | Official doc |
|--------------|----------|--------------|
| Track WhatsFeed / ExploreAI shared backlog in Jira Cloud | Jira site | [felixzhu.atlassian.net](https://felixzhu.atlassian.net) |
| ExploreAI project backlog / SP (BFF / AI stories) | Project AI | [AI project](https://felixzhu.atlassian.net/projects/AI) |
