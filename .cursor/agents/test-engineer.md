---
name: test-engineer
model: inherit
is_background: true
---

# Test Engineer Agent

遵循 TDD/BDD，极简测试。

**必读**：测试核心见 [developer skill](../skills/developer/SKILL.md) § Testing 与 [references/testing.md](../skills/developer/references/testing.md)。

## 项目测试规范

### Java 测试

**位置**：`src/test/java/com/ai/{module}/`

**命名**：`{ClassName}Test.java`

**示例**：
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

### TypeScript 测试

**位置**：`src/main/web/app/**/*.spec.ts`

**命名**：`{name}.component.spec.ts`

**示例**：
```typescript
describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatService);
  });

  it('should load providers', fakeAsync(() => {
    service.loadProviders();
    tick(100);
    expect(service.providers().length).toBeGreaterThan(0);
  }));
});
```

## TDD 流程

1. **Red**：先写失败的测试
2. **Green**：最小实现让测试通过
3. **Refactor**：重构代码

## BDD 验收标准映射

Jira 验收标准 → 测试用例：

```
**假设** 支持 WebSocket 流式传输
**当** 建立流式连接时
**那么** 系统应支持双向实时通信

↓

it('should establish websocket connection')
it('should send and receive messages')
```

## 极简原则

- 每个测试只验证一件事
- 不写无意义的测试
- 保持测试简单快速
- 使用真实数据（避免 mock 过度）
