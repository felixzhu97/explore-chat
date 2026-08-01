---
name: business-tech-analysis
description: >-
  Performs business and technical analysis of market trends and recommends
  technology–business strategy. Always starts from Google, Apple, Microsoft,
  NVIDIA, Meta, OpenAI, DeepMind, Vercel, Anthropic, Cursor, Hugging Face
  trending, and arXiv papers. Use when analyzing commercial dynamics, market
  moves, competitive landscape, tech adoption, product strategy, or when the
  user asks for 商业分析、技术分析、商业动向、技术商业建议、竞品、趋势研判.
---

# Business & Tech Analysis

Combine **real-time commercial signal** with **technical feasibility** to recommend what this product (or a named domain) should do next.

Complementary skill: personal `business-model-generator` covers BMC / unit economics; this skill focuses on **trends → tech–business options → actionable bets**.

## When to run

- User asks for 商业动向、行业趋势、竞品、技术选型与商业匹配、Go-to-market vs build
- Planning features, monetization, or platform bets for AI/chat/RAG/agent products
- Need a short strategy memo with evidence and next steps

## Hard rules

1. **Mandatory first scan** of the watchlist in [references/sources.md](references/sources.md): Google, Apple, Microsoft, NVIDIA, Meta, OpenAI, DeepMind, Vercel, Anthropic, Cursor, **Hugging Face Trending**, **arXiv** papers — via real-time web search/fetch. Do not skip.
2. **Cite sources** with title + URL + date; prefer primary sources (official blogs, changelogs, arXiv abs pages, HF model cards).
3. Separate **fact** (observed) from **inference** (your read) from **recommendation** (what to do).
4. Tie advice to **this repo’s capabilities** when analyzing ai-explore (chat, RAG, agents, Spring AI, Angular) — or state clearly if the analysis is industry-generic.
5. Stay **minimal**: one clear thesis, few options, concrete next actions — no slide-deck fluff.

## Workflow

```
Scope → Mandatory watchlist scan → Lens synthesis → Business read → Tech read → Options → Recommend → Next actions
```

### 1. Scope

Confirm in one line:

- Subject (market / competitor / tech wave / own product)
- Horizon (now / 6–12 months)
- Decision to inform (build, buy, partner, price, kill, invest)

### 2. Mandatory watchlist scan (do this first)

Open [references/sources.md](references/sources.md) and scan **in this order**:

1. Google · Apple · Microsoft · NVIDIA · Meta  
2. OpenAI · DeepMind · Anthropic  
3. Vercel · Cursor  
4. **Each org’s research + open-source hubs** ([sources.md](references/sources.md) § Open-source & research hubs)  
5. Hugging Face Trending (`https://huggingface.co/models?sort=trending`)  
6. arXiv recent (cs.AI / cs.LG / cs.CL — and topic-specific search)

For each: capture **dated** moves (product, pricing, model, **paper+code**, DX) relevant to the scope. If nothing material, write `Org: no material signal (checked)`.

Then apply lenses:

| Lens | Look for |
|------|----------|
| Demand | Adoption, usage, regulation, buyer pain |
| Supply | New models/APIs, open-source, infra cost |
| Competition | Positioning, pricing, distribution |
| Capital / policy | Funding, standards, compliance |

Keep a compact signal list (prefer quality over volume; typically 5–12 items spanning the watchlist).

### 3. Business analysis

Summarize:

- Who pays and why now
- Value chain / switching costs
- Moat vs commodity risk
- Monetization patterns that fit the signal

### 4. Technical analysis

For each relevant tech bet:

- Maturity (experiment / early / production-ready)
- Fit with existing stack (Java/Spring AI, Angular, RAG, agents)
- Cost / latency / data / ops burden
- Build vs buy vs integrate
- Relevance of HF trending models / arXiv methods to this stack

### 5. Tech–business recommendations

Propose **2–3 options** max, each with:

| Field | Content |
|-------|---------|
| Bet | One sentence |
| Why now | Link to watchlist signals |
| Tech move | Concrete capability to build or adopt |
| Business move | Pricing, packaging, GTM, partnership |
| Risk | Main failure mode |
| Effort | S / M / L |

Pick **one primary recommendation** and say what to defer.

### 6. Next actions (executable)

3–5 bullets the team can do this week (spike, metric, Jira story outline, doc update). Prefer Domain Glossary terms when naming product concepts.

## Output template

```markdown
# [Topic] — Business & Tech Brief
**Date:** YYYY-MM-DD | **Horizon:** … | **Decision:** …

## Thesis
One paragraph.

## Watchlist scan
| Source | Signal (dated) | Link |
|--------|----------------|------|
| Google | … | … |
| Apple | … | … |
| Microsoft | … | … |
| NVIDIA | … | … |
| Meta | … | … |
| OpenAI | … | … |
| DeepMind | … | … |
| Anthropic | … | … |
| Vercel | … | … |
| Cursor | … | … |
| HF Trending | … | … |
| arXiv | paper id + title | … |

## Business read
- …
## Technical read
- …

## Options
| Option | Tech move | Business move | Effort | Risk |
|--------|-----------|---------------|--------|------|
| A | | | S/M/L | |
| B | | | | |

## Recommendation
**Primary:** …
**Defer:** …

## Next actions
1. …
2. …

## References
- [Title](URL)
```

## Anti-patterns

| Avoid | Do instead |
|-------|------------|
| Skipping the watchlist | Complete sources.md checklist first |
| Undated hype with no links | Dated signals + citations |
| Feature laundry list | One thesis + ranked options |
| Tech for tech’s sake | Map every tech move to a paying job-to-be-done |
| Ignoring this codebase | Call out reuse of chat/RAG/agent vs greenfield |

Scoring: [references/rubric.md](references/rubric.md). Sources: [references/sources.md](references/sources.md).

## Related

| Need | Where |
|------|-------|
| 行业动向（子 Agent） | [business-analyst](../../agents/business-analyst.md) |
| 前沿研究（子 Agent） | [tech-analyst](../../agents/tech-analyst.md) |
| BMC / LTV / CAC deep dive | `business-model-generator` (personal skill) |
| Implement chosen bet | [developer](../developer/SKILL.md) |
| Product Owner story from recommendation | [Product Owner](../product-owner/SKILL.md) |
| Spring AI capabilities | [spring-ai](../spring-ai/SKILL.md) |
