# Extreme Programming (XP)

Map XP to this repo. Do not invent a second process — reuse DDD / BDD / TDD / PO / Customer already in place.

**XP** sets **cadence and feedback**. **DDD** owns the model. **BDD** owns behavior language.

## Values → this repo

| Value | Practice here |
|-------|----------------|
| Communication | Glossary Preferred Terms; AC in business language |
| Simplicity | Smallest correct change; YAGNI |
| Feedback | TDD + CI green before merge; Customer / AC review |
| Courage | Refactor while green; delete dead code in scope |
| Respect | Collective ownership within the task; no drive-by rewrites |

## Practices → This Repo

| XP practice | Do this |
|-------------|---------|
| Planning Game | Shape work with [Product Owner](../../product-owner/SKILL.md); estimate SP; behavior first, design second |
| Small Releases | One outcome per PR; Chain PRs when dependent; no unrelated piles |
| Metaphor | [Glossary](../../../../docs/Glossary.md) as shared language |
| Simple Design | Pass tests with the simplest structure; no speculative abstractions |
| Test-First / TDD | [testing](testing.md) — Red → Green → Refactor |
| Refactoring | Improve design only while tests stay green; keep diffs reviewable |
| Pair Programming | Sync decisions with the human when pairing or reviewing; no empty ceremony |
| Collective Ownership | Improve any module needed for the ticket; stay in scope |
| Continuous Integration | Run relevant tests locally; keep CI green on the PR |
| On-site Customer | Use [`customer`](../../../agents/customer.md) for user-value feedback; PO for stories / AC |
| Coding Standards | [architecture](../../../rules/architecture.mdc) + naming + this skill |
| Sustainable Pace | Do not overload a single PR; ship the next slice later |

## Rules of thumb

1. **Customer / AC first** — know the outcome before coding
2. **Small steps** — vertical slice that can merge soon
3. **Test first** for domain / application behavior
4. **Refactor** after green; do not skip the third step
5. **YAGNI** — no feature, config, or layer “for later”
6. **CI green** before asking for review / merge

## References

- [Extreme Programming](http://www.extremeprogramming.org/)
- [XP Rules](http://www.extremeprogramming.org/rules.html)
- [Agile Alliance — Extreme Programming](https://www.agilealliance.org/glossary/xp/)
