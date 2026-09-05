import { mapServerChatPayloadToChat, ServerChatPayload } from "../chat.mapper";
import { ChatType, ChatEntity } from "@/chat/chat.model";

describe("chat.mapper", () => {
  describe("mapServerChatPayloadToChat", () => {
    it("maps basic individual chat", () => {
      const payload: ServerChatPayload = {
        id: "chat-1",
        name: "John Doe",
        type: "INDIVIDUAL",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.id).toBe("chat-1");
      expect(result.name).toBe("John Doe");
      expect(result.type).toBe(ChatType.Individual);
      expect(result.unreadCount).toBe(0);
      expect(result.isMuted).toBe(false);
      expect(result.isPinned).toBe(false);
      expect(result.isArchived).toBe(false);
    });

    it("maps group chat correctly", () => {
      const payload: ServerChatPayload = {
        id: "chat-2",
        name: "Team Group",
        type: "GROUP",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.type).toBe(ChatType.Group);
    });

    it("handles missing name with default value", () => {
      const payload: ServerChatPayload = {
        id: "chat-3",
        type: "INDIVIDUAL",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.name).toBe("Chat");
    });

    it("handles null name", () => {
      const payload: ServerChatPayload = {
        id: "chat-4",
        name: null,
        type: "INDIVIDUAL",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.name).toBe("Chat");
    });

    it("maps participants correctly", () => {
      const payload: ServerChatPayload = {
        id: "chat-5",
        name: "Group Chat",
        type: "GROUP",
        participants: [
          { id: "p1", userId: "u1", username: "Alice" },
          { id: "p2", userId: "u2", username: "Bob" },
        ],
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.participantIds).toEqual(["u1", "u2"]);
    });

    it("extracts participant id from user object when userId is missing", () => {
      const payload: ServerChatPayload = {
        id: "chat-6",
        name: "Test Chat",
        type: "GROUP",
        participants: [{ id: "p1", user: { id: "user-1", username: "Test" } }],
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.participantIds).toEqual(["user-1"]);
    });

    it("falls back to id when both userId and user.id are missing", () => {
      const payload: ServerChatPayload = {
        id: "chat-7",
        name: "Test Chat",
        type: "GROUP",
        participants: [{ id: "participant-id" }],
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.participantIds).toEqual(["participant-id"]);
    });

    it("maps last message correctly", () => {
      const payload: ServerChatPayload = {
        id: "chat-8",
        name: "Chat",
        updatedAt: "2024-06-15T12:00:00Z",
        lastMessage: {
          content: "Hello there!",
          createdAt: "2024-06-15T10:00:00Z",
          sender: { id: "s1", username: "Alice" },
        },
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.lastMessageContent).toBe("Hello there!");
      expect(result.lastMessageSender).toBe("Alice");
      expect(result.lastMessageTime).toBeInstanceOf(Date);
      const lastMessageTime = result.lastMessageTime as Date;
      expect(lastMessageTime.getTime()).toBe(
        new Date("2024-06-15T10:00:00Z").getTime(),
      );
    });

    it("handles null lastMessage", () => {
      const payload: ServerChatPayload = {
        id: "chat-9",
        name: "Empty Chat",
        updatedAt: "2024-06-15T12:00:00Z",
        lastMessage: null,
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.lastMessageContent).toBeUndefined();
      expect(result.lastMessageTime).toBeUndefined();
      expect(result.lastMessageSender).toBeUndefined();
    });

    it("maps avatar to groupImage", () => {
      const payload: ServerChatPayload = {
        id: "chat-10",
        name: "Group",
        avatar: "https://example.com/group.jpg",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.groupImage).toBe("https://example.com/group.jpg");
    });

    it("handles missing avatar", () => {
      const payload: ServerChatPayload = {
        id: "chat-11",
        name: "Chat",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.groupImage).toBeUndefined();
    });

    it("maps isMuted correctly", () => {
      const payload: ServerChatPayload = {
        id: "chat-12",
        name: "Muted Chat",
        isMuted: true,
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.isMuted).toBe(true);
    });

    it("defaults isMuted to false when missing", () => {
      const payload: ServerChatPayload = {
        id: "chat-13",
        name: "Chat",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.isMuted).toBe(false);
    });

    it("maps isArchived correctly", () => {
      const payload: ServerChatPayload = {
        id: "chat-14",
        name: "Archived Chat",
        isArchived: true,
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.isArchived).toBe(true);
    });

    it("defaults isArchived to false when missing", () => {
      const payload: ServerChatPayload = {
        id: "chat-15",
        name: "Chat",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.isArchived).toBe(false);
    });

    it("always sets unreadCount to 0", () => {
      const payload: ServerChatPayload = {
        id: "chat-16",
        name: "Chat",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.unreadCount).toBe(0);
    });

    it("always sets isPinned to false", () => {
      const payload: ServerChatPayload = {
        id: "chat-17",
        name: "Chat",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.isPinned).toBe(false);
    });

    it("always sets adminIds to empty array", () => {
      const payload: ServerChatPayload = {
        id: "chat-18",
        name: "Chat",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.adminIds).toEqual([]);
    });

    it("maps updatedAt to both updatedAt and createdAt", () => {
      const payload: ServerChatPayload = {
        id: "chat-19",
        name: "Chat",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBe(result.updatedAt.getTime());
    });

    it("handles missing updatedAt with current date", () => {
      const before = new Date();
      const payload: ServerChatPayload = {
        id: "chat-20",
        name: "Chat",
        updatedAt: new Date().toISOString(),
      };
      const result = mapServerChatPayloadToChat(payload);
      const after = new Date();

      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("recognizes GROUP type correctly", () => {
      const payload: ServerChatPayload = {
        id: "chat-21",
        name: "Group",
        type: "GROUP",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.type).toBe(ChatType.Group);
    });

    it("treats non-GROUP types as Individual", () => {
      const payload: ServerChatPayload = {
        id: "chat-22",
        name: "Chat",
        type: "BROADCAST",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.type).toBe(ChatType.Individual);
    });

    it("creates ChatEntity instance", () => {
      const payload: ServerChatPayload = {
        id: "chat-23",
        name: "Test Chat",
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result).toBeInstanceOf(ChatEntity);
    });

    it("handles complex nested participant structure", () => {
      const payload: ServerChatPayload = {
        id: "chat-24",
        name: "Complex Chat",
        type: "GROUP",
        participants: [
          {
            id: "p1",
            userId: "u1",
            user: { id: "u1", username: "User1", avatar: "avatar1.png" },
          },
          {
            id: "p2",
            user: { id: "u2", username: "User2", avatar: null },
          },
          {
            id: "p3",
          },
        ],
        updatedAt: "2024-06-15T12:00:00Z",
      };

      const result = mapServerChatPayloadToChat(payload);

      expect(result.participantIds).toEqual(["u1", "u2", "p3"]);
    });
  });
});
