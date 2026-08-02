import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mapApiChatRowToContact,
  mapApiMessageRowToMessage,
  mapUnknownToContactCreate,
  mapUnknownToMessageCreate,
  type ApiChatRow,
  type ApiMessageRow,
} from "@/chat/chats.mapper";

// =============================================================================
// TEST DOMAIN CONSTANTS
// =============================================================================

const TEST_TIMESTAMP = "2024-01-15T10:30:00Z";
const TEST_CREATED_AT = "2024-01-15T12:00:00Z";

// =============================================================================
// FACTORY FUNCTIONS - API Row Factories
// =============================================================================

let chatCounter = 0;
let messageCounter = 0;

const createApiChatRow = (overrides: Partial<ApiChatRow> = {}): ApiChatRow => {
  chatCounter++;
  return {
    id: `chat-${chatCounter}`,
    name: "Test Chat",
    avatar: "https://example.com/avatar.jpg",
    lastMessage: { content: "Hello there" },
    updatedAt: TEST_TIMESTAMP,
    type: "PRIVATE",
    participants: [{ isOnline: true }],
    ...overrides,
  };
};

const createApiMessageRow = (
  overrides: Partial<ApiMessageRow> = {},
): ApiMessageRow => {
  messageCounter++;
  return {
    id: `msg-${messageCounter}`,
    senderId: "user-456",
    sender: { username: "JohnDoe" },
    content: "Hello, world!",
    timestamp: TEST_TIMESTAMP,
    type: "text",
    ...overrides,
  };
};

// Specialized factories
const createPrivateChatRow = (
  overrides: Partial<ApiChatRow> = {},
): ApiChatRow =>
  createApiChatRow({
    type: "PRIVATE",
    participants: [{ isOnline: true }],
    ...overrides,
  });

const createGroupChatRow = (overrides: Partial<ApiChatRow> = {}): ApiChatRow =>
  createApiChatRow({
    type: "GROUP",
    participants: [{ isOnline: false }],
    ...overrides,
  });

const createOnlineChatRow = (overrides: Partial<ApiChatRow> = {}): ApiChatRow =>
  createApiChatRow({
    participants: [{ isOnline: true }, { isOnline: false }],
    ...overrides,
  });

const createOfflineChatRow = (
  overrides: Partial<ApiChatRow> = {},
): ApiChatRow =>
  createApiChatRow({ participants: [{ isOnline: false }], ...overrides });

const createEmptyParticipantsChatRow = (
  overrides: Partial<ApiChatRow> = {},
): ApiChatRow => createApiChatRow({ participants: [], ...overrides });

const createMediaMessageRow = (
  mediaUrl: string = "https://example.com/image.jpg",
  overrides: Partial<ApiMessageRow> = {},
): ApiMessageRow => createApiMessageRow({ mediaUrl, ...overrides });

const createTextMessageRow = (
  content: string = "Test message",
  overrides: Partial<ApiMessageRow> = {},
): ApiMessageRow =>
  createApiMessageRow({ content, type: "text", ...overrides });

// =============================================================================
// BOUNDARY VALUES
// =============================================================================

const BOUNDARY_VALUES = {
  EMPTY_STRING: "",
  SINGLE_CHAR: "a",
  MAX_LENGTH_1K: "a".repeat(1024),
  LONG_CONTENT: "a".repeat(5000),
};

// =============================================================================
// MESSAGE TYPE MAPPING - Equivalence Classes
// =============================================================================

const MESSAGE_TYPE_CASES = [
  { input: "TEXT", expected: "text" },
  { input: "IMAGE", expected: "image" },
  { input: "VIDEO", expected: "video" },
  { input: "AUDIO", expected: "audio" },
  { input: "FILE", expected: "file" },
  { input: "LOCATION", expected: "location" },
  { input: "CONTACT", expected: "contact" },
  { input: "VOICE", expected: "voice" },
  { input: "Text", expected: "text" },
  { input: "text", expected: "text" },
] as const;

// =============================================================================
// SUITE
// =============================================================================

describe("chats.mapper", () => {
  // ---------------------------------------------------------------------------
  // Factory Function Tests
  // ---------------------------------------------------------------------------

  describe("Factory Functions", () => {
    it("createApiChatRow should generate unique IDs", () => {
      const chat1 = createApiChatRow();
      const chat2 = createApiChatRow();
      expect(chat1.id).not.toBe(chat2.id);
    });

    it("createApiMessageRow should generate unique IDs", () => {
      const msg1 = createApiMessageRow();
      const msg2 = createApiMessageRow();
      expect(msg1.id).not.toBe(msg2.id);
    });

    it("createPrivateChatRow should create private chat structure", () => {
      const chat = createPrivateChatRow();
      expect(chat.type).toBe("PRIVATE");
      expect(chat.participants).toHaveLength(1);
    });

    it("createGroupChatRow should create group chat structure", () => {
      const chat = createGroupChatRow();
      expect(chat.type).toBe("GROUP");
    });

    it("createMediaMessageRow should create media message with url", () => {
      const msg = createMediaMessageRow("https://example.com/video.mp4");
      expect(msg.mediaUrl).toBe("https://example.com/video.mp4");
    });

    it("createTextMessageRow should create text message", () => {
      const msg = createTextMessageRow("Custom content");
      expect(msg.content).toBe("Custom content");
      expect(msg.type).toBe("text");
    });
  });

  // ---------------------------------------------------------------------------
  // mapApiChatRowToContact()
  // ---------------------------------------------------------------------------

  describe("mapApiChatRowToContact", () => {
    describe("basic mapping", () => {
      it("should map basic chat row to contact", () => {
        const apiChatRow = createApiChatRow();
        const contact = mapApiChatRowToContact(apiChatRow);

        expect(contact.id).toBe(apiChatRow.id);
        expect(contact.name).toBe(apiChatRow.name);
        expect(contact.avatar).toBe(apiChatRow.avatar);
        expect(contact.lastMessage).toBe("Hello there");
        expect(contact.timestamp).toBe(TEST_TIMESTAMP);
        expect(contact.isGroup).toBe(false);
        expect(contact.isOnline).toBe(true);
      });

      it("should handle minimal chat row", () => {
        const apiChatRow = createApiChatRow({
          name: undefined,
          avatar: undefined,
          lastMessage: undefined,
          updatedAt: undefined,
          type: undefined,
          participants: undefined,
        });
        const contact = mapApiChatRowToContact(apiChatRow);

        expect(contact.id).toBe(apiChatRow.id);
        expect(contact.name).toBe("Chat");
        expect(contact.avatar).toBe("");
        expect(contact.lastMessage).toBe("");
        expect(contact.timestamp).toBe("");
      });
    });

    describe("chat type mapping", () => {
      it("should map PRIVATE type to non-group contact", () => {
        const chat = createPrivateChatRow();
        const contact = mapApiChatRowToContact(chat);
        expect(contact.isGroup).toBe(false);
      });

      it("should map GROUP type to group contact", () => {
        const chat = createGroupChatRow();
        const contact = mapApiChatRowToContact(chat);
        expect(contact.isGroup).toBe(true);
      });

      it.each(["unknown", "BROADCAST", "", undefined])(
        "should map '%s' type to non-group contact",
        (type) => {
          const chat = createApiChatRow({ type });
          const contact = mapApiChatRowToContact(chat);
          expect(contact.isGroup).toBe(false);
        },
      );
    });

    describe("online status from participants", () => {
      it("should detect online when any participant is online", () => {
        const chat = createOnlineChatRow();
        const contact = mapApiChatRowToContact(chat);
        expect(contact.isOnline).toBe(true);
      });

      it("should detect offline when no participant is online", () => {
        const chat = createOfflineChatRow();
        const contact = mapApiChatRowToContact(chat);
        expect(contact.isOnline).toBe(false);
      });

      it("should detect offline when participants array is empty", () => {
        const chat = createEmptyParticipantsChatRow();
        const contact = mapApiChatRowToContact(chat);
        expect(contact.isOnline).toBe(false);
      });

      it("should detect offline when participants is undefined", () => {
        const chat = createApiChatRow({ participants: undefined });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.isOnline).toBe(false);
      });
    });

    describe("lastMessage content handling", () => {
      it("should extract content from lastMessage object", () => {
        const chat = createApiChatRow({
          lastMessage: { content: "Extracted message" },
        });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.lastMessage).toBe("Extracted message");
      });

      it("should handle empty lastMessage object", () => {
        const chat = createApiChatRow({ lastMessage: {} });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.lastMessage).toBe("");
      });

      it("should handle undefined lastMessage", () => {
        const chat = createApiChatRow({ lastMessage: undefined });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.lastMessage).toBe("");
      });

      it("should handle lastMessage with undefined content", () => {
        const chat = createApiChatRow({ lastMessage: { content: undefined } });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.lastMessage).toBe("");
      });
    });

    describe("default values", () => {
      it("should use 'Chat' as default name", () => {
        const chat = createApiChatRow({ name: undefined });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.name).toBe("Chat");
      });

      it("should use empty string as default avatar", () => {
        const chat = createApiChatRow({ avatar: undefined });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.avatar).toBe("");
      });

      it("should set unreadCount to 0", () => {
        const chat = createApiChatRow();
        const contact = mapApiChatRowToContact(chat);
        expect(contact.unreadCount).toBe(0);
      });
    });

    describe("field preservation", () => {
      it("should map all provided fields correctly", () => {
        const chat = createApiChatRow({
          id: "custom-chat-id",
          name: "Custom Name",
          avatar: "https://custom.com/avatar.png",
          lastMessage: { content: "Custom message" },
          updatedAt: "2024-06-15T14:30:00Z",
          type: "GROUP",
          participants: [{ isOnline: true }],
        });
        const contact = mapApiChatRowToContact(chat);

        expect(contact.id).toBe("custom-chat-id");
        expect(contact.name).toBe("Custom Name");
        expect(contact.avatar).toBe("https://custom.com/avatar.png");
        expect(contact.lastMessage).toBe("Custom message");
        expect(contact.timestamp).toBe("2024-06-15T14:30:00Z");
        expect(contact.isGroup).toBe(true);
        expect(contact.isOnline).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // mapApiMessageRowToMessage()
  // ---------------------------------------------------------------------------

  describe("mapApiMessageRowToMessage", () => {
    describe("basic mapping", () => {
      it("should map basic message row to message", () => {
        const apiMessageRow = createApiMessageRow();
        const message = mapApiMessageRowToMessage(apiMessageRow);

        expect(message.id).toBe(apiMessageRow.id);
        expect(message.senderId).toBe(apiMessageRow.senderId);
        expect(message.senderName).toBe("JohnDoe");
        expect(message.content).toBe("Hello, world!");
        expect(message.timestamp).toBe(TEST_TIMESTAMP);
        expect(message.type).toBe("text");
        expect(message.status).toBe("delivered");
      });
    });

    describe("timestamp handling", () => {
      it("should use timestamp when available", () => {
        const msg = createApiMessageRow({ timestamp: "2024-06-01T10:00:00Z" });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.timestamp).toBe("2024-06-01T10:00:00Z");
      });

      it("should fallback to createdAt when timestamp is missing", () => {
        const msg = createApiMessageRow({
          timestamp: undefined,
          createdAt: TEST_CREATED_AT,
        });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.timestamp).toBe(TEST_CREATED_AT);
      });

      it("should use current date string when both timestamps are missing", () => {
        const msg = createApiMessageRow({
          timestamp: undefined,
          createdAt: undefined,
        });
        const message = mapApiMessageRowToMessage(msg);

        expect(message.timestamp).toBeDefined();
        expect(typeof message.timestamp).toBe("string");
        expect(message.timestamp).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        );
      });

      it("should use empty string timestamp when provided", () => {
        const msg = createApiMessageRow({ timestamp: "" });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.timestamp).toBe("");
      });
    });

    describe("sender handling", () => {
      it("should extract username from sender object", () => {
        const msg = createApiMessageRow({ sender: { username: "TestUser" } });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.senderName).toBe("TestUser");
      });

      it("should use empty string when sender is missing", () => {
        const msg = createApiMessageRow({ sender: undefined });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.senderName).toBe("");
      });

      it("should use empty string when sender has no username", () => {
        const msg = createApiMessageRow({ sender: {} });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.senderName).toBe("");
      });

      it("should use empty string when sender username is undefined", () => {
        const msg = createApiMessageRow({ sender: { username: undefined } });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.senderName).toBe("");
      });
    });

    describe("type conversion", () => {
      it.each(MESSAGE_TYPE_CASES)(
        "should convert '$input' to '$expected'",
        ({ input, expected }) => {
          const msg = createApiMessageRow({ type: input });
          const message = mapApiMessageRowToMessage(msg);
          expect(message.type).toBe(expected);
        },
      );

      it("should default to text type when type is missing", () => {
        const msg = createApiMessageRow({ type: undefined });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.type).toBe("text");
      });

      it("should use empty string type when provided (nullish coalescing)", () => {
        const msg = createApiMessageRow({ type: "" });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.type).toBe("");
      });
    });

    describe("mediaUrl handling", () => {
      it("should include mediaUrl when present", () => {
        const msg = createMediaMessageRow("https://example.com/media.jpg");
        const message = mapApiMessageRowToMessage(msg);
        expect(message.mediaUrl).toBe("https://example.com/media.jpg");
      });

      it("should include mediaUrl when empty string", () => {
        const msg = createMediaMessageRow("");
        const message = mapApiMessageRowToMessage(msg);
        expect(message.mediaUrl).toBe("");
      });

      it("should not include mediaUrl property when undefined", () => {
        const msg = createApiMessageRow({ mediaUrl: undefined });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.mediaUrl).toBeUndefined();
      });
    });

    describe("status handling", () => {
      it("should always set status to 'delivered'", () => {
        const msg = createApiMessageRow();
        const message = mapApiMessageRowToMessage(msg);
        expect(message.status).toBe("delivered");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // mapUnknownToContactCreate()
  // ---------------------------------------------------------------------------

  describe("mapUnknownToContactCreate", () => {
    it("should create contact from valid unknown data", () => {
      const unknownData = {
        id: "contact-789",
        name: "Test Contact",
        avatar: "https://example.com/avatar.jpg",
        lastMessage: "Last message content",
        timestamp: TEST_TIMESTAMP,
        unreadCount: 5,
      };

      const contact = mapUnknownToContactCreate(unknownData);

      expect(contact.id).toBe("contact-789");
      expect(contact.name).toBe("Test Contact");
      expect(contact.avatar).toBe("https://example.com/avatar.jpg");
      expect(contact.lastMessage).toBe("Last message content");
      expect(contact.timestamp).toBe(TEST_TIMESTAMP);
      expect(contact.unreadCount).toBe(5);
    });

    it("should create contact with minimal data", () => {
      const unknownData = { id: "min-contact" };
      const contact = mapUnknownToContactCreate(unknownData);

      expect(contact.id).toBe("min-contact");
      expect(contact.name).toBeUndefined();
      expect(contact.avatar).toBeUndefined();
    });

    it("should handle empty object", () => {
      const unknownData = {};
      const contact = mapUnknownToContactCreate(unknownData);

      expect(contact.id).toBeUndefined();
      expect(contact.name).toBeUndefined();
    });

    it("should pass through all fields", () => {
      const unknownData = {
        id: "full-contact",
        name: "Full Contact",
        avatar: "https://avatar.url",
        lastMessage: "Latest message",
        timestamp: "2024-07-01T00:00:00Z",
        unreadCount: 10,
        isOnline: true,
        isGroup: true,
        phone: "+1234567890",
        email: "test@test.com",
        pinned: true,
        muted: true,
      };

      const contact = mapUnknownToContactCreate(unknownData);

      expect(contact.id).toBe("full-contact");
      expect(contact.name).toBe("Full Contact");
      expect(contact.avatar).toBe("https://avatar.url");
      expect(contact.lastMessage).toBe("Latest message");
      expect(contact.timestamp).toBe("2024-07-01T00:00:00Z");
      expect(contact.unreadCount).toBe(10);
      expect(contact.isOnline).toBe(true);
      expect(contact.isGroup).toBe(true);
      expect(contact.phone).toBe("+1234567890");
      expect(contact.email).toBe("test@test.com");
      expect(contact.pinned).toBe(true);
      expect(contact.muted).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // mapUnknownToMessageCreate()
  // ---------------------------------------------------------------------------

  describe("mapUnknownToMessageCreate", () => {
    it("should create message from valid unknown data", () => {
      const unknownData = {
        id: "msg-999",
        senderId: "sender-123",
        senderName: "Sender Name",
        content: "Test content",
        timestamp: TEST_TIMESTAMP,
        type: "image",
      };

      const message = mapUnknownToMessageCreate(unknownData);

      expect(message.id).toBe("msg-999");
      expect(message.senderId).toBe("sender-123");
      expect(message.senderName).toBe("Sender Name");
      expect(message.content).toBe("Test content");
      expect(message.timestamp).toBe(TEST_TIMESTAMP);
      expect(message.type).toBe("image");
    });

    it("should create message with minimal data", () => {
      const unknownData = {
        id: "min-msg",
        senderId: "min-sender",
        senderName: "Min Sender",
        content: "Min content",
        timestamp: "2024-01-01T00:00:00Z",
      };

      const message = mapUnknownToMessageCreate(unknownData);

      expect(message.id).toBe("min-msg");
      expect(message.senderId).toBe("min-sender");
      expect(message.type).toBe("text");
    });

    it("should handle empty object", () => {
      const unknownData = {};
      const message = mapUnknownToMessageCreate(unknownData);

      expect(message.id).toBeUndefined();
    });

    it("should pass through all optional fields", () => {
      const unknownData = {
        id: "full-msg",
        senderId: "full-sender",
        senderName: "Full Sender",
        content: "Full content",
        timestamp: "2024-08-01T00:00:00Z",
        type: "video",
        status: "sent",
        mediaUrl: "https://media.url/video.mp4",
        isStarred: true,
        isForwarded: true,
        replyTo: "reply-to-msg",
      };

      const message = mapUnknownToMessageCreate(unknownData);

      expect(message.id).toBe("full-msg");
      expect(message.senderId).toBe("full-sender");
      expect(message.senderName).toBe("Full Sender");
      expect(message.content).toBe("Full content");
      expect(message.timestamp).toBe("2024-08-01T00:00:00Z");
      expect(message.type).toBe("video");
      expect(message.status).toBe("sent");
      expect(message.mediaUrl).toBe("https://media.url/video.mp4");
      expect(message.isStarred).toBe(true);
      expect(message.isForwarded).toBe(true);
      expect(message.replyTo).toBe("reply-to-msg");
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  describe("edge cases", () => {
    describe("empty and whitespace values", () => {
      it("should handle empty string name", () => {
        const chat = createApiChatRow({ name: "" });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.name).toBe("Chat");
      });

      it("should handle whitespace-only name", () => {
        const chat = createApiChatRow({ name: "   " });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.name).toBe("   ");
      });

      it("should handle empty content", () => {
        const msg = createApiMessageRow({ content: "" });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.content).toBe("");
      });
    });

    describe("long content", () => {
      it("should handle long message content", () => {
        const msg = createApiMessageRow({
          content: BOUNDARY_VALUES.LONG_CONTENT,
        });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.content).toBe(BOUNDARY_VALUES.LONG_CONTENT);
      });

      it("should handle long chat name", () => {
        const chat = createApiChatRow({ name: BOUNDARY_VALUES.MAX_LENGTH_1K });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.name).toBe(BOUNDARY_VALUES.MAX_LENGTH_1K);
      });
    });

    describe("unicode and special characters", () => {
      it("should handle unicode in chat name", () => {
        const chat = createApiChatRow({ name: "群组聊天 👥" });
        const contact = mapApiChatRowToContact(chat);
        expect(contact.name).toBe("群组聊天 👥");
      });

      it("should handle unicode in message content", () => {
        const msg = createApiMessageRow({ content: "Hello! 🌍✨" });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.content).toBe("Hello! 🌍✨");
      });

      it("should handle unicode in sender name", () => {
        const msg = createApiMessageRow({ sender: { username: "张伟" } });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.senderName).toBe("张伟");
      });
    });

    describe("special types", () => {
      it("should handle voice message type", () => {
        const msg = createApiMessageRow({ type: "VOICE" });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.type).toBe("voice");
      });

      it("should handle contact message type", () => {
        const msg = createApiMessageRow({ type: "CONTACT" });
        const message = mapApiMessageRowToMessage(msg);
        expect(message.type).toBe("contact");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Integration Scenarios
  // ---------------------------------------------------------------------------

  describe("integration scenarios", () => {
    it("should map multiple chats from API response", () => {
      const apiChats: ApiChatRow[] = [
        createApiChatRow({ id: "chat-1", name: "Alice", type: "PRIVATE" }),
        createApiChatRow({ id: "chat-2", name: "Bob", type: "PRIVATE" }),
        createGroupChatRow({ id: "chat-3", name: "Team" }),
      ];

      const contacts = apiChats.map(mapApiChatRowToContact);

      expect(contacts).toHaveLength(3);
      expect(contacts[0].id).toBe("chat-1");
      expect(contacts[1].id).toBe("chat-2");
      expect(contacts[2].id).toBe("chat-3");
      expect(contacts[2].isGroup).toBe(true);
    });

    it("should map multiple messages from API response", () => {
      const apiMessages: ApiMessageRow[] = [
        createApiMessageRow({ id: "msg-1", content: "First message" }),
        createApiMessageRow({
          id: "msg-2",
          content: "Second message",
          type: "IMAGE",
        }),
        createApiMessageRow({
          id: "msg-3",
          content: "Third message",
          type: "VIDEO",
        }),
      ];

      const messages = apiMessages.map(mapApiMessageRowToMessage);

      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe("First message");
      expect(messages[1].type).toBe("image");
      expect(messages[2].type).toBe("video");
    });
  });
});
