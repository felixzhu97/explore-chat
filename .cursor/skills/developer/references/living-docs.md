# Living Docs Sync

Code that changes architecture, domain language, or product capabilities must update living docs in the **same PR**. Pure test/style/chore with no product or architecture meaning does not.

## Documents

| Document | Path | Owns |
|----------|------|------|
| Domain Glossary | [docs/Glossary.md](../../../../docs/Glossary.md) | Preferred Terms, modules, routes, API prefixes |
| C4 model | [docs/zh/rd/c4/](../../../../docs/zh/rd/c4/) (EN: [docs/en/rd/c4/](../../../../docs/en/rd/c4/)) | Context / containers / components (`.puml` is source of truth) |
| User Story Map | [docs/zh/product/User-Story-Map.md](../../../../docs/zh/product/User-Story-Map.md) | Delivered / In Progress / Future capabilities |

## Trigger matrix

If **any** row matches, update the listed doc(s) in the same PR. If none match, mark N/A on the checklist.

| Change | Update |
|--------|--------|
| New or renamed Preferred Term, business concept, package/module, frontend route, API prefix | Glossary |
| New subdomain / service, container boundary, external system, or cross-cutting platform service | C2 (+ C1 if actors/systems change) |
| NestJS layering or major server component structure | C3 API Server diagram |
| Web / Admin / Mobile shell or feature structure | Matching C3 app diagram |
| Local or production deploy topology, ports, hosting | Deployment-related C4 / README notes |
| New user-visible capability, nav/module add/remove, delivery status change | User Story Map |
| Pure unit/integration tests, formatting, dependency bump with no product/architecture semantics | None (N/A) |

### C4 layer cheat sheet (WhatsFeed)

| Artifact | Update when |
|----------|-------------|
| System context (`system-context`) | New external actor/system or system purpose change |
| Containers | New app/service container / major data store |
| `components-api-server` | New Nest modules or layer wiring |
| `components-web-app` / `admin` / `mobile` | New feature routes or shell structure |

`.puml` first under `docs/zh/rd/c4/` (and EN twin when applicable). Regenerate PNGs when PlantUML is available; otherwise note in the PR that images are stale.

## Workflow

1. Implement the code change.
2. Run the trigger matrix; update every matched doc.
3. Include doc updates in the same PR (same commit or a follow-up docs commit on the same branch).
4. Checklist: Glossary / C4 / Story Map — done or N/A per matrix.

## Example — Explore AI BFF

Adding Nest `/api/v1/ai/explore/*` proxied to explore-ai:

1. **Glossary** — Preferred Terms: Explore AI BFF, Client Identity mapping.
2. **C4** — containers / API server components if the boundary is shown.
3. **User Story Map** — “Explore AI 流式对话” under In Progress or Delivered.
