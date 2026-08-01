# Business & Tech Analysis — Quick Rubric

Use when scoring options before writing the recommendation.

## Watchlist coverage (gate)

Analysis is incomplete until [sources.md](sources.md) is scanned: product/news **and** research/OSS hubs for Google, Apple, Microsoft, NVIDIA, Meta, OpenAI, DeepMind, Anthropic, Vercel, Cursor, plus Hugging Face Trending and arXiv.

| Score | Criteria |
|-------|----------|
| Pass | Every row has a dated signal **or** explicit “no material signal (checked)” |
| Fail | Any org/source skipped without checking |

## Signal quality

| Score | Criteria |
|-------|----------|
| High | Primary source (official blog/changelog/arXiv abs/HF card), dated ≤ 90 days, directly relevant |
| Medium | Reputable secondary, or older but still structural |
| Low | Opinion / undated / marketing only — cite sparingly |

## Fit for this product (ai-explore)

| Capability | Prefer when signal says… |
|------------|---------------------------|
| Chat / multi-agent | Conversation UX, orchestration, tool use |
| RAG | Knowledge Q&A, grounding, enterprise docs |
| Structured output / analysis | Reports, eval, compliance packaging |
| Vision / audio | Multimodal demand with clear monetization |
| MCP / tools | Integration marketplace, partner distribution |

## Effort heuristic

| Size | Meaning |
|------|---------|
| S | ≤ 1 week spike or config/docs |
| M | One vertical slice (domain + API + thin UI) |
| L | New bounded context or heavy infra |
