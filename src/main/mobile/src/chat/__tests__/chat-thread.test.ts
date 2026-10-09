import { ChatThread, Message } from "@/chat/domain/model";
import {
  ChatId,
  ClientMsgId,
  MessageDeliveryStatus,
  MessageId,
} from "@/chat/domain/model";

describe("ChatThread domain", () => {
  it("should reject empty ChatId when creating value object", () => {
    expect(() => ChatId.createId("")).toThrow(/non-empty/);
  });

  it("should upsert and keep order when ChatThread hydrates", () => {
    const thread = ChatThread.empty(ChatId.createId("c1"));
    thread.hydrate([
      {
        id: MessageId.createId("m2"),
        chatId: ChatId.createId("c1"),
        senderId: "u1",
        content: "second",
        createdAt: "2024-01-02T00:00:00.000Z",
      },
      {
        id: MessageId.createId("m1"),
        chatId: ChatId.createId("c1"),
        senderId: "u1",
        content: "first",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    const ids = thread.timeline().map((m) => m.id.value);
    expect(ids).toEqual(["m1", "m2"]);
    const events = thread.pullDomainEvents();
    expect(events.some((e) => e.type === "ThreadHydrated")).toBe(true);
  });

  it("should ignore duplicate MessageId when accepting live message", () => {
    const thread = ChatThread.empty(ChatId.createId("c1"));
    const incoming = {
      id: MessageId.createId("m1"),
      chatId: ChatId.createId("c1"),
      senderId: "u2",
      content: "hi",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    thread.accept(incoming);
    thread.accept(incoming);
    expect(thread.timeline()).toHaveLength(1);
  });

  it("should promote optimistic message when ClientMsgId matches", () => {
    const thread = ChatThread.empty(ChatId.createId("c1"));
    const { clientMsgId } = thread.sendOptimistic({
      content: "hello",
      senderId: "me",
    });
    thread.pullDomainEvents();
    thread.accept({
      id: MessageId.createId("server-1"),
      chatId: ChatId.createId("c1"),
      senderId: "me",
      content: "hello",
      createdAt: "2024-01-01T00:00:00.000Z",
      clientMsgId,
    });
    const timeline = thread.timeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0].id.value).toBe("server-1");
    expect(timeline[0].status.value).toBe("sent");
  });

  it("should emit MessageAccepted and LastMessageChanged when accepting", () => {
    const thread = ChatThread.empty(ChatId.createId("c1"));
    thread.accept({
      id: MessageId.createId("m1"),
      chatId: ChatId.createId("c1"),
      senderId: "u2",
      content: "hi",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    const types = thread.pullDomainEvents().map((e) => e.type);
    expect(types).toContain("MessageAccepted");
    expect(types).toContain("LastMessageChanged");
  });

  it("should refuse illegal delivery transition when Message transitions", () => {
    const msg = Message.create({
      id: MessageId.createId("m1"),
      chatId: "c1",
      senderId: "u1",
      content: "x",
      createdAt: "2024-01-01T00:00:00.000Z",
      status: "read",
    });
    expect(msg.transition(MessageDeliveryStatus.createStatus("sent"))).toBe(false);
    expect(msg.status.value).toBe("read");
  });
});
