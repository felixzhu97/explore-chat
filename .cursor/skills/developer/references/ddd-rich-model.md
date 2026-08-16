# DDD Rich Model (This Repo)

Aligned with [architecture rule](../../../rules/architecture.mdc).

## Rich vs anemic

| Rich (preferred)                                  | Anemic (avoid)                                    |
| ------------------------------------------------- | ------------------------------------------------- |
| Entity methods enforce invariants                 | Entity is only fields + getters/setters           |
| Use case loads aggregate, calls domain API, saves | Use case contains all if/else business rules      |
| VO validates on construction                      | Primitives passed everywhere (`String sessionId`) |

## Patterns

### Entity / Aggregate

```java
public class ChatSession {
    private final ChatSessionId id;
    private SessionStatus status;

    private ChatSession(ChatSessionId id) {
        this.id = id;
        this.status = SessionStatus.ACTIVE;
    }

    public static ChatSession create() {
        return new ChatSession(new ChatSessionId(UUID.randomUUID()));
    }

    public void archive() {
        if (status == SessionStatus.ARCHIVED) {
            throw new IllegalStateException("Session already archived: " + id.value());
        }
        status = SessionStatus.ARCHIVED;
    }

    public ChatSessionId id() {
        return id;
    }
}
```

### Value Object

```java
public record ChatSessionId(UUID value) {
    public ChatSessionId {
        Objects.requireNonNull(value, "ChatSessionId value");
    }
}
```

### Repository

```java
// domain/repository/
public interface ChatSessionRepository {
    Optional<ChatSession> findById(ChatSessionId id);
    void save(ChatSession session);
}
```

Implementation lives in `infrastructure/` only.

### Use Case (orchestration)

```java
public ChatResponse chat(ChatRequest request) {
    ChatSession session = repository.findById(sessionId)
        .orElseGet(ChatSession::create);
    session.addUserMessage(request.message());
    String reply = chatModel.call(request.message());
    session.addAssistantMessage(reply);
    repository.save(session);
    return new ChatResponse(reply);
}
```

Business rules like “cannot archive twice” stay on `ChatSession`, not in the use case.

## Ubiquitous language

Source of truth: [docs/Glossary.md](../../../../docs/Glossary.md)

- Name **types, variables, and methods** with the glossary **Preferred Term (English)** for that bounded context
- Example: `archive()`, not `updateStatusFlag` / `close()` — only if `archive` is the preferred verb for that concept
- Keep the **same** terms in BDD scenarios, unit tests, domain code, REST/DTO fields, and commits
- New concept workflow: glossary entry → domain model → API / i18n → PR references glossary change
- Ownership: developer implements Preferred Terms; business-analyst guards consistency
