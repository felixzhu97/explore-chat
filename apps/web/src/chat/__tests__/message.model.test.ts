import { describe, it, expect } from "vitest";
import {
  mapMessage,
  editMessage,
  toggleStarMessage,
  type MessageType,
  type MessageStatus,
} from "../message.model";

const baseMessageInput = {
  id: "msg-1",
  senderId: "user-1",
  senderName: "Alice",
  content: "Hello",
  timestamp: "2024-01-15T10:30:00Z",
};

describe("mapMessage", () => {
  it("should_applyDefaults_when_minimalInput", () => {
    const message = mapMessage(baseMessageInput);

    expect(message.type).toBe("text");
    expect(message.status).toBe("sending");
    expect(message.content).toBe("Hello");
  });

  it("should_preserveExplicitTypeAndStatus_when_provided", () => {
    const message = mapMessage({
      ...baseMessageInput,
      type: "image" as MessageType,
      status: "read" as MessageStatus,
      mediaUrl: "https://example.com/image.jpg",
    });

    expect(message.type).toBe("image");
    expect(message.status).toBe("read");
    expect(message.mediaUrl).toBe("https://example.com/image.jpg");
  });
});

describe("editMessage", () => {
  it("should_updateContentAndFlags_when_editing", () => {
    const original = mapMessage({ ...baseMessageInput, status: "sent" });
    const edited = editMessage(original, "Updated content");

    expect(edited.content).toBe("Updated content");
    expect(edited.isEdited).toBe(true);
    expect(edited.editedAt).toBeDefined();
    expect(edited.id).toBe(original.id);
  });
});

describe("toggleStarMessage", () => {
  it("should_toggleStarFlag_when_called", () => {
    const message = mapMessage({ ...baseMessageInput, isStarred: false });

    const starred = toggleStarMessage(message);
    expect(starred.isStarred).toBe(true);

    const unstarred = toggleStarMessage(starred);
    expect(unstarred.isStarred).toBe(false);
  });
});
