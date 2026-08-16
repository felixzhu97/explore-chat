---
name: developer
description: Feature development for this repo — XP, DDD, BDD, TDD, Glossary naming, Apple HIG minimal UX, living docs sync (C4 / Glossary / User Story Map), and mandatory commit/PR standards (why body + References from official docs and research). Use when implementing features, writing tests, committing, opening PRs, UI work, or DDD/TDD/BDD/XP/clean-code tasks.
---

# Developer

**XP + DDD + BDD + TDD + minimal Clean Code.** Smallest correct change. UI: Apple HIG + Instagram-consistent + Emotion.

**Every** commit and PR must follow §6 (project standards). **Every** Jira ticket must follow [Product Owner](../product-owner/SKILL.md). Do not invent alternate formats.

Stack (WhatsFeed): NestJS API, Next.js web, Expo mobile, Emotion UI, Redux Toolkit on clients. Clients call **only** Nest `/api/v1`.

## Hard constraints

1. Layers: [architecture](../../rules/architecture.mdc) — Nest: `presentation → application → domain ← infrastructure` inside domain folders; web/mobile: business-domain folders (no CA layer trees)
2. No `domain/port`, hexagonal `adapter/in|out` packages, or `*Port` suffix in new code
3. Tests: `should_expectedResult_when_condition` (TypeScript); prefer behavior over implementation
4. Names: Glossary [Preferred Term](../../../docs/Glossary.md) + [clean-code-naming](references/clean-code-naming.md)
5. UI: Apple HIG + Instagram-consistent + Emotion + [apple-minimal-ux](references/apple-minimal-ux.md)
6. Prefer Redux Toolkit and lodash on clients where they clarify state/collections
7. **Commit / PR / Jira / branches**: always reuse §6 + [Product Owner](../product-owner/SKILL.md); branch `<type>/<slug>`; References = official docs + research
8. **XP**: follow [extreme-programming](references/extreme-programming.md) — Simple Design / YAGNI, CI green, small releases, customer / AC feedback
9. **Living docs**: when the change hits the trigger matrix, update Glossary, C4 `.puml`, and/or User Story Map in the **same PR** — see §4 and [living-docs](references/living-docs.md)
10. Clients never call Python microservices or explore-ai directly — only Nest

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

|         | Rule                                                            |
| ------- | --------------------------------------------------------------- |
| Name    | `should_expectedResult_when_condition`                          |
| Pyramid | Unit ~70% / Integration ~20% / E2E ~10% (few critical journeys) |
| Scope   | Behavior, not implementation                                    |
| Doubles | Fake/Stub for repos; Mock only when verifying interaction       |
| Avoid   | Over-mocking, weak asserts, ice-cream-cone E2E, ignored tests   |

### 2. DDD

| Concept              | Nest path (per business domain)                                                             |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Entity / Aggregate   | `<domain>/domain/` — rich behavior where it pays off                                        |
| Value Object         | `<domain>/domain/` — immutable types                                                        |
| Repository / Gateway | interface in `<domain>/domain/` → adapter in `<domain>/infrastructure/` or `core/`          |
| Application service  | `<domain>/application/` — orchestration only                                                |
| Presentation         | `<domain>/presentation/` — Nest controllers / modules; no business rules                    |
| Web / Mobile UI      | `apps/web/src/<domain>/`, `apps/mobile/src/<domain>/` — screens + `*.api.ts` / `*.model.ts` |

Detail: [ddd-rich-model](references/ddd-rich-model.md)

### 3. Naming

Glossary Preferred Term first → Clean Code form. No synonyms (`Conversation` vs `ChatSession`). New concept → update glossary in the same change.

Detail: [clean-code-naming](references/clean-code-naming.md)

### 4. Living docs sync

When a change matches the trigger matrix, update the matching living docs in the **same PR** (same commit or a docs commit on the same branch). Unmatched rows → N/A. Do not skip with “optional” or “later”.

| Document       | Path                                                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Glossary       | [docs/Glossary.md](../../../docs/Glossary.md)                                                                                                              |
| C4             | [docs/developer/c4-model/](../../../docs/developer/c4-model/) (`.puml` source; refresh `png/` when PlantUML is available)                                  |
| User Story Map | [docs/product-owner/User-Story-Map.md](../../../docs/product-owner/User-Story-Map.md) (+ [user-stories/E\*.md](../../../docs/product-owner/user-stories/)) |

| Change                                                                                                     | Must update                                                   |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| New/changed Preferred Term, module package, route, API prefix, business concept                            | Glossary                                                      |
| New module/subdomain, container boundary, external system, deploy topology, front/back component structure | Matching C4 `.puml` layer(s); cross-layer → multiple diagrams |
| New user-visible capability, delivery status (已实现 / 进行中 / 规划中), primary nav add/remove            | User Story Map index + matching `user-stories/E*.md`          |
| Pure tests / pure styling / no product or architecture semantics                                           | None (N/A)                                                    |

Flow: implement code → apply trigger matrix → update docs → reflect in commit/PR. Prefer editing `.puml`; if PlantUML is unavailable, note in the PR that `png/` is pending render.

Detail + examples: [living-docs](references/living-docs.md)

### 5. UI — Apple HIG + Instagram + Emotion

Official: [HIG](https://developer.apple.com/design/human-interface-guidelines/). Clarity, deference, one primary action; no decorative noise. Match Instagram-style patterns already in `apps/web` / `apps/mobile`. Style with Emotion.

Detail: [apple-minimal-ux](references/apple-minimal-ux.md)

### 6. Branches / Commit / PR (mandatory every time)

#### Language

| Artifact                          | Language                                               |
| --------------------------------- | ------------------------------------------------------ |
| Branch name                       | English kebab-case (`feat/minimal-clean-prompts`)      |
| Commit subject + why + References | English                                                |
| PR title + body                   | English                                                |
| Jira **summary**                  | English (`As a … I want … so that …`)                  |
| Jira description                  | English (headings, prefixes, body, Definition of Done) |

Jira tickets follow [Product Owner](../product-owner/SKILL.md): business-facing, short descriptions.

#### Branch naming

**Prefix = change type**. Do **not** default every branch to `feat`.

| Type     | Pattern           | Example                       |
| -------- | ----------------- | ----------------------------- |
| feat     | `feat/<slug>`     | `feat/minimal-clean-prompts`  |
| fix      | `fix/<slug>`      | `fix/prompt-style-typo`       |
| refactor | `refactor/<slug>` | `refactor/chat-session-model` |
| docs     | `docs/<slug>`     | `docs/branch-naming-slug`     |
| test     | `test/<slug>`     | `test/rag-prompt-builder`     |
| chore    | `chore/<slug>`    | `chore/update-deps`           |
| perf     | `perf/<slug>`     | `perf/vector-search`          |
| ci       | `ci/<slug>`       | `ci/codeql-paths`             |

Allowed types: `feat` | `fix` | `refactor` | `docs` | `test` | `chore` | `perf` | `ci`

Rules:

- Always use `<type>/<slug>` with a kebab-case slug that describes the change
- With a Jira ticket: still use `<type>/<slug>` — put the issue key only in commit/PR body (`Jira: https://…/AI-xxx`), not in the branch name
- Do **not** use `feature/` for new branches (legacy only; CI still accepts it)
- Do **not** embed `AI-<key>` in new branch names
- Long-lived integration lines: `main`, `java-angular` (do not push work directly to these except via PR)

#### Branch / PR flow (Chain PRs)

```
main
 └── feat/minimal-clean-prompts     # PR #1 → base: main
      └── fix/prompt-style-typo     # PR #2 → base: feat/minimal-clean-prompts
```

1. First branch in a chain: create from `main` (or current integration line); PR **base** = `main`
2. Follow-up work in the same chain: create from the **previous branch**; PR **base** = that branch (not `main`)
3. Standalone work with no dependency: `<type>/<slug>` from `main`, PR base = `main`; use the type that matches the change

#### Commit message

**Always** use this format. No alternate layouts.

1. One complete change per commit
2. Subject ≤ 50 chars, imperative, no trailing period
3. After the subject, add a **short why** (1–3 sentences)
4. Always add **References** (see priority below)
5. Never: `Co-authored-by`, `Made with`, emoji in subject

#### References priority (required)

Prefer **specific** pages, not homepages. Search the web in real time when needed.

| Priority | Source                                  | Where to look                                                                                                                                                                                                                                                                                                |
| -------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1        | Project dependency official docs        | [dependency-docs](references/dependency-docs.md) (**claim → URL** catalog; every row corroborates why)                                                                                                                                                                                                       |
| 2        | Vendor / lab **research** + open-source | [market-tech-analysis sources](../market-tech-analysis/references/sources.md) (research hubs + GitHub)                                                                                                                                                                                                       |
| 3        | **arXiv** papers (abs page)             | [arXiv](https://arxiv.org/) — when the change cites a method/paper                                                                                                                                                                                                                                           |
| 4        | Standards / HIG / Google ecosystem      | **UI design:** [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) + Instagram-consistent Emotion patterns in `apps/web`. **Google ecosystem** (eng practices, style guides, SRE, AI, Cloud — not Material UI) — [dependency-docs](references/dependency-docs.md) § Google Ecosystem |

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
<short description>

<why: brief motivation for this change>

References:
- [Title](URL)
```

Example:

```
Add Qwen3-ASR reference guidance to PR skill

Contributors need a consistent citation set for model-related changes so commits and PRs point to the paper, release notes, distribution page, and upstream implementation.

References:
- [Qwen3-ASR Technical Report](https://arxiv.org/abs/2601.21337)
- [Qwen3-ASR - a Qwen Collection](https://huggingface.co/collections/Qwen/qwen3-asr)
- [Qwen3-ASR & Qwen3-ForcedAligner is Now Open Sourced](https://qwen.ai/blog?id=qwen3asr)
- [QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)
```

PR body (no markdown headings — plain sections only):

```
This change updates the commit and PR skill so model-related work cites a full reference set instead of a single generic docs link. It makes AI-facing changes easier to review and trace back to the paper, release notes, distribution page, and source implementation.

References:
- [Qwen3-ASR Technical Report](https://arxiv.org/abs/2601.21337)
- [Qwen3-ASR - a Qwen Collection](https://huggingface.co/collections/Qwen/qwen3-asr)
- [Qwen3-ASR & Qwen3-ForcedAligner is Now Open Sourced](https://qwen.ai/blog?id=qwen3asr)
- [QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)

Jira:
- https://felixzhu.atlassian.net/browse/AI-XXX
```

PR **References** must match the commit References (same links). Use the same official/research priority.

## Checklist

- [ ] Customer / AC outcome clear (XP Planning Game + On-site Customer)
- [ ] BDD scenario / AC covered
- [ ] TDD; test name `should_…_when_…`; Refactor while green
- [ ] YAGNI / Simple Design — no speculative extras
- [ ] Domain holds rules; use case orchestrates
- [ ] Glossary Preferred Terms; Glossary updated per trigger matrix (or N/A)
- [ ] C4 `.puml` updated per trigger matrix (or N/A); `png/` refreshed or PR notes pending render
- [ ] User Story Map updated per trigger matrix (or N/A)
- [ ] UI (if any): HIG + minimal
- [ ] Branch: `<type>/<slug>`; Chain PR base correct
- [ ] Commit: subject + why + References (official/research)
- [ ] Each References link maps to a claim in the why text (or N/A with note)
- [ ] PR: plain body + same References + Jira link; chain base; CI green
- [ ] Jira (if any): [Product Owner](../product-owner/SKILL.md) template followed

## Related

| Need                     | Where                                                           |
| ------------------------ | --------------------------------------------------------------- |
| Extreme Programming      | [extreme-programming](references/extreme-programming.md)        |
| Living docs sync         | [living-docs](references/living-docs.md)                        |
| Architecture             | [architecture rule](../../rules/architecture.mdc)               |
| Glossary                 | [Glossary](../../../docs/Glossary.md)                           |
| C4 model                 | [c4-model](../../../docs/developer/c4-model/README.md)          |
| User Story Map           | [User-Story-Map](../../../docs/product-owner/User-Story-Map.md) |
| Testing core             | [testing](references/testing.md)                                |
| Angular depth            | [angular-developer](../angular-developer/SKILL.md)              |
| Spring AI                | [spring-ai](../spring-ai/SKILL.md)                              |
| Business Analysis        | [business-analysis](../business-analysis/SKILL.md)              |
| Market / tech strategy   | [market-tech-analysis](../market-tech-analysis/SKILL.md)        |
| Research / OSS watchlist | [sources.md](../market-tech-analysis/references/sources.md)     |
| Product Owner            | [Product Owner](../product-owner/SKILL.md)                      |
