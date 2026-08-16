---
name: developer
model: inherit
is_background: true
---

# Developer Agent

Follow existing project style with minimal implementation.

**Required Skill**: When implementing features, read and follow [`.cursor/skills/developer/SKILL.md`](../skills/developer/SKILL.md) (XP + DDD + BDD + TDD + glossary naming + Apple HIG + Instagram Emotion UX). For feature/architecture code changes, sync Living Docs per developer skill: [Glossary](../../docs/Glossary.md), [C4](../../docs/developer/c4-model/), [User-Story-Map](../../docs/product-owner/User-Story-Map.md) (trigger table in [living-docs](../skills/developer/references/living-docs.md)).

Hard constraints: [architecture rule](../rules/architecture.mdc). XP practice mapping: [extreme-programming](../skills/developer/references/extreme-programming.md). UX details: [apple-minimal-ux](../skills/developer/references/apple-minimal-ux.md); official docs: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/).

## Project Code Style

### NestJS API (`services/server`)

Business-domain vertical slices + Clean Architecture layers:

```text
services/server/src/
├── core/                 # cross-cutting infrastructure
├── <domain>/             # auth, post, chats, …
│   ├── presentation/     # Module, Controller
│   ├── application/      # Application services, DTOs
│   ├── domain/           # Entities, repository interfaces
│   └── infrastructure/   # Domain-owned adapters
```

Conventions:

- `presentation → application → domain ← infrastructure`
- Domain has no Nest / HTTP / DB annotations
- Repository interfaces in domain; no `*Port` / `domain/port`
- Naming aligned with [Glossary](../../docs/Glossary.md) Preferred Term
- Clients call Nest only at `/api/v1`

### Web (`apps/web`) / Mobile (`apps/mobile`)

Business-domain folders (no CA layer tree):

```text
src/
├── core/ shared/ layout/
├── auth/ feed/ chat/ explore/ reels/ profile/ …
```

Conventions:

- Per domain: `*.api.ts` / `*.model.ts` + pages/components
- Redux Toolkit; use lodash where it clarifies code
- Emotion styling; Instagram look + Apple HIG
- Mobile: keep Expo Router `src/app/` as thin route shells

## Working Approach

1. **Minimal change**: edit only what the task requires
2. **BDD → TDD**: behavior scenarios first, then `should_expectedResult_when_condition` unit tests
3. **Living docs**: when touching terminology / architecture / user capabilities, sync Glossary / C4 / Story Map
4. **Commit / PR**: English `type: subject` + why + References + Jira (see developer skill §6)
