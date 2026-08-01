# Story Points

All **Story** and **Task** type tickets **must** have a Story Point estimate before entering Sprint planning.

## Field

| Field | ID | Description |
|-------|-----|-------------|
| Story point estimate | `customfield_10016` | Numeric value (e.g., 1, 2, 3, 5, 8, 13) |

## Guidelines

| Points | Complexity | Description |
|--------|------------|-------------|
| 1 | Very Low | Trivial change, no research needed |
| 2 | Low | Simple task, well understood |
| 3 | Medium | Standard task, minor complexity |
| 5 | Medium-High | Moderate complexity, some unknowns |
| 8 | High | Complex task, multiple components |
| 13 | Very High | High risk, needs decomposition |

## Rules

- **Every ticket must have SP** before entering Sprint planning
- Use Fibonacci sequence (1, 2, 3, 5, 8, 13)
- If a task exceeds 13 SP, consider splitting it
- Completed tickets should be used to calibrate future estimates
