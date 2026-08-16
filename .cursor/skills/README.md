# Skills index (WhatsFeed)

Project skills live here. The always-on thin rule is [`.cursor/rules/architecture.mdc`](../rules/architecture.mdc) (WhatsFeed monorepo — Nest / Next / Expo).

Agents under [`.cursor/agents/`](../agents/) were synced from [explore-ai](https://github.com/felixzhu97/explore-ai) and point at these skills.

## Rules vs Skills

|             | Rules                          | Skills                     |
| ----------- | ------------------------------ | -------------------------- |
| When loaded | `alwaysApply`                  | Agent reads by description |
| This repo   | `architecture.mdc` (WhatsFeed) | Table below                |

## Skills

| Skill                                           | Description                                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [developer](./developer/)                       | **Primary**: XP / DDD / BDD / TDD / Glossary / Apple HIG + Instagram Emotion UX / Commit·PR                         |
| [business-analysis](./business-analysis/)       | Business analysis: ubiquitous language, domain understanding, business rules                                        |
| [market-tech-analysis](./market-tech-analysis/) | Market + tech analysis → tech-business recommendations (needs live search)                                          |
| [product-owner](./product-owner/)               | User stories, acceptance criteria, DoD, Jira MCP                                                                    |
| [angular-developer](./angular-developer/)       | Angular deep guide (synced from explore-ai; secondary for this repo)                                                |
| [angular-new-app](./angular-new-app/)           | Angular greenfield (synced; secondary)                                                                              |
| [spring-ai](./spring-ai/)                       | Spring AI 2.0 (synced; WhatsFeed AI goes through Nest BFF / Ollama / Python — use when reading explore-ai patterns) |

## Synced from explore-ai

- Copied `.cursor/agents/*`, skills above, and root `.mcp.json` (Atlassian MCP).
- **Kept** WhatsFeed [architecture.mdc](../rules/architecture.mdc) (did not overwrite with explore-ai Java rule).
- Adapted [developer](./developer/) hard constraints and DDD paths for Nest domain folders + Next/Expo clients.

## How to use

- Day-to-day feature / test / commit / UX → `developer` (+ Agent `developer`)
- Domain / business rules / ubiquitous language → Agent `business-analyst` + `business-analysis`
- Market / competitors / GTM → Agent `market-analyst` + `market-tech-analysis`
- Research / papers / models → Agent `tech-analyst` + `market-tech-analysis`
- User stories / Jira → `product-owner` (+ Agent `product-owner`)
- Orchestrate multi-agent flow → Agent `orchestrator`
