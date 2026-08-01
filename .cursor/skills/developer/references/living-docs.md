# Living Docs Sync

Code that changes architecture, domain language, or product capabilities must update living docs in the **same PR**. Pure test/style/chore with no product or architecture meaning does not.

## Documents

| Document        | Path                                                                                                                                                     | Owns                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Domain Glossary | [docs/Glossary.md](../../../../docs/Glossary.md)                                                                                                         | Preferred Terms, modules, routes, API prefixes                              |
| C4 model        | [docs/developer/c4-model/](../../../../docs/developer/c4-model/)                                                                                         | Context / containers / components / deployment (`.puml` is source of truth) |
| User Story Map  | [docs/product-owner/User-Story-Map.md](../../../../docs/product-owner/User-Story-Map.md) + [user-stories/](../../../../docs/product-owner/user-stories/) | Jeff Patton map index; epic files own GWT stories                           |

## Trigger matrix

If **any** row matches, update the listed doc(s) in the same PR. If none match, mark N/A on the checklist.

| Change                                                                                          | Update                                           |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| New or renamed Preferred Term, business concept, package/module, frontend route, API prefix     | Glossary                                         |
| New subdomain / service, container boundary, external system, or cross-cutting platform service | C2 (+ C1 if actors/systems change)               |
| NestJS layering or major server component structure                                             | C3-Component-Backend                             |
| Web / Admin / Mobile shell or feature structure                                                 | C3-Component-Frontend (and C2 for new apps)      |
| Local or production deploy topology, ports, hosting                                             | C4-Deployment and/or C4-Deployment-Production    |
| New user-visible capability, nav/module add/remove, delivery status change                      | User Story Map + epic file under `user-stories/` |
| Pure unit/integration tests, formatting, dependency bump with no product/architecture semantics | None (N/A)                                       |

### C4 layer cheat sheet

| File                         | Update when                                        |
| ---------------------------- | -------------------------------------------------- |
| `C1-Context.puml`            | New external actor/system or system purpose change |
| `C2-Container.puml`          | New app/service container / major data store       |
| `C3-Component-Backend.puml`  | New Nest modules or layer wiring                   |
| `C3-Component-Frontend.puml` | New feature routes or shell structure              |
| `C4-Deployment*.puml`        | Port, host, or runtime topology change             |

`.puml` first under `docs/developer/c4-model/`. Regenerate `png/` when PlantUML is available; otherwise note in the PR that images are stale.

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
