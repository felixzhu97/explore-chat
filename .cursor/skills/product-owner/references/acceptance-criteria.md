# Acceptance Criteria

Use **numbered scenarios** with **Scenario / GIVEN / WHEN / THEN** (and optional **AND**). Each scenario is independently testable.

## Format

```
1.
   **Scenario** [short business outcome name]
   **GIVEN** [precondition / system state]
   **WHEN** [user or system action]
   **THEN** [observable result]
   **AND** [additional observable result]   ← optional
```

## Rules

- Each AC item includes **Scenario**, **GIVEN**, **WHEN**, **THEN** (and optional **AND**)
- One scenario = one behavior; name the scenario in business language
- At least **3–5** scenarios per ticket (happy path + edge/error cases)
- **GIVEN** = state only; **WHEN** = single trigger; **THEN/AND** = observable outcomes only
- No implementation details (APIs, DB, class names)
- Present tense ("the user clicks", not "the user will click")
- UI tickets: reference OpenAI-style interaction patterns where relevant

## Good Examples

```
1.
   **Scenario** Open file picker on upload
   **GIVEN** a user is logged in
   **WHEN** they click the "Upload" button
   **THEN** a file picker dialog opens

2.
   **Scenario** Retry after network loss during upload
   **GIVEN** an upload is in progress
   **WHEN** the network connection is lost
   **THEN** an error message is displayed
   **AND** the user can retry the upload
```

## Bad Examples (Avoid)

```
1.
   **Scenario** Call API
   **WHEN** the button is clicked
   **THEN** the system calls the upload API and saves to the database

2.
   **Scenario** Upload works
   **GIVEN** the user wants to upload a file
   **WHEN** they click the button
   **THEN** the system works correctly
```

## OpenAI-Style Interaction Patterns

When describing UI/UX acceptance criteria, reference these patterns:

| Pattern | Description |
|---------|-------------|
| Chat bubbles | User messages right-aligned, AI responses left-aligned with avatars |
| Markdown rendering | Support for code blocks, lists, bold, italic |
| Typing indicator | Animated dots during AI processing |
| Copy button | One-click copy for code and text blocks |
| Regenerate | Re-run the last query and replace the response |
| Toast notifications | Non-blocking success/error feedback |
| Skeleton loader | Pulsing placeholder during loading states |
| Smooth transitions | Page/panel open/close animations |

## Checklist

- [ ] At least 3 numbered scenarios with **Scenario** / GIVEN / WHEN / THEN
- [ ] Acceptance criteria focus on behavior, not implementation
- [ ] Edge cases and error states are covered
- [ ] OpenAI-style interaction patterns referenced where applicable
