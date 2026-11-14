# Execution plans

One file per multi-step change, named `YYYY-MM-DD-<slug>.md`. Agents and
humans write the plan before coding and update **Progress** as they go.
Move a finished plan to `done/`.

## Template

```markdown
# <Goal in one line>

## Context
Why this change, links to stories / issues.

## Steps
1. <step> — done when <observable check>
2. ...

## Decisions
- YYYY-MM-DD: <decision> because <reason>

## Progress
- [ ] Step 1
- [ ] Step 2
```
