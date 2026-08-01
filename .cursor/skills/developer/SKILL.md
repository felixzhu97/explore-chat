---
name: developer
description: Feature development for WhatsFeed — XP, DDD, BDD, TDD, Glossary naming, Apple HIG + Instagram minimal UX (Emotion), living docs sync (C4 / Glossary / User Story Map), and mandatory commit/PR standards (why body + References from official docs and research). Use when implementing features, writing tests, committing, opening PRs, UI work, or DDD/TDD/BDD/XP/clean-code tasks.
---

# Developer

**XP + DDD + BDD + TDD + minimal Clean Code.** Smallest correct change. UI: Apple HIG + Instagram-consistent + Emotion.

**Every** commit and PR must follow §6 (project standards). **Every** Jira ticket must follow [Product Owner](../product-owner/SKILL.md). Do not invent alternate formats.

## Hard constraints

1. Layers: [architecture](../../rules/architecture.mdc) — `presentation → application → domain ← infrastructure`
2. No new `domain/port`, hexagonal `adapter/in|out` packages, or `*Port` suffixes (legacy `*ApiAdapter` OK)
3. Tests: `should_expectedResult_when_condition`
4. Names: Glossary [Preferred Term](../../../docs/Glossary.md) + [clean-code-naming](references/clean-code-naming.md)
5. UI: Apple HIG + Instagram style + Emotion + [apple-minimal-ux](references/apple-minimal-ux.md)
6. Prefer Redux Toolkit and lodash where they clarify client/state code
7. **Commit / PR / Jira / branches**: always reuse §6 + [Product Owner](../product-owner/SKILL.md); branch `<type>/<slug>` (type matches commit); References = official docs + research
8. **XP**: follow [extreme-programming](references/extreme-programming.md) — Simple Design / YAGNI, CI green, small releases, customer / AC feedback
9. **Living docs**: when the change hits the trigger matrix, update Glossary, C4, and/or User Story Map in the **same PR** — see §4 and [living-docs](references/living-docs.md)
10. Clients call NestJS only — never browser→Python / browser→explore-ai

## Workflow

```
XP (Customer + Small steps) → BDD → TDD → DDD (+ Clean Code) → Commit/PR (+ Jira via Product Owner skill)
(+ Apple HIG / Instagram Emotion UI when touching presentation)
```

Detail: [extreme-programming](references/extreme-programming.md)

### 1. Testing — BDD then TDD

Detail: [testing](references/testing.md)

**BDD:** one scenario, business language, Given / When / Then (outcomes, not framework calls). Align terms with Glossary.

**TDD:** Red → Green → Refactor; AAA; no private-method tests; no I/O in unit tests.

| | Rule |
|--|------|
| Name | `should_expectedResult_when_condition` |
| Pyramid | Unit ~70% / Integration ~20% / E2E ~10% (few critical journeys) |
| Scope | Behavior, not implementation |
| Doubles | Fake/Stub for repos; Mock only when verifying interaction |
| Avoid | Over-mocking, weak asserts, ice-cream-cone E2E, ignored tests |

### 2. DDD

| Concept | Package |
|---------|---------|
| Entity / Aggregate | `domain/` — factory + rich behavior |
| Value Object | `domain/` — immutable types |
| Repository / Gateway | `domain/` interface → impl in `infrastructure/` |
| Use Case / App service | `application/` — orchestration only |
| Presentation | Nest controllers / React screens — no business rules |

Detail: [ddd-rich-model](references/ddd-rich-model.md)

### 3. Naming

Glossary Preferred Term first → Clean Code form. No synonyms (`Conversation` vs `ChatSession`). New concept → update glossary in the same change.

Detail: [clean-code-naming](references/clean-code-naming.md)

### 4. Living docs sync

When a change matches the trigger matrix, update the matching living docs in the **same PR** (same commit or a docs commit on the same branch). Unmatched rows → N/A. Do not skip with “optional” or “later”.

| Document | Path |
|----------|------|
| Glossary | [docs/Glossary.md](../../../docs/Glossary.md) |
| C4 | [docs/zh/rd/c4/](../../../docs/zh/rd/c4/) (EN: [docs/en/rd/c4/](../../../docs/en/rd/c4/)) |
| User Story Map | [docs/zh/product/User-Story-Map.md](../../../docs/zh/product/User-Story-Map.md) |

| Change | Must update |
|--------|-------------|
| New/changed Preferred Term, module package, route, API prefix, business concept | Glossary |
| New module/subdomain, container boundary, external system, deploy topology, front/back component structure | Matching C4 layer(s); cross-layer → multiple diagrams |
| New user-visible capability, delivery status (Delivered / In Progress / Future), primary nav add/remove | User Story Map |
| Pure tests / pure styling / no product or architecture semantics | None (N/A) |

Flow: implement code → apply trigger matrix → update docs → reflect in commit/PR. Prefer editing `.puml`; if PlantUML is unavailable, note in the PR that PNGs are pending render.

Detail + examples: [living-docs](references/living-docs.md)

### 5. UI — Apple HIG + Instagram + Emotion

Official: [HIG](https://developer.apple.com/design/human-interface-guidelines/). Clarity, deference, one primary action; no decorative noise. Match Instagram-style patterns already in `apps/web`. Style with Emotion.

Detail: [apple-minimal-ux](references/apple-minimal-ux.md)

### 6. Branches / Commit / PR (mandatory every time)

#### Branch naming

**Prefix = change type** (same set as commit types). Do **not** default every branch to `feat`.

| Type | Pattern | Example |
|------|---------|---------|
| feat | `feat/<slug>` | `feat/explore-ai-bff` |
| fix | `fix/<slug>` | `fix/feed-pagination` |
| refactor | `refactor/<slug>` | `refactor/post-aggregate` |
| docs | `docs/<slug>` | `docs/glossary-feed` |
| test | `test/<slug>` | `test/explore-service` |
| chore | `chore/<slug>` | `chore/cursor-config-from-explore-ai` |
| perf | `perf/<slug>` | `perf/feed-cache` |
| ci | `ci/<slug>` | `ci/turbo-cache` |

Allowed types: `feat` | `fix` | `refactor` | `docs` | `test` | `chore` | `perf` | `ci`

Rules:

- Branch prefix **must** match the primary change type
- Always use `<type>/<slug>` with a kebab-case slug that describes the change
- With a Jira ticket: still use `<type>/<slug>` — put the issue key only in commit/PR body (`Jira: https://…/AI-xxx`), not in the branch name
- Do **not** use `feature/` for new branches
- Do **not** embed `AI-<key>` in new branch names
- Long-lived integration line: `main` (do not push work directly except via PR)

#### Branch / PR flow (Chain PRs)

```
main
 └── feat/explore-ai-bff              # PR #1 → base: main
      └── fix/explore-stream-headers  # PR #2 → base: feat/explore-ai-bff
```

1. First branch in a chain: create from `main`; PR **base** = `main`
2. Follow-up work in the same chain: create from the **previous branch**; PR **base** = that branch (not `main`)
3. Standalone work with no dependency: `<type>/<slug>` from `main`, PR base = `main`

#### Commit message

**Always** use this format. No alternate layouts. Same as explore-ai: `type: subject` with **no** Conventional Commit scope (`feat(ai):` is wrong; use `feat:`).

1. One complete change per commit  
2. Subject ≤ 50 chars, imperative, no trailing period; form `type: subject` only (no `(scope)`)  
3. After the subject, add a **short why** (1–3 sentences); each Reference must corroborate a claim in that why  
4. Always add **References** (see priority below); PR body must use the **same** References links  
5. Never: `Co-authored-by`, `Made with`, emoji in subject, markdown `##` headings in PR body  

PR body (plain sections only, matching explore-ai): why paragraph → what paragraph → `Test plan:` → `References:` → `Jira:`

#### References priority (required)

Prefer **specific** pages, not homepages. Search the web in real time when needed.

| Priority | Source | Where to look |
|----------|--------|----------------|
| 1 | Project dependency official docs | [dependency-docs](references/dependency-docs.md) (**claim → URL** catalog; every row corroborates why) |
| 2 | Vendor / lab **research** + open-source | [business-tech-analysis sources](../business-tech-analysis/references/sources.md) (research hubs + GitHub) |
| 3 | **arXiv** papers (abs page) | [arXiv](https://arxiv.org/) — when the change cites a method/paper |
| 4 | Standards / HIG / Google ecosystem | **UI design:** [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) + Instagram-consistent Emotion patterns in `apps/web`. **Google ecosystem** (eng practices, style guides, SRE, AI, Cloud — not Material UI) — [dependency-docs](references/dependency-docs.md) § Google Ecosystem |

**Corroborate the why (required):** each Reference URL must support a **concrete claim** in the commit/PR why paragraph (latency, reliability, cost, naming, review quality, UI system, etc.). Prefer the page that states the practice. Do not paste org/product homepages as decoration. Pick rows from [dependency-docs](references/dependency-docs.md) whose **Claim in why** matches the why text.

- Bad: why says “reduce cold-start latency for chat UX” + link to a marketing landing page with no latency guidance.
- Good: why says “treat latency as a golden signal and avoid idle scale-to-zero for interactive chat” + [SRE Book — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/).

Avoid: random blogs, undated tweets, marketing landing pages (unless no primary source exists — then note why).

#### AI / model reference set (required when relevant)

For model, benchmark, ASR / TTS / LLM, RAG, agent, or algorithm-related changes, the reference set must be more specific than a generic docs link.

When these source types exist, include all of them in both the commit and the PR:

1. One **academic** source, preferably the arXiv abs page or official paper page
2. One **Hugging Face** model, collection, or paper page
3. One official **vendor blog**, release note, or announcement page
4. The upstream **GitHub repository** or official implementation docs when they are the implementation source

For framework or dependency-only changes, keep using official docs first. For AI / model changes, prefer the full reference set above over a single docs link.

```
<type>: <short description>

<why: brief motivation for this change>

References:
- [Title](URL)
```

Types: `feat` | `fix` | `refactor` | `docs` | `test` | `chore` | `perf` | `ci`

Example:

```
 docs: add Qwen3-ASR reference guidance to PR skill

Contributors need a consistent citation set for model-related changes so commits and PRs point to the paper, release notes, distribution page, and upstream implementation.

References:
- [Qwen3-ASR Technical Report](https://arxiv.org/abs/2601.21337)
- [Qwen3-ASR - a Qwen Collection](https://huggingface.co/collections/Qwen/qwen3-asr)
- [Qwen3-ASR & Qwen3-ForcedAligner is Now Open Sourced](https://qwen.ai/blog?id=qwen3asr)
- [QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)
```

PR body (no markdown headings — plain sections only):

```
<why paragraph>

<what paragraph>

Test plan:
- [ ] …

References:
- [Title](URL)

Jira:
- https://felixzhu.atlassian.net/browse/AI-XXX
```

PR **References** must match the commit References (same links). No `Made with` / `Co-authored-by` footers.

## Checklist

- [ ] Customer / AC outcome clear (XP Planning Game + On-site Customer)
- [ ] BDD scenario / AC covered
- [ ] TDD; test name `should_…_when_…`; Refactor while green
- [ ] YAGNI / Simple Design — no speculative extras
- [ ] Domain holds rules; use case orchestrates
- [ ] Glossary Preferred Terms; Glossary updated per trigger matrix (or N/A)
- [ ] C4 updated per trigger matrix (or N/A); PNGs refreshed or PR notes pending render
- [ ] User Story Map updated per trigger matrix (or N/A)
- [ ] UI (if any): HIG + Instagram + Emotion
- [ ] Branch: `<type>/<slug>` (type matches commit); Chain PR base correct
- [ ] Commit: subject + why + References (official/research)
- [ ] PR: plain body + same References + Jira link; chain base; CI green
- [ ] Jira (if any): [Product Owner](../product-owner/SKILL.md) template followed

## Related

| Need | Where |
|------|-------|
| Extreme Programming | [extreme-programming](references/extreme-programming.md) |
| Living docs sync | [living-docs](references/living-docs.md) |
| Architecture | [architecture rule](../../rules/architecture.mdc) |
| Glossary | [Glossary](../../../docs/Glossary.md) |
| C4 model | [zh C4](../../../docs/zh/rd/c4/README.md) |
| User Story Map | [User-Story-Map](../../../docs/zh/product/User-Story-Map.md) |
| Testing core | [testing](references/testing.md) |
| Business / tech strategy | [business-tech-analysis](../business-tech-analysis/SKILL.md) |
| Research / OSS watchlist | [sources.md](../business-tech-analysis/references/sources.md) |
| Product Owner | [Product Owner](../product-owner/SKILL.md) |
