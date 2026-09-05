import { describe, it, expect } from "vitest";
import { Chat, ChatType } from "@/chats/domain/chat.entity";
import { Message } from "@/messages/domain/message.entity";
import { User } from "@/users/domain/user.entity";
import {
  CHAT_DOMAIN,
  MESSAGE_DOMAIN,
  USER_DOMAIN,
  createTestMessage,
  createTestUser,
  createTestMessages,
  createTestUsers,
} from "@whatschat/shared-types/test-utils/domain-values";

/**
 * Local factory functions that wrap domain factories with test-specific defaults
 */
const createChat = (overrides?: Parameters<typeof Chat.create>[0]) =>
  Chat.create({
    id: CHAT_DOMAIN.VALID.id,
    type: "PRIVATE",
    ...overrides,
  });

const createPrivateChat = (overrides?: Parameters<typeof Chat.create>[0]) =>
  createChat({ type: "PRIVATE", ...overrides });

const createGroupChat = (overrides?: Parameters<typeof Chat.create>[0]) =>
  createChat({ type: "GROUP", ...overrides });

const createUser = (
  id: string = USER_DOMAIN.VALID.id,
  username: string = USER_DOMAIN.VALID.username,
) =>
  User.create({
    id,
    username,
    email: `${username}@example.com`,
  });

const createMessage = (
  id: string = MESSAGE_DOMAIN.VALID.id,
  chatId: string = CHAT_DOMAIN.VALID.id,
  senderId: string = USER_DOMAIN.VALID.id,
  content: string = MESSAGE_DOMAIN.VALID.content,
) =>
  Message.create({
    id,
    chatId,
    senderId,
    type: "TEXT",
    content,
  });

const createParticipants = (count: number) =>
  createTestUsers(count).map((user) =>
    User.create({
      id: user.id,
      username: user.username,
      email: user.email,
    }),
  );

describe("Chat Entity", () => {
  // ==========================================================================
  // CONSTRUCTOR TESTS
  // ==========================================================================
  describe("constructor", () => {
    it("should create a private chat with all fields", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const participants = createParticipants(2);
      const lastMessage = createMessage(
        "msg-1",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "Hello!",
      );

      const chat = new Chat(
        CHAT_DOMAIN.VALID.id,
        "PRIVATE",
        CHAT_DOMAIN.VALID.name,
        CHAT_DOMAIN.VALID.avatar,
        participants,
        lastMessage,
        CHAT_DOMAIN.VALID.unreadCount,
        createdAt,
        updatedAt,
      );

      expect(chat.id).toBe(CHAT_DOMAIN.VALID.id);
      expect(chat.type).toBe("PRIVATE");
      expect(chat.name).toBe(CHAT_DOMAIN.VALID.name);
      expect(chat.avatar).toBe(CHAT_DOMAIN.VALID.avatar);
      expect(chat.participants).toHaveLength(2);
      expect(chat.lastMessage?.content).toBe("Hello!");
      expect(chat.unreadCount).toBe(CHAT_DOMAIN.VALID.unreadCount);
      expect(chat.createdAt).toBe(createdAt);
      expect(chat.updatedAt).toBe(updatedAt);
    });

    it("should use default values for optional fields", () => {
      const chat = new Chat(CHAT_DOMAIN.VALID.id, "PRIVATE");

      expect(chat.name).toBeUndefined();
      expect(chat.avatar).toBeUndefined();
      expect(chat.participants).toEqual([]);
      expect(chat.lastMessage).toBeUndefined();
      expect(chat.unreadCount).toBe(0);
      expect(chat.createdAt).toBeInstanceOf(Date);
      expect(chat.updatedAt).toBeInstanceOf(Date);
    });
  });

  // ==========================================================================
  // CHAT.CREATE TESTS - CHAT TYPES (Parameterized)
  // ==========================================================================
  describe("Chat.create - chat types", () => {
    describe.each(["PRIVATE", "GROUP"] as const)("type: %s", (type) => {
      it(`should create a valid ${type} chat`, () => {
        const chat = createChat({ type });

        expect(chat.type).toBe(type);
        expect(chat.id).toBe(CHAT_DOMAIN.VALID.id);
      });
    });

    it.each(CHAT_DOMAIN.TYPES)("should accept chat type: %s", (type) => {
      const chat = createChat({ type: type as ChatType });

      expect(chat.type).toBe(type);
    });
  });

  describe("Chat.create - private chat", () => {
    it("should create a private chat with minimal fields", () => {
      const chat = createPrivateChat();

      expect(chat.type).toBe("PRIVATE");
    });

    it("should create a private chat with name", () => {
      const chat = createPrivateChat({ name: "My Private Chat" });

      expect(chat.type).toBe("PRIVATE");
      expect(chat.name).toBe("My Private Chat");
    });

    it("should create a private chat with avatar", () => {
      const chat = createPrivateChat({
        avatar: "https://example.com/avatar.jpg",
      });

      expect(chat.type).toBe("PRIVATE");
      expect(chat.avatar).toBe("https://example.com/avatar.jpg");
    });
  });

  describe("Chat.create - group chat", () => {
    it("should create a group chat with name", () => {
      const chat = createGroupChat({ name: "My Group" });

      expect(chat.type).toBe("GROUP");
      expect(chat.name).toBe("My Group");
    });

    it("should create a group chat with participants", () => {
      const participants = createParticipants(3);
      const chat = createGroupChat({ participants });

      expect(chat.type).toBe("GROUP");
      expect(chat.participants).toHaveLength(3);
    });

    it("should create a group chat with description", () => {
      const chat = createGroupChat({
        name: "Group",
        avatar: CHAT_DOMAIN.VALID.avatar,
      });

      expect(chat.type).toBe("GROUP");
      expect(chat.avatar).toBe(CHAT_DOMAIN.VALID.avatar);
    });
  });

  // ==========================================================================
  // CHAT.CREATE TESTS - TIMESTAMPS & UNREADCOUNT
  // ==========================================================================
  describe("Chat.create - timestamps", () => {
    it("should set custom createdAt and updatedAt", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const chat = createChat({ createdAt, updatedAt });

      expect(chat.createdAt).toBe(createdAt);
      expect(chat.updatedAt).toBe(updatedAt);
    });

    it("should set default timestamps when not provided", () => {
      const beforeCreate = new Date();
      const chat = createChat();
      const afterCreate = new Date();

      expect(chat.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(chat.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });
  });

  describe("Chat.create - unreadCount", () => {
    it("should default unreadCount to 0", () => {
      const chat = createChat();

      expect(chat.unreadCount).toBe(0);
    });

    it("should accept custom unreadCount", () => {
      const chat = createChat({ unreadCount: 10 });

      expect(chat.unreadCount).toBe(10);
    });

    it("should accept zero unreadCount", () => {
      const chat = createChat({ unreadCount: 0 });

      expect(chat.unreadCount).toBe(0);
    });

    it("should accept maximum unreadCount", () => {
      const chat = createChat({
        unreadCount: CHAT_DOMAIN.BOUNDARY.maxUnreadCount,
      });

      expect(chat.unreadCount).toBe(CHAT_DOMAIN.BOUNDARY.maxUnreadCount);
    });
  });

  // ==========================================================================
  // CHAT.CREATE TESTS - PARTICIPANTS
  // ==========================================================================
  describe("Chat.create - participants", () => {
    it("should create chat with single participant", () => {
      const participants = createParticipants(1);
      const chat = createChat({ participants });

      expect(chat.participants).toHaveLength(1);
    });

    it("should create chat with multiple participants", () => {
      const participants = createParticipants(5);
      const chat = createChat({ participants });

      expect(chat.participants).toHaveLength(5);
    });

    it("should create chat with empty participants array", () => {
      const chat = createChat();

      expect(chat.participants).toEqual([]);
    });

    it("should preserve participant usernames", () => {
      const participants = createParticipants(3);
      const chat = createChat({ participants });

      expect(chat.participants[0].username).toBe(participants[0].username);
      expect(chat.participants[1].username).toBe(participants[1].username);
      expect(chat.participants[2].username).toBe(participants[2].username);
    });
  });

  // ==========================================================================
  // CHAT.CREATE TESTS - LAST MESSAGE
  // ==========================================================================
  describe("Chat.create - lastMessage", () => {
    it("should store the last message", () => {
      const lastMessage = createMessage(
        "msg-1",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "Last message",
      );
      const chat = createChat({ lastMessage });

      expect(chat.lastMessage).toBeDefined();
      expect(chat.lastMessage?.id).toBe("msg-1");
      expect(chat.lastMessage?.content).toBe("Last message");
    });

    it("should allow undefined lastMessage for new chat", () => {
      const chat = createChat();

      expect(chat.lastMessage).toBeUndefined();
    });

    it("should preserve last message properties", () => {
      const lastMessage = createMessage(
        "msg-1",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "Hello!",
      );
      const chat = createChat({ lastMessage });

      expect(chat.lastMessage?.type).toBe("TEXT");
      expect(chat.lastMessage?.chatId).toBe(CHAT_DOMAIN.VALID.id);
    });
  });

  // ==========================================================================
  // UPDATELASTMESSAGE TESTS
  // ==========================================================================
  describe("updateLastMessage", () => {
    it("should update the last message", () => {
      const chat = createChat();
      const newMessage = createMessage(
        "msg-2",
        CHAT_DOMAIN.VALID.id,
        "user-2",
        "New message",
      );

      const updatedChat = chat.updateLastMessage(newMessage);

      expect(updatedChat.lastMessage?.id).toBe("msg-2");
      expect(updatedChat.lastMessage?.content).toBe("New message");
    });

    it("should preserve other chat properties", () => {
      const participants = createParticipants(1);
      const chat = createChat({
        name: CHAT_DOMAIN.VALID.name,
        avatar: CHAT_DOMAIN.VALID.avatar,
        participants,
        unreadCount: 5,
      });
      const newMessage = createMessage(
        "msg-2",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "New message",
      );

      const updatedChat = chat.updateLastMessage(newMessage);

      expect(updatedChat.id).toBe(chat.id);
      expect(updatedChat.name).toBe(CHAT_DOMAIN.VALID.name);
      expect(updatedChat.avatar).toBe(CHAT_DOMAIN.VALID.avatar);
      expect(updatedChat.participants).toHaveLength(1);
      expect(updatedChat.unreadCount).toBe(5);
    });

    it("should preserve original chat unchanged (immutability)", () => {
      const chat = createChat();
      const newMessage = createMessage(
        "msg-2",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "New message",
      );

      const updatedChat = chat.updateLastMessage(newMessage);

      expect(chat.lastMessage).toBeUndefined();
      expect(updatedChat.lastMessage?.content).toBe("New message");
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const chat = createChat({ createdAt, updatedAt: createdAt });
      const newMessage = createMessage(
        "msg-2",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "New",
      );
      const beforeUpdate = new Date();

      const updatedChat = chat.updateLastMessage(newMessage);

      expect(updatedChat.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime() - 1000,
      );
    });

    it("should replace existing last message", () => {
      const firstMessage = createMessage(
        "msg-1",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "First",
      );
      const secondMessage = createMessage(
        "msg-2",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "Second",
      );
      const chat = createChat({ lastMessage: firstMessage });

      const updatedChat = chat.updateLastMessage(secondMessage);

      expect(updatedChat.lastMessage?.id).toBe("msg-2");
      expect(updatedChat.lastMessage?.content).toBe("Second");
    });
  });

  // ==========================================================================
  // INCREMENTUNREADCOUNT TESTS
  // ==========================================================================
  describe("incrementUnreadCount", () => {
    it("should increment unread count by 1", () => {
      const chat = createChat({ unreadCount: 5 });

      const updatedChat = chat.incrementUnreadCount();

      expect(updatedChat.unreadCount).toBe(6);
    });

    it("should increment from zero", () => {
      const chat = createChat({ unreadCount: 0 });

      const updatedChat = chat.incrementUnreadCount();

      expect(updatedChat.unreadCount).toBe(1);
    });

    it("should preserve original chat unchanged (immutability)", () => {
      const chat = createChat({ unreadCount: 5 });

      const updatedChat = chat.incrementUnreadCount();

      expect(chat.unreadCount).toBe(5);
      expect(updatedChat.unreadCount).toBe(6);
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const chat = createChat({ createdAt, updatedAt: createdAt });
      const beforeUpdate = new Date();

      const updatedChat = chat.incrementUnreadCount();

      expect(updatedChat.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime() - 1000,
      );
    });

    it("should preserve other chat properties when incrementing", () => {
      const participants = createParticipants(1);
      const lastMessage = createMessage(
        "msg-1",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "Hello!",
      );
      const chat = createChat({
        name: CHAT_DOMAIN.VALID.name,
        participants,
        lastMessage,
        unreadCount: 5,
      });

      const updatedChat = chat.incrementUnreadCount();

      expect(updatedChat.name).toBe(CHAT_DOMAIN.VALID.name);
      expect(updatedChat.participants).toHaveLength(1);
      expect(updatedChat.lastMessage?.id).toBe("msg-1");
      expect(updatedChat.unreadCount).toBe(6);
    });

    it("should allow multiple increments", () => {
      let chat = createChat({ unreadCount: 0 });

      chat = chat.incrementUnreadCount();
      chat = chat.incrementUnreadCount();
      chat = chat.incrementUnreadCount();

      expect(chat.unreadCount).toBe(3);
    });
  });

  // ==========================================================================
  // RESETUNREADCOUNT TESTS
  // ==========================================================================
  describe("resetUnreadCount", () => {
    it("should reset unread count to 0", () => {
      const chat = createChat({ unreadCount: 25 });

      const updatedChat = chat.resetUnreadCount();

      expect(updatedChat.unreadCount).toBe(0);
    });

    it("should preserve original chat unchanged (immutability)", () => {
      const chat = createChat({ unreadCount: 25 });

      const updatedChat = chat.resetUnreadCount();

      expect(chat.unreadCount).toBe(25);
      expect(updatedChat.unreadCount).toBe(0);
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const chat = createChat({
        createdAt,
        updatedAt: createdAt,
        unreadCount: 10,
      });
      const beforeUpdate = new Date();

      const updatedChat = chat.resetUnreadCount();

      expect(updatedChat.unreadCount).toBe(0);
      expect(updatedChat.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime() - 1000,
      );
    });

    it("should preserve other chat properties when resetting", () => {
      const participants = createParticipants(1);
      const lastMessage = createMessage(
        "msg-1",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "Hello!",
      );
      const chat = createChat({
        name: CHAT_DOMAIN.VALID.name,
        participants,
        lastMessage,
        unreadCount: 10,
      });

      const updatedChat = chat.resetUnreadCount();

      expect(updatedChat.name).toBe(CHAT_DOMAIN.VALID.name);
      expect(updatedChat.participants).toHaveLength(1);
      expect(updatedChat.lastMessage?.id).toBe("msg-1");
      expect(updatedChat.unreadCount).toBe(0);
    });

    it("should reset when already at zero", () => {
      const chat = createChat({ unreadCount: 0 });

      const updatedChat = chat.resetUnreadCount();

      expect(updatedChat.unreadCount).toBe(0);
    });
  });

  // ==========================================================================
  // ENSUREPARTICIPANT TESTS
  // ==========================================================================
  describe("ensureParticipant", () => {
    it("should allow when userId is a participant", () => {
      const participants = createParticipants(2);
      const chat = createChat({ participants });

      expect(() => chat.ensureParticipant(participants[0]!.id)).not.toThrow();
    });

    it("should throw when userId is not a participant", () => {
      const participants = createParticipants(2);
      const chat = createChat({ participants });

      expect(() => chat.ensureParticipant("stranger-id")).toThrow(
        "No permission to send messages to this chat",
      );
    });
  });

  // ==========================================================================
  // CHATTYPE TYPE TESTS
  // ==========================================================================
  describe("ChatType", () => {
    it("should support PRIVATE chat type", () => {
      const chat = createChat({ type: "PRIVATE" });
      expect(chat.type).toBe("PRIVATE");
    });

    it("should support GROUP chat type", () => {
      const chat = createChat({ type: "GROUP" });
      expect(chat.type).toBe("GROUP");
    });

    it("should have valid ChatType type definition", () => {
      const privateType: ChatType = "PRIVATE";
      const groupType: ChatType = "GROUP";

      expect(privateType).toBe("PRIVATE");
      expect(groupType).toBe("GROUP");
    });
  });

  // ==========================================================================
  // BOUNDARY VALUE TESTS
  // ==========================================================================
  describe("boundary values", () => {
    describe("unreadCount", () => {
      it("should accept minimum unreadCount (0)", () => {
        const chat = createChat({
          unreadCount: CHAT_DOMAIN.BOUNDARY.minUnreadCount,
        });

        expect(chat.unreadCount).toBe(0);
      });

      it("should accept maximum unreadCount", () => {
        const chat = createChat({
          unreadCount: CHAT_DOMAIN.BOUNDARY.maxUnreadCount,
        });

        expect(chat.unreadCount).toBe(CHAT_DOMAIN.BOUNDARY.maxUnreadCount);
      });

      it("should accept very large unreadCount", () => {
        const chat = createChat({ unreadCount: 100000 });

        expect(chat.unreadCount).toBe(100000);
      });
    });

    describe("participant counts", () => {
      it("should accept empty participants", () => {
        const chat = createChat({ participants: [] });

        expect(chat.participants).toHaveLength(0);
      });

      it("should accept maximum participant count", () => {
        const participants = createParticipants(
          CHAT_DOMAIN.BOUNDARY.maxMemberCount,
        );
        const chat = createChat({ participants });

        expect(chat.participants).toHaveLength(
          CHAT_DOMAIN.BOUNDARY.maxMemberCount,
        );
      });
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  describe("edge cases", () => {
    it("should handle chat with unicode name", () => {
      const chat = createChat({ name: "群组 🎉" });

      expect(chat.name).toBe("群组 🎉");
    });

    it("should handle chat with special characters in name", () => {
      const chat = createChat({ name: "Test & Chat <Group>" });

      expect(chat.name).toBe("Test & Chat <Group>");
    });

    it("should handle very long chat name", () => {
      const longName = "A".repeat(255);
      const chat = createChat({ name: longName });

      expect(chat.name).toHaveLength(255);
    });

    it("should handle undefined name for private chat", () => {
      const chat = createChat({ type: "PRIVATE" });

      expect(chat.name).toBeUndefined();
    });

    it("should handle message with special content in lastMessage", () => {
      const specialContent = "Message with <script>alert('xss')</script>";
      const lastMessage = createMessage(
        "msg-1",
        CHAT_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        specialContent,
      );
      const chat = createChat({ lastMessage });

      expect(chat.lastMessage?.content).toBe(specialContent);
    });
  });
});
