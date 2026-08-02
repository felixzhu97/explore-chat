import { describe, it, expect } from "vitest";
import {
  mapApiChatRowToContact,
  mapApiMessageRowToMessage,
  mapUnknownToContactCreate,
  mapUnknownToMessageCreate,
  type ApiChatRow,
  type ApiMessageRow,
} from "../chats.mapper";

describe("chats.mapper", () => {
  describe("mapApiChatRowToContact", () => {
    it("should map basic chat row to contact", () => {
      const chat: ApiChatRow = {
        id: "chat-1",
        name: "Test Chat",
        avatar: "avatar.jpg",
        lastMessage: { content: "Hello there" },
        updatedAt: "2024-01-01T00:00:00Z",
        type: "INDIVIDUAL",
        participants: [{ isOnline: true }],
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.id).toBe("chat-1");
      expect(result.name).toBe("Test Chat");
      expect(result.avatar).toBe("avatar.jpg");
      expect(result.lastMessage).toBe("Hello there");
      expect(result.timestamp).toBe("2024-01-01T00:00:00Z");
      expect(result.isOnline).toBe(true);
      expect(result.isGroup).toBe(false);
      expect(result.unreadCount).toBe(0);
    });

    it("should map group chat correctly", () => {
      const chat: ApiChatRow = {
        id: "chat-2",
        name: "Team Group",
        avatar: "group.jpg",
        updatedAt: "2024-01-01T00:00:00Z",
        type: "GROUP",
        participants: [{ isOnline: false }, { isOnline: true }],
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.isGroup).toBe(true);
      expect(result.isOnline).toBe(true);
    });

    it("should use default name when name is missing", () => {
      const chat: ApiChatRow = {
        id: "chat-3",
        type: "INDIVIDUAL",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.name).toBe("Chat");
    });

    it("should use empty string for missing avatar", () => {
      const chat: ApiChatRow = {
        id: "chat-4",
        name: "Test",
        updatedAt: "2024-01-01T00:00:00Z",
        type: "INDIVIDUAL",
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.avatar).toBe("");
    });

    it("should handle missing lastMessage content", () => {
      const chat: ApiChatRow = {
        id: "chat-5",
        name: "Test",
        lastMessage: {},
        updatedAt: "2024-01-01T00:00:00Z",
        type: "INDIVIDUAL",
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.lastMessage).toBe("");
    });

    it("should handle missing lastMessage entirely", () => {
      const chat: ApiChatRow = {
        id: "chat-6",
        name: "Test",
        updatedAt: "2024-01-01T00:00:00Z",
        type: "INDIVIDUAL",
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.lastMessage).toBe("");
    });

    it("should handle missing updatedAt", () => {
      const chat: ApiChatRow = {
        id: "chat-7",
        name: "Test",
        type: "INDIVIDUAL",
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.timestamp).toBe("");
    });

    it("should return false for isOnline when no participants", () => {
      const chat: ApiChatRow = {
        id: "chat-8",
        name: "Test",
        updatedAt: "2024-01-01T00:00:00Z",
        type: "INDIVIDUAL",
        participants: [],
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.isOnline).toBe(false);
    });

    it("should return false for isOnline when all participants offline", () => {
      const chat: ApiChatRow = {
        id: "chat-9",
        name: "Test",
        updatedAt: "2024-01-01T00:00:00Z",
        type: "INDIVIDUAL",
        participants: [{ isOnline: false }, { isOnline: false }],
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.isOnline).toBe(false);
    });

    it("should recognize GROUP type as isGroup true", () => {
      const chat: ApiChatRow = {
        id: "chat-10",
        name: "Group",
        updatedAt: "2024-01-01T00:00:00Z",
        type: "GROUP",
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.isGroup).toBe(true);
    });

    it("should treat non-GROUP types as individual", () => {
      const chat: ApiChatRow = {
        id: "chat-11",
        name: "Broadcast",
        updatedAt: "2024-01-01T00:00:00Z",
        type: "BROADCAST",
      };

      const result = mapApiChatRowToContact(chat);

      expect(result.isGroup).toBe(false);
    });
  });

  describe("mapApiMessageRowToMessage", () => {
    it("should map basic message row to message", () => {
      const msg: ApiMessageRow = {
        id: "msg-1",
        senderId: "user-1",
        sender: { username: "Alice" },
        content: "Hello there",
        timestamp: "2024-01-01T00:00:00Z",
        type: "TEXT",
      };

      const result = mapApiMessageRowToMessage(msg);

      expect(result.id).toBe("msg-1");
      expect(result.senderId).toBe("user-1");
      expect(result.senderName).toBe("Alice");
      expect(result.content).toBe("Hello there");
      expect(result.timestamp).toBe("2024-01-01T00:00:00Z");
      expect(result.type).toBe("text");
      expect(result.status).toBe("delivered");
    });

    it("should use createdAt when timestamp is missing", () => {
      const msg: ApiMessageRow = {
        id: "msg-2",
        senderId: "user-1",
        content: "Test",
        createdAt: "2024-01-02T00:00:00Z",
        type: "TEXT",
      };

      const result = mapApiMessageRowToMessage(msg);

      expect(result.timestamp).toBe("2024-01-02T00:00:00Z");
    });

    it("should use current date when both timestamps are missing", () => {
      const before = new Date();
      const msg: ApiMessageRow = {
        id: "msg-3",
        senderId: "user-1",
        content: "Test",
        type: "TEXT",
      };

      const result = mapApiMessageRowToMessage(msg);
      const after = new Date();

      const resultTime = new Date(result.timestamp).getTime();
      expect(
        resultTime >= before.getTime() - 1000 &&
          resultTime <= after.getTime() + 1000,
      ).toBe(true);
    });

    it("should handle missing sender", () => {
      const msg: ApiMessageRow = {
        id: "msg-4",
        senderId: "user-1",
        content: "Test",
        timestamp: "2024-01-01T00:00:00Z",
        type: "TEXT",
      };

      const result = mapApiMessageRowToMessage(msg);

      expect(result.senderName).toBe("");
    });

    it("should handle IMAGE type message", () => {
      const msg: ApiMessageRow = {
        id: "msg-5",
        senderId: "user-1",
        content: "",
        timestamp: "2024-01-01T00:00:00Z",
        type: "IMAGE",
        mediaUrl: "https://example.com/image.jpg",
      };

      const result = mapApiMessageRowToMessage(msg);

      expect(result.type).toBe("image");
      expect(result.mediaUrl).toBe("https://example.com/image.jpg");
    });

    it("should handle VIDEO type message", () => {
      const msg: ApiMessageRow = {
        id: "msg-6",
        senderId: "user-1",
        content: "Check this video",
        timestamp: "2024-01-01T00:00:00Z",
        type: "VIDEO",
      };

      const result = mapApiMessageRowToMessage(msg);

      expect(result.type).toBe("video");
    });

    it("should handle lowercase type", () => {
      const msg: ApiMessageRow = {
        id: "msg-7",
        senderId: "user-1",
        content: "Test",
        timestamp: "2024-01-01T00:00:00Z",
        type: "text",
      };

      const result = mapApiMessageRowToMessage(msg);

      expect(result.type).toBe("text");
    });

    it("should default to text type when type is missing", () => {
      const msg: ApiMessageRow = {
        id: "msg-8",
        senderId: "user-1",
        content: "Test",
        timestamp: "2024-01-01T00:00:00Z",
      };

      const result = mapApiMessageRowToMessage(msg);

      expect(result.type).toBe("text");
    });
  });

  describe("mapUnknownToContactCreate", () => {
    it("should create contact from unknown data", () => {
      const data = {
        id: "contact-1",
        name: "John Doe",
        avatar: "john.jpg",
        lastMessage: "Hi",
        timestamp: "2024-01-01T00:00:00Z",
      };

      const result = mapUnknownToContactCreate(data);

      expect(result.id).toBe("contact-1");
      expect(result.name).toBe("John Doe");
      expect(result.avatar).toBe("john.jpg");
      expect(result.lastMessage).toBe("Hi");
      expect(result.timestamp).toBe("2024-01-01T00:00:00Z");
    });
  });

  describe("mapUnknownToMessageCreate", () => {
    it("should create message from unknown data", () => {
      const data = {
        id: "msg-1",
        senderId: "user-1",
        senderName: "Alice",
        content: "Hello",
        timestamp: "2024-01-01T00:00:00Z",
      };

      const result = mapUnknownToMessageCreate(data);

      expect(result.id).toBe("msg-1");
      expect(result.senderId).toBe("user-1");
      expect(result.senderName).toBe("Alice");
      expect(result.content).toBe("Hello");
      expect(result.timestamp).toBe("2024-01-01T00:00:00Z");
    });
  });
});
