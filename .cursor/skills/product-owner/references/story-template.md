# Story Template

Every ticket must include: **Background**, **User Story**, **Acceptance Criteria**, **Definition of Done**.

## User Story Format

```
**As a** [role]
**I want** [action/feature]
**So that** [benefit/value]
```

## Full Template

```
## Background

[Explain why this work is needed]

## User Story

**As a** [role]
**I want** [action/feature]
**So that** [benefit/value]

## Acceptance Criteria

1.
   **Scenario** [name]
   **GIVEN** [precondition]
   **WHEN** [action]
   **THEN** [outcome]

2.
   **Scenario** [name]
   **GIVEN** [precondition]
   **WHEN** [action]
   **THEN** [outcome]
   **AND** [outcome]

3.
   **Scenario** [name]
   **GIVEN** [precondition]
   **WHEN** [action]
   **THEN** [outcome]

## Definition of Done

- [ ] Acceptance Criteria scenarios pass (manual and/or automated)
- [ ] Unit / relevant tests added or updated (`should_…_when_…`)
- [ ] Code follows architecture + Domain Glossary Preferred Terms
- [ ] No new lint/build failures
- [ ] Docs / Domain Glossary updated if concepts changed
- [ ] Story Point estimate set (`customfield_10016`) for Story/Task
- [ ] Linked commit/PR includes References (official docs / research)
- [ ] External citations use official or research URLs (not random blogs)
```

Add ticket-specific Done items when needed (e.g. a11y check, migration run, feature flag off by default).

## Definition of Done (Default Checklist)

Replace free-form Notes. Keep all that apply:

- Acceptance Criteria scenarios pass (manual and/or automated)
- Unit / relevant tests added or updated (`should_…_when_…`)
- Code follows architecture + Domain Glossary Preferred Terms
- No new lint/build failures
- Docs / Domain Glossary updated if concepts changed
- Story Point estimate set (`customfield_10016`) for Story/Task
- Linked commit/PR includes References (official docs / research)
- External citations use official or research URLs (not random blogs)

## Checklist

- [ ] Contains Background, User Story, Acceptance Criteria, and Definition of Done
- [ ] User story follows As a / I want / So that format
- [ ] At least 3 numbered scenarios with **Scenario** / GIVEN / WHEN / THEN
- [ ] Definition of Done checkboxes are concrete and testable
- [ ] **Story Point is filled in** (`customfield_10016`)

Detail: [acceptance-criteria.md](acceptance-criteria.md) | [story-points.md](story-points.md)
