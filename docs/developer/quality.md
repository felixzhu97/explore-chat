# Quality

Snapshot of how well each area is protected. Update the row when a PR
changes tests, rules or docs for that area.

Grades: **A** tests + rules + docs current · **B** one gap · **C** two or more gaps.

| Area | Unit tests | Architecture rules | Docs | Grade |
|------|-----------|--------------------|------|-------|
| API layering | — | ArchUnit: dependency direction, naming, entity mapping, time, controller contract, no cycles (frozen violations, see tech debt) | `AGENTS.md`, C4 | B |
| Auth / Post / Calls | JUnit (few classes) | covered by layer rules | Glossary, Guideline | B |
| Chat / Message / Group / Notification | — | covered by layer rules | Glossary, Guideline, OpenAPI | C |
| Web | Vitest | ESLint | — | B |
| Mobile | Jest (coverage gate at floor) | ESLint | — | B |
| Admin | — | ESLint | — | C |
