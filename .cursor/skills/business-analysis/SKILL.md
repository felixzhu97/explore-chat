---
name: business-analysis
description: >-
  Business Analysis: ubiquitous language, domain understanding, business rules,
  bounded contexts, and bridge-style collaboration (not ferry). Use when the user
  asks for 领域分析、业务规则、统一语言、限界上下文、Analysis Patterns, or Business
  Analysis. Not for market/GTM scanning (use market-analyst + market-tech-analysis).
---

# Business Analysis

**Understand the domain. Bridge business and software. Never ferry.**

This skill is **Business Analysis**: building a shared understanding of how the domain works so software experts and business experts can communicate. It is **not** market/competitor/GTM scanning.

## Hard rules

1. **Analysis model = communication medium** between software experts and business experts — useful for building software, not a thick handoff document.
2. **Bridge, not ferry**: surface open questions; enable direct alignment between business and engineering. Do **not** sit as a permanent intermediary that blocks contact.
3. Align with [architecture](../../rules/architecture.mdc): domain has no outward dependencies; Prefer rich domain models ([ddd-rich-model](../developer/references/ddd-rich-model.md)).
4. Prefer Glossary [Preferred Terms](../../../docs/Glossary.md); new concepts update Glossary in the same change (see developer living-docs).
5. Keep output minimal: language, rules, boundaries, open questions — no slide-deck fluff.

## When to use

- Domain rules, ubiquitous language, bounded contexts, aggregates / entities / VOs
- “What does this business concept mean in the model?”
- Analysis Patterns style modeling

## When not to use

| Need                             | Go to                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------- |
| 商业动向 / 竞品 / GTM / 定价信号 | Agent `market-analyst` + [market-tech-analysis](../market-tech-analysis/SKILL.md) |
| User stories / AC / Jira         | [product-owner](../product-owner/SKILL.md)                                        |
| Implement code / tests / PR      | [developer](../developer/SKILL.md)                                                |
| Papers / models / HF trending    | Agent `tech-analyst`                                                              |

## Workflow

```
Scope → Ubiquitous Language → Domain understanding → Model → Open questions (bridge) → Handoff
```

1. **Scope** — one sentence: which capability / pain / decision this analysis serves.
2. **Ubiquitous Language** — Preferred Terms; flag synonyms to kill.
3. **Domain understanding** — how the business process works (invariants, policies).
4. **Model** — bounded contexts; entities / VOs / rules; reuse Analysis Patterns when they fit.
5. **Open questions** — list what business must confirm (bridge).
6. **Handoff** — PO for stories; developer for implementation; do not invent ferry specs.

## Deliverables

- Term draft (Preferred Terms + rejected synonyms)
- Bounded-context sketch (names + responsibilities)
- Core entities / VOs / domain rules list
- Analysis pattern notes (if applicable)
- Open questions for business stakeholders
- Optional: suggested package / naming aligned to architecture

## Checklist

- [ ] Bridge: open questions listed; no ferry-only handoff
- [ ] Domain purity: no infrastructure leakage in the analysis model
- [ ] Glossary terms consistent or marked for update
- [ ] Market/GTM concerns deferred to `market-analyst`
- [ ] Stories deferred to `product-owner`; code to `developer`

## References

- [Conversational Stories](https://martinfowler.com/bliki/ConversationalStories.html)
- [Architecture rule](../../rules/architecture.mdc)
- [Glossary](../../../docs/Glossary.md)
