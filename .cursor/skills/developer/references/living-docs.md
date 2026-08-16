# Living Docs Sync

Code that changes architecture, domain language, or product capabilities must update living docs in the **same PR**. Pure test/style/chore with no product or architecture meaning does not.

## Documents

| Document             | Path                                                                                     | Owns                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Domain Glossary      | [docs/Glossary.md](../../../../docs/Glossary.md)                                         | Preferred Terms, modules, routes, API prefixes                              |
| C4 model             | [docs/developer/c4-model/](../../../../docs/developer/c4-model/)                         | Context / containers / components / deployment (`.puml` is source of truth) |
| User Story Map       | [docs/product-owner/User-Story-Map.md](../../../../docs/product-owner/User-Story-Map.md) | Journey / Backbone / Epic index (status)                                    |
| User stories (Epics) | [docs/product-owner/user-stories/](../../../../docs/product-owner/user-stories/)         | Per-US As a / GWT acceptance criteria / status                              |

## Trigger matrix

If **any** row matches, update the listed doc(s) in the same PR. If none match, mark N/A on the checklist.

| Change                                                                                           | Update                                                                                   |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| New or renamed Preferred Term, business concept, Java package module, frontend route, API prefix | Glossary                                                                                 |
| New subdomain / module, container boundary, external system, or cross-cutting platform service   | C2 (+ C1 if actors/systems change)                                                       |
| Backend layering or major package/component structure                                            | C3-Component-Backend                                                                     |
| Frontend routes, shells, shared app structure                                                    | C3-Component-Frontend                                                                    |
| Local or production deploy topology, ports, hosting                                              | C4-Deployment and/or C4-Deployment-Production                                            |
| New user-visible capability, nav/module add/remove, delivery status change                       | User Story Map index **and** the matching `user-stories/E*.md` (US text, GWT AC, status) |
| Pure unit/integration tests, formatting, dependency bump with no product/architecture semantics  | None (N/A)                                                                               |

### C4 layer cheat sheet

| File                         | Update when                                        |
| ---------------------------- | -------------------------------------------------- |
| `C1-Context.puml`            | New external actor/system or system purpose change |
| `C2-Container.puml`          | New app container / subdomain / major data store   |
| `C3-Component-Backend.puml`  | New backend module packages or layer wiring        |
| `C3-Component-Frontend.puml` | New feature route/module or shell structure        |
| `C4-Deployment*.puml`        | Port, host, or runtime topology change             |

`.puml` first. Regenerate `png/` when PlantUML is available; otherwise note in the PR that PNGs are stale.

## Workflow

1. Implement the code change.
2. Run the trigger matrix; update every matched doc.
3. Include doc updates in the same PR (same commit or a follow-up docs commit on the same branch).
4. Checklist: Glossary / C4 / Story Map — done or N/A per matrix.

## Example — new Metrics module

Adding `com.ai.metrics` + `/metrics` + `/api/metrics`:

1. **Glossary** — business-domain row (Metrics), frontend route map, notes.
2. **C4** — at least `C2-Container.puml` and `C3-Component-Frontend.puml` (and Backend C3 if package structure is shown); regenerate png if possible.
3. **User Story Map** — add the US to the Backbone / Epic index with the correct status.
4. **user-stories/E\*.md** — add or update the US block (As a / I want / So that, GWT AC, status) in the matching Epic file.
