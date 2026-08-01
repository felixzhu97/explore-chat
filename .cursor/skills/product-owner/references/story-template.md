# Story Template

Every ticket must include: **Background**, **User Story**, **Acceptance Criteria**, **Definition of Done**.

**Hard rule:** `## Background` **must be the first section** of the ticket description. Do not start with User Story, Acceptance Criteria, or any other heading. Write why the work is needed before the story itself.

**Language:**

- Jira **summary**: English (`As a … I want … so that …`) — business outcome, not tool names
- **Description**: English for section headings, body prefixes, body content, and Definition of Done

**Tone:** stakeholder-ready. Pain, impact, desired experience. Tooling only in optional trailing references. See Product Owner skill → Business language.

## User Story Format

```
**As a** [business role]
**I want** [perceivable capability / experience]
**So that** [business benefit: smoother / more predictable / less rework / more trust…]
```

## Full Template

```
## Background

[1–3 sentences: who is affected, pain, desired outcome — first section; do not open with frameworks/commands]

## User Story

**As a** [business role]
**I want** [perceivable capability / experience]
**So that** [business benefit]

## Acceptance Criteria

1.
   **Scenario** [business outcome name]
   **GIVEN** [precondition]
   **WHEN** [action]
   **THEN** [observable result]

2.
   **Scenario** [business outcome name]
   **GIVEN** [precondition]
   **WHEN** [action]
   **THEN** [observable result]
   **AND** [observable result]

3.
   **Scenario** [business outcome name]
   **GIVEN** [precondition]
   **WHEN** [action]
   **THEN** [observable result]

## Definition of Done

- [ ] Acceptance criteria scenarios pass (manual and/or automated)
- [ ] Unit / relevant tests added or updated (`should_…_when_…`)
- [ ] Code follows architecture + Domain Glossary Preferred Terms
- [ ] No new lint/build failures
- [ ] Docs / Domain Glossary updated if concepts changed
- [ ] Story Point estimate set (`customfield_10016`) for Story/Task
- [ ] Linked commit/PR includes References (official docs / research)
- [ ] External citations use official or research URLs (not random blogs)
```

Add ticket-specific Done items when needed (e.g. a11y check, migration run, feature flag off by default). Prefer a short DoD (3–5 items) when many defaults are N/A.

## Definition of Done (Default Checklist)

Replace free-form Notes. Keep all that apply:

- Acceptance criteria scenarios pass (manual and/or automated)
- Unit / relevant tests added or updated (`should_…_when_…`)
- Code follows architecture + Domain Glossary Preferred Terms
- No new lint/build failures
- Docs / Domain Glossary updated if concepts changed
- Story Point estimate set (`customfield_10016`) for Story/Task
- Linked commit/PR includes References (official docs / research)
- External citations use official or research URLs (not random blogs)

## Checklist

- [ ] `## Background` is the first section of the description
- [ ] Contains Background, User Story, Acceptance Criteria, and Definition of Done
- [ ] Summary and description are fully English and business-facing
- [ ] At least 3 numbered scenarios with **Scenario** / GIVEN / WHEN / THEN
- [ ] Definition of Done checkboxes are concrete and testable
- [ ] **Story Point is filled in** (`customfield_10016`)

Detail: [acceptance-criteria.md](acceptance-criteria.md) | [story-points.md](story-points.md)
