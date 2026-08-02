import {
  mapServerMessagePayload,
  mapServerMessagePayloadToMessage,
} from "@/chat/message.mapper";
import { MessageType, MessageStatus } from "@/chat/message.model";

describe("message.mapper", () => {
  it("mapServerMessagePayloadToMessage maps TEXT", () => {
    const m = mapServerMessagePayloadToMessage({
      id: "1",
      chatId: "c1",
      senderId: "s1",
      type: "TEXT",
      content: "hi",
      createdAt: "2024-01-01T00:00:00Z",
      sender: { id: "s1", username: "bob" },
    });
    expect(m.type).toBe(MessageType.Text);
    expect(m.status).toBe(MessageStatus.Sent);
    expect(m.content).toBe("hi");
    expect(m.senderName).toBe("bob");
  });

  it("mapServerMessagePayload maps record", () => {
    const m = mapServerMessagePayload({
      id: "2",
      chatId: "c1",
      senderId: "s1",
      type: "IMAGE",
      content: "url",
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(m.type).toBe(MessageType.Image);
  });
});
