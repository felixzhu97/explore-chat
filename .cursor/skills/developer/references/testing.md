# Testing Core

Minimal testing standards for this repo. Applied via the [developer skill](../SKILL.md).

## Pyramid

| Layer       | Share | Focus                                                               |
| ----------- | ----- | ------------------------------------------------------------------- |
| Unit        | ~70%  | Domain / pure logic; &lt; 1ms; no I/O                               |
| Integration | ~20%  | Collaborators (DB, Nest, Redis, queues); Testcontainers when needed |
| E2E         | ~10%  | Critical user journeys only (Playwright / Detox); keep few          |

Prefer many fast unit tests over a wide E2E suite.

## BDD

- Business language; one scenario = one behavior
- Structure: **Given** precondition → **When** action → **Then** outcome
- Outcomes, not “system calls X”
- Same vocabulary as [Glossary](../../../../docs/Glossary.md)

## TDD

```
Red (failing test) → Green (minimal code) → Refactor (keep green)
```

- Write the test first when implementing domain/application behavior
- AAA: Arrange / Act / Assert
- Do not test private methods; do not hit network/DB in unit tests

## Naming

```
should_expectedResult_when_condition
```

## Test doubles

| Type  | Use                                                           |
| ----- | ------------------------------------------------------------- |
| Dummy | Unused parameter filler                                       |
| Fake  | In-memory repo / simplified collaborator                      |
| Stub  | Fixed return values                                           |
| Mock  | Verify interactions only when the interaction is the contract |
| Spy   | Partial real object + call recording                          |

Prefer **Fake** for repositories over heavy mocking.

## Anti-patterns (avoid)

| Smell                                         | Fix                               |
| --------------------------------------------- | --------------------------------- |
| Asserting internals / counts of private state | Assert business outcomes          |
| `assertTrue(result)` with no meaning          | Precise assertions                |
| Mock everything                               | Fake or real simple collaborators |
| Unit tests that open DB/network               | Move to integration or stub       |
| Commented-out / ignored tests                 | Delete or fix                     |
| Ice-cream cone (many E2E, few unit)           | Rebalance toward unit             |

## Layers in this codebase

| Code under test            | Prefer                                  |
| -------------------------- | --------------------------------------- |
| `domain/`                  | Unit + TDD                              |
| `application/`             | Unit with Fake repos; light integration |
| `infrastructure/` / `web/` | Integration                             |
| Critical UI flows          | Few E2E                                 |
