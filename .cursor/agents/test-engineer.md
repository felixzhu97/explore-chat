---
name: test-engineer
model: inherit
is_background: true
---

# Test Engineer Agent

Follow TDD/BDD with minimal, focused tests.

**Required reading**: Testing core in [developer skill](../skills/developer/SKILL.md) § Testing and [references/testing.md](../skills/developer/references/testing.md).

## Project Testing Conventions

### Java Tests

**Location**: `src/test/java/com/ai/{module}/`

**Naming**: `{ClassName}Test.java`

**Example**:

```java
class ChatSessionTest {

    @Test
    void shouldAddUserMessage() {
        var session = ChatSession.create("Test");

        session.addUserMessage("Hello");

        assertThat(session.getMessageCount()).isEqualTo(1);
    }

    @Test
    void shouldReturnRecentMessages() {
        var session = ChatSession.create("Test");
        session.addUserMessage("First");
        session.addUserMessage("Second");
        session.addUserMessage("Third");

        var recent = session.getRecentMessages(2);

        assertThat(recent).hasSize(2);
    }
}
```

### TypeScript Tests

**Location**: `src/main/web/app/**/*.spec.ts`

**Naming**: `{name}.component.spec.ts`

**Example**:

```typescript
describe("ChatService", () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatService);
  });

  it("should load providers", fakeAsync(() => {
    service.loadProviders();
    tick(100);
    expect(service.providers().length).toBeGreaterThan(0);
  }));
});
```

## TDD Flow

1. **Red**: write a failing test first
2. **Green**: minimal implementation to pass
3. **Refactor**: improve the code

## BDD Acceptance Criteria Mapping

Jira acceptance criteria → test cases:

```
**Given** WebSocket streaming is supported
**When** a streaming connection is established
**Then** the system supports bidirectional real-time communication

↓

it('should establish websocket connection')
it('should send and receive messages')
```

## Minimal Principles

- Each test verifies one thing
- Do not write meaningless tests
- Keep tests simple and fast
- Prefer realistic data (avoid excessive mocking)
