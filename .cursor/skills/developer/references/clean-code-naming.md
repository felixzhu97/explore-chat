# Clean Code — Naming & Minimal Design

> Based on Robert C. Martin's *Clean Code*, plus this repo's **Ubiquitous Language**.

## Glossary first (required)

Canonical source: [docs/Glossary.md](../../../../docs/Glossary.md)

| Rule | Detail |
|------|--------|
| Preferred Term | English Preferred Term is the only name for code, API, tests, commits |
| One concept, one word | Do not introduce synonyms (`Conversation` vs `ChatSession`) |
| Glossary before code | New domain concept → add/update glossary entry in the same change |
| Align surfaces | Same term in BDD scenarios, domain methods, variables, DTOs, UI models |

```java
// ❌ BAD — technical / synonym, not glossary
Conversation conv = store.get(id);
conv.setClosed(true);

// ✅ GOOD — Preferred Terms from Glossary (Chat)
ChatSession chatSession = repository.findById(chatSessionId).orElseThrow();
chatSession.archive();
```

```typescript
// ❌ BAD
const items = msgs.filter(m => m.flag);

// ✅ GOOD — domain nouns from glossary
const userMessages = chatMessages.filter(message => message.role === 'user');
```

If the glossary lacks a term you need: update the glossary (developer ownership: implement with Preferred Terms; coordinate with domain-expert for consistency), then code.

## Naming form (Clean Code)

### Principles

- **Domain noun/verb first**, then Clean Code style
- **Avoid vague names**: No `data`, `list`, `temp`, `info`, `obj`, `mgr`
- **State the purpose**: Name reveals intent without a comment
- **One concept per word**: Choose `get` OR `fetch`, not both in the same codebase area
- **Functions are verbs** using domain vocabulary: `archive`, `addUserMessage` (not `updateStatusFlag`)
- **Classes/types are nouns** from the glossary: `ChatSession`, `ChatMessage`

### Variables

```java
// ❌ BAD
int d;
String tmp;
List<String> list;

// ✅ GOOD — domain + intent
ChatSessionId chatSessionId;
List<ChatMessage> pendingUserMessages;
```

```typescript
// ❌ BAD
const x = items.filter(i => i.flag);
const result = process(data);

// ✅ GOOD
const activeChatSessions = chatSessions.filter(session => session.isActive);
const archivedSessions = archiveExpiredSessions(chatSessions);
```

### Boolean naming

```java
boolean isActive;
boolean hasPermission;
boolean canProceed;
boolean shouldRetry;
```

Avoid double negatives (`isNotDisabled`). Prefer positive forms (`isEnabled`).

### Methods

```java
// ❌ BAD — vague / flag-driven
Object handleRequest();
void processOrder(Order order, boolean validate, boolean sendEmail);

// ✅ GOOD — intent + single responsibility
ValidationResult validateUserInput();
void validateOrder(Order order);
void saveOrder(Order order);
void sendOrderConfirmation(Order order);
```

```typescript
// ❌ BAD
function handleClick() { /* ... */ }
function createReport(includeCharts: boolean, includeSummary: boolean) { /* ... */ }

// ✅ GOOD
function onSubmitButtonClick() { /* ... */ }
function createDetailedReport() { /* ... */ }
function createSummaryReport() { /* ... */ }
```

## Functions (minimal)

1. **Small** — Prefer a handful of lines; extract when nesting grows
2. **Do One Thing** — One level of abstraction per function
3. **Few arguments** — 0 ideal, 1–2 OK; 3+ → introduce a request type / record
4. **No flag arguments** — Split into explicit methods instead of `boolean` switches
5. **No surprising side effects** — Name matches what the function actually does

```java
// ❌ BAD — too many arguments
public User createUser(String firstName, String lastName, String email,
    int age, boolean isActive, String role) { /* ... */ }

// ✅ GOOD
public record CreateUserRequest(
    String firstName,
    String lastName,
    String email,
    int age,
    boolean isActive,
    String role
) {}

public User createUser(CreateUserRequest request) { /* ... */ }
```

## Errors

- Fail fast at the start of the method
- Throw specific exceptions with context (ids, amounts, state)
- Never empty `catch` or log-only without rethrow/return policy

## Comments

- Prefer clear names over comments that restate the code
- Comments explain **why**, not **what**
- Delete commented-out code (use git)

## Quick anti-patterns

| Smell | Fix |
|-------|-----|
| `data` / `info` / `manager` | Name the domain concept |
| Method > ~20 lines | Extract private helpers |
| Boolean parameter | Two named methods |
| Anemic entity + logic in use case | Move rule into domain method |
| `Utils` dumping ground | Place behavior next to the type that owns it |
