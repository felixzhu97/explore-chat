import { describe, it, expect, vi } from "vitest";
import { Message, MessageType } from "@/messages/domain/message.entity";
import type { MessageReaction, ContactInfo } from "@whatschat/shared-types";
import {
  MESSAGE_DOMAIN,
  createTestMessage,
  createTestReactions,
  createTestContactInfo,
  createTestLocation,
} from "@whatschat/shared-types/test-utils/domain-values";

/**
 * Local factory functions that wrap domain factories with test-specific defaults
 */
const createMessage = (overrides?: Parameters<typeof Message.create>[0]) =>
  Message.create({
    id: MESSAGE_DOMAIN.VALID.id,
    chatId: MESSAGE_DOMAIN.VALID.chatId,
    senderId: MESSAGE_DOMAIN.VALID.senderId,
    type: "TEXT",
    content: MESSAGE_DOMAIN.VALID.content,
    ...overrides,
  });

const createTextMessage = (content: string = MESSAGE_DOMAIN.VALID.content) =>
  createMessage({ type: "TEXT", content });

const createMediaMessage = (type: MessageType) =>
  createMessage({
    type,
    mediaUrl: MESSAGE_DOMAIN.VALID.mediaUrl,
    thumbnailUrl: MESSAGE_DOMAIN.VALID.thumbnailUrl,
    size: MESSAGE_DOMAIN.VALID.size,
    ...(type === "VIDEO" ? { duration: MESSAGE_DOMAIN.VALID.duration } : {}),
  });

const createLocationMessage = () =>
  createMessage({
    type: "LOCATION",
    latitude: MESSAGE_DOMAIN.VALID.latitude,
    longitude: MESSAGE_DOMAIN.VALID.longitude,
  });

const createContactMessage = () =>
  createMessage({
    type: "CONTACT",
    contactInfo: createTestContactInfo(),
  });

const createForwardedMessage = () =>
  createMessage({
    isForwarded: true,
    originalMessageId: MESSAGE_DOMAIN.VALID.originalMessageId,
  });

const createReplyMessage = () =>
  createMessage({
    replyToMessageId: MESSAGE_DOMAIN.VALID.replyToMessageId,
  });

describe("Message Entity", () => {
  // ==========================================================================
  // CONSTRUCTOR TESTS
  // ==========================================================================
  describe("constructor", () => {
    it("should create a message with all required fields", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const reactions: MessageReaction[] = createTestReactions(2);

      const message = new Message(
        MESSAGE_DOMAIN.VALID.id,
        MESSAGE_DOMAIN.VALID.chatId,
        MESSAGE_DOMAIN.VALID.senderId,
        "TEXT",
        "Test content",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        false,
        false,
        undefined,
        undefined,
        reactions,
        ["user-2", "user-3"],
        createdAt,
        updatedAt,
      );

      expect(message.id).toBe(MESSAGE_DOMAIN.VALID.id);
      expect(message.chatId).toBe(MESSAGE_DOMAIN.VALID.chatId);
      expect(message.senderId).toBe(MESSAGE_DOMAIN.VALID.senderId);
      expect(message.type).toBe("TEXT");
      expect(message.content).toBe("Test content");
      expect(message.reactions).toHaveLength(2);
      expect(message.readBy).toContain("user-2");
      expect(message.readBy).toContain("user-3");
      expect(message.createdAt).toBe(createdAt);
      expect(message.updatedAt).toBe(updatedAt);
    });

    it("should use default values for optional fields", () => {
      const message = new Message(
        MESSAGE_DOMAIN.VALID.id,
        MESSAGE_DOMAIN.VALID.chatId,
        MESSAGE_DOMAIN.VALID.senderId,
        "TEXT",
        MESSAGE_DOMAIN.VALID.content,
      );

      expect(message.mediaUrl).toBeUndefined();
      expect(message.thumbnailUrl).toBeUndefined();
      expect(message.isEdited).toBe(false);
      expect(message.isDeleted).toBe(false);
      expect(message.isForwarded).toBe(false);
      expect(message.reactions).toEqual([]);
      expect(message.readBy).toEqual([]);
      expect(message.createdAt).toBeInstanceOf(Date);
      expect(message.updatedAt).toBeInstanceOf(Date);
    });
  });

  // ==========================================================================
  // MESSAGE.CREATE TESTS - MESSAGE TYPES (Parameterized)
  // ==========================================================================
  describe("Message.create - message types", () => {
    describe.each(MESSAGE_DOMAIN.TYPES)("type: %s", (type) => {
      it(`should create a valid ${type} message`, () => {
        const message = createMessage({ type });

        expect(message.type).toBe(type);
        expect(message.id).toBe(MESSAGE_DOMAIN.VALID.id);
      });
    });

    describe.each(MESSAGE_DOMAIN.TYPES)("with content: %s", (type) => {
      it("should store content correctly", () => {
        const content = "Test message content";
        const message = createMessage({ type, content });

        expect(message.content).toBe(content);
      });
    });
  });

  describe("Message.create - specific message types", () => {
    it("should create a text message with content", () => {
      const content = "Hello, World!";
      const message = createTextMessage(content);

      expect(message.type).toBe("TEXT");
      expect(message.content).toBe(content);
    });

    it.each(["IMAGE", "VIDEO", "AUDIO", "FILE"])(
      "should create a %s message with media",
      (type) => {
        const message = createMediaMessage(type as MessageType);

        expect(message.type).toBe(type);
        expect(message.mediaUrl).toBe(MESSAGE_DOMAIN.VALID.mediaUrl);
        expect(message.thumbnailUrl).toBe(MESSAGE_DOMAIN.VALID.thumbnailUrl);
        expect(message.size).toBe(MESSAGE_DOMAIN.VALID.size);
      },
    );

    it("should create a video message with duration", () => {
      const message = createMediaMessage("VIDEO");

      expect(message.type).toBe("VIDEO");
      expect(message.duration).toBe(MESSAGE_DOMAIN.VALID.duration);
    });

    it("should create a location message with coordinates", () => {
      const message = createLocationMessage();

      expect(message.type).toBe("LOCATION");
      expect(message.latitude).toBe(MESSAGE_DOMAIN.VALID.latitude);
      expect(message.longitude).toBe(MESSAGE_DOMAIN.VALID.longitude);
    });

    it("should create a contact message with contact info", () => {
      const contactInfo = createTestContactInfo();
      const message = createMessage({ type: "CONTACT", contactInfo });

      expect(message.type).toBe("CONTACT");
      expect(message.contactInfo).toEqual(contactInfo);
    });

    it("should create a voice message with duration", () => {
      const message = createMessage({
        type: "VOICE",
        duration: MESSAGE_DOMAIN.VALID.duration,
      });

      expect(message.type).toBe("VOICE");
      expect(message.duration).toBe(MESSAGE_DOMAIN.VALID.duration);
    });
  });

  // ==========================================================================
  // MESSAGE.CREATE TESTS - FORWARDING & REPLYING
  // ==========================================================================
  describe("Message.create - forwarded messages", () => {
    it("should mark message as forwarded", () => {
      const message = createForwardedMessage();

      expect(message.isForwarded).toBe(true);
      expect(message.originalMessageId).toBe(
        MESSAGE_DOMAIN.VALID.originalMessageId,
      );
    });

    it("should allow forwarded text messages", () => {
      const message = createForwardedMessage();

      expect(message.type).toBe("TEXT");
      expect(message.isForwarded).toBe(true);
    });
  });

  describe("Message.create - reply messages", () => {
    it("should link to original message", () => {
      const message = createReplyMessage();

      expect(message.replyToMessageId).toBe(
        MESSAGE_DOMAIN.VALID.replyToMessageId,
      );
    });

    it("should preserve reply content", () => {
      const content = "This is a reply";
      const message = createMessage({
        replyToMessageId: MESSAGE_DOMAIN.VALID.replyToMessageId,
        content,
      });

      expect(message.content).toBe(content);
      expect(message.replyToMessageId).toBe(
        MESSAGE_DOMAIN.VALID.replyToMessageId,
      );
    });
  });

  // ==========================================================================
  // MESSAGE.CREATE TESTS - REACTIONS
  // ==========================================================================
  describe("Message.create - reactions", () => {
    it("should create message with multiple reactions", () => {
      const reactions = createTestReactions(3);
      const message = createMessage({ reactions });

      expect(message.reactions).toHaveLength(3);
    });

    it("should create message with reactions from different users", () => {
      const reactions = createTestReactions(5);
      const message = createMessage({ reactions });

      const uniqueUserIds = new Set(message.reactions.map((r) => r.userId));
      expect(uniqueUserIds.size).toBe(5);
    });

    it("should create message with different emoji reactions", () => {
      const reactions = createTestReactions(4);
      const message = createMessage({ reactions });

      const uniqueEmojis = new Set(message.reactions.map((r) => r.emoji));
      expect(uniqueEmojis.size).toBeGreaterThanOrEqual(1);
    });

    it("should default to empty reactions array", () => {
      const message = createMessage();

      expect(message.reactions).toEqual([]);
    });
  });

  // ==========================================================================
  // MESSAGE.CREATE TESTS - READBY
  // ==========================================================================
  describe("Message.create - readBy", () => {
    it("should create message with multiple readBy entries", () => {
      const readBy = ["user-1", "user-2", "user-3"];
      const message = createMessage({ readBy });

      expect(message.readBy).toHaveLength(3);
      expect(message.readBy).toContain("user-1");
      expect(message.readBy).toContain("user-2");
      expect(message.readBy).toContain("user-3");
    });

    it("should default to empty readBy array", () => {
      const message = createMessage();

      expect(message.readBy).toEqual([]);
    });
  });

  // ==========================================================================
  // MESSAGE.CREATE TESTS - DATES
  // ==========================================================================
  describe("Message.create - timestamps", () => {
    it("should set custom createdAt and updatedAt", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const message = createMessage({ createdAt, updatedAt });

      expect(message.createdAt).toBe(createdAt);
      expect(message.updatedAt).toBe(updatedAt);
    });

    it("should set default timestamps when not provided", () => {
      const beforeCreate = new Date();
      const message = createMessage();
      const afterCreate = new Date();

      expect(message.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(message.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });
  });

  // ==========================================================================
  // EDIT TESTS
  // ==========================================================================
  describe("edit", () => {
    it("should return new message with edited content", () => {
      const message = createTextMessage("Original content");

      const editedMessage = message.edit("Edited content");

      expect(editedMessage.id).toBe(message.id);
      expect(editedMessage.content).toBe("Edited content");
      expect(editedMessage.isEdited).toBe(true);
    });

    it("should preserve other message properties when editing", () => {
      const originalMessage = createMessage({
        type: "IMAGE",
        mediaUrl: MESSAGE_DOMAIN.VALID.mediaUrl,
        reactions: createTestReactions(2),
        readBy: ["user-1", "user-2"],
      });

      const editedMessage = originalMessage.edit("New caption");

      expect(editedMessage.type).toBe("IMAGE");
      expect(editedMessage.mediaUrl).toBe(MESSAGE_DOMAIN.VALID.mediaUrl);
      expect(editedMessage.reactions).toHaveLength(2);
      expect(editedMessage.readBy).toContain("user-1");
      expect(editedMessage.isEdited).toBe(true);
    });

    it("should preserve original message unchanged (immutability)", () => {
      const originalMessage = createTextMessage("Original");
      const editedMessage = originalMessage.edit("Edited");

      expect(originalMessage.content).toBe("Original");
      expect(originalMessage.isEdited).toBe(false);
      expect(editedMessage.content).toBe("Edited");
      expect(editedMessage.isEdited).toBe(true);
    });

    it("should update the updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const message = createMessage({ updatedAt: originalDate });
      const beforeEdit = new Date();

      const editedMessage = message.edit("Edited");

      expect(editedMessage.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeEdit.getTime() - 1000,
      );
    });

    it("should not modify isDeleted when editing", () => {
      const deletedMessage = createMessage({ isDeleted: true });

      const editedMessage = deletedMessage.edit("New content");

      expect(editedMessage.isDeleted).toBe(true);
    });
  });

  // ==========================================================================
  // DELETE TESTS
  // ==========================================================================
  describe("delete", () => {
    it("should return new deleted message", () => {
      const message = createTextMessage("Message to delete");

      const deletedMessage = message.delete();

      expect(deletedMessage.id).toBe(message.id);
      expect(deletedMessage.isDeleted).toBe(true);
    });

    it("should preserve original message unchanged (immutability)", () => {
      const originalMessage = createTextMessage("Original");

      const deletedMessage = originalMessage.delete();

      expect(originalMessage.isDeleted).toBe(false);
      expect(deletedMessage.isDeleted).toBe(true);
    });

    it("should preserve content and other properties", () => {
      const originalMessage = createMessage({
        type: "IMAGE",
        mediaUrl: MESSAGE_DOMAIN.VALID.mediaUrl,
        reactions: createTestReactions(2),
      });

      const deletedMessage = originalMessage.delete();

      expect(deletedMessage.content).toBe(MESSAGE_DOMAIN.VALID.content);
      expect(deletedMessage.mediaUrl).toBe(MESSAGE_DOMAIN.VALID.mediaUrl);
      expect(deletedMessage.reactions).toHaveLength(2);
    });

    it("should update the updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const message = createMessage({ updatedAt: originalDate });
      const beforeDelete = new Date();

      const deletedMessage = message.delete();

      expect(deletedMessage.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeDelete.getTime() - 1000,
      );
    });

    it("should not modify isEdited when deleting", () => {
      const editedMessage = createMessage({ isEdited: true });

      const deletedMessage = editedMessage.delete();

      expect(deletedMessage.isEdited).toBe(true);
    });
  });

  // ==========================================================================
  // ADDREACTION TESTS
  // ==========================================================================
  describe("addReaction", () => {
    it("should add a new reaction to the message", () => {
      const message = createMessage();
      const userId = "user-new";
      const emoji = "👍";

      const reactedMessage = message.addReaction(userId, emoji);

      expect(reactedMessage.reactions).toHaveLength(1);
      expect(reactedMessage.reactions[0].userId).toBe(userId);
      expect(reactedMessage.reactions[0].emoji).toBe(emoji);
    });

    it("should add multiple reactions from different users", () => {
      let message = createMessage();

      message = message.addReaction("user-1", "👍");
      message = message.addReaction("user-2", "❤️");
      message = message.addReaction("user-3", "😂");

      expect(message.reactions).toHaveLength(3);
    });

    it("should not add duplicate reaction (same user + same emoji)", () => {
      let message = createMessage();

      message = message.addReaction("user-1", "👍");
      message = message.addReaction("user-1", "👍");

      expect(message.reactions).toHaveLength(1);
    });

    it("should allow same user to add different emojis", () => {
      let message = createMessage();

      message = message.addReaction("user-1", "👍");
      message = message.addReaction("user-1", "❤️");

      expect(message.reactions).toHaveLength(2);
    });

    it("should preserve original message unchanged (immutability)", () => {
      const originalMessage = createMessage();

      const reactedMessage = originalMessage.addReaction("user-1", "👍");

      expect(originalMessage.reactions).toHaveLength(0);
      expect(reactedMessage.reactions).toHaveLength(1);
    });

    it("should update the updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const message = createMessage({ updatedAt: originalDate });
      const beforeReaction = new Date();

      const reactedMessage = message.addReaction("user-1", "👍");

      expect(reactedMessage.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeReaction.getTime() - 1000,
      );
    });

    it("should add reaction with timestamp", () => {
      const message = createMessage();

      const reactedMessage = message.addReaction("user-1", "👍");

      expect(reactedMessage.reactions[0].createdAt).toBeInstanceOf(Date);
    });

    it.each(["👍", "❤️", "😂", "😢", "😮", "🎉", "🔥"])(
      "should support emoji: %s",
      (emoji) => {
        const message = createMessage();
        const reactedMessage = message.addReaction("user-1", emoji);

        expect(reactedMessage.reactions[0].emoji).toBe(emoji);
      },
    );
  });

  // ==========================================================================
  // MARKASREAD TESTS
  // ==========================================================================
  describe("markAsRead", () => {
    it("should add user to readBy list", () => {
      const message = createMessage();
      const userId = "user-1";

      const readMessage = message.markAsRead(userId);

      expect(readMessage.readBy).toContain(userId);
      expect(readMessage.readBy).toHaveLength(1);
    });

    it("should add multiple users to readBy list", () => {
      let message = createMessage();

      message = message.markAsRead("user-1");
      message = message.markAsRead("user-2");
      message = message.markAsRead("user-3");

      expect(message.readBy).toHaveLength(3);
      expect(message.readBy).toContain("user-1");
      expect(message.readBy).toContain("user-2");
      expect(message.readBy).toContain("user-3");
    });

    it("should not add duplicate user to readBy list", () => {
      let message = createMessage({ readBy: ["user-1"] });

      message = message.markAsRead("user-1");

      expect(message.readBy).toHaveLength(1);
    });

    it("should preserve original message unchanged (immutability)", () => {
      const originalMessage = createMessage();

      const readMessage = originalMessage.markAsRead("user-1");

      expect(originalMessage.readBy).toHaveLength(0);
      expect(readMessage.readBy).toHaveLength(1);
    });

    it("should preserve existing readBy entries when adding new one", () => {
      const message = createMessage({ readBy: ["user-1", "user-2"] });

      const readMessage = message.markAsRead("user-3");

      expect(readMessage.readBy).toHaveLength(3);
      expect(readMessage.readBy).toContain("user-1");
      expect(readMessage.readBy).toContain("user-2");
      expect(readMessage.readBy).toContain("user-3");
    });

    it("should update the updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const message = createMessage({ updatedAt: originalDate });
      const beforeRead = new Date();

      const readMessage = message.markAsRead("user-1");

      expect(readMessage.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeRead.getTime() - 1000,
      );
    });
  });

  // ==========================================================================
  // BOUNDARY VALUE TESTS
  // ==========================================================================
  describe("boundary values", () => {
    describe("ID lengths", () => {
      it("should accept minimum length ID", () => {
        const message = createMessage({ id: "a" });

        expect(message.id).toBe("a");
      });

      it("should accept maximum length ID", () => {
        const maxId = "a".repeat(MESSAGE_DOMAIN.BOUNDARY.maxIdLength);
        const message = createMessage({ id: maxId });

        expect(message.id).toHaveLength(MESSAGE_DOMAIN.BOUNDARY.maxIdLength);
      });
    });

    describe("content lengths", () => {
      it("should accept empty content for some message types", () => {
        const message = createMessage({ type: "IMAGE", content: "" });

        expect(message.content).toBe("");
      });

      it("should accept maximum length content", () => {
        const maxContent = "a".repeat(MESSAGE_DOMAIN.BOUNDARY.maxContentLength);
        const message = createMessage({ content: maxContent });

        expect(message.content).toHaveLength(
          MESSAGE_DOMAIN.BOUNDARY.maxContentLength,
        );
      });
    });

    describe("location coordinates", () => {
      it("should accept valid latitude (positive)", () => {
        const message = createMessage({
          type: "LOCATION",
          latitude: MESSAGE_DOMAIN.VALID.latitude,
          longitude: MESSAGE_DOMAIN.VALID.longitude,
        });

        expect(message.latitude).toBe(MESSAGE_DOMAIN.VALID.latitude);
      });

      it("should accept valid latitude (negative)", () => {
        const message = createMessage({
          type: "LOCATION",
          latitude: -MESSAGE_DOMAIN.VALID.latitude,
          longitude: MESSAGE_DOMAIN.VALID.longitude,
        });

        expect(message.latitude).toBe(-MESSAGE_DOMAIN.VALID.latitude);
      });

      it("should accept valid longitude (positive)", () => {
        const message = createMessage({
          type: "LOCATION",
          latitude: MESSAGE_DOMAIN.VALID.latitude,
          longitude: MESSAGE_DOMAIN.VALID.longitude,
        });

        expect(message.longitude).toBe(MESSAGE_DOMAIN.VALID.longitude);
      });

      it("should accept valid longitude (negative)", () => {
        const message = createMessage({
          type: "LOCATION",
          latitude: MESSAGE_DOMAIN.VALID.latitude,
          longitude: -MESSAGE_DOMAIN.VALID.longitude,
        });

        expect(message.longitude).toBe(-MESSAGE_DOMAIN.VALID.longitude);
      });
    });

    describe("duration bounds", () => {
      it("should accept zero duration", () => {
        const message = createMessage({ type: "AUDIO", duration: 0 });

        expect(message.duration).toBe(0);
      });

      it("should accept maximum duration", () => {
        const message = createMessage({
          type: "AUDIO",
          duration: MESSAGE_DOMAIN.BOUNDARY.maxDuration,
        });

        expect(message.duration).toBe(MESSAGE_DOMAIN.BOUNDARY.maxDuration);
      });
    });

    describe("size bounds", () => {
      it("should accept zero size", () => {
        const message = createMessage({ type: "FILE", size: 0 });

        expect(message.size).toBe(0);
      });

      it("should accept maximum size", () => {
        const message = createMessage({
          type: "FILE",
          size: MESSAGE_DOMAIN.BOUNDARY.maxSize,
        });

        expect(message.size).toBe(MESSAGE_DOMAIN.BOUNDARY.maxSize);
      });
    });
  });

  // ==========================================================================
  // MESSAGETYPE TYPE TESTS
  // ==========================================================================
  describe("MessageType", () => {
    it("should have valid MessageType type definition for all types", () => {
      const types: MessageType[] = [...MESSAGE_DOMAIN.TYPES];

      types.forEach((type) => {
        const message = createMessage({ type });
        expect(message.type).toBe(type);
      });
    });

    it.each(MESSAGE_DOMAIN.TYPES)(
      "should support lowercase type: %s",
      (type) => {
        const lowerType = type.toLowerCase();
        const message = createMessage({ type: lowerType as MessageType });

        expect(message.type).toBe(lowerType);
      },
    );
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  describe("edge cases", () => {
    it("should handle unicode content", () => {
      const unicodeContent = "Hello 🌍 你好 🎉";
      const message = createMessage({ content: unicodeContent });

      expect(message.content).toBe(unicodeContent);
    });

    it("should handle special characters in content", () => {
      const specialContent = "Test <script>alert('xss')</script>";
      const message = createMessage({ content: specialContent });

      expect(message.content).toBe(specialContent);
    });

    it("should handle very long IDs", () => {
      const longId = `msg_${"x".repeat(100)}`;
      const message = createMessage({ id: longId });

      expect(message.id).toBe(longId);
    });
  });
});
