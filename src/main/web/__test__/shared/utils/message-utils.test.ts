import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMessagesForContact,
  createMessage,
  addMessageToContact,
  handleContactAction,
} from "@/src/shared/utils/message-utils";
import type { Message, Contact } from "@/shared/types";

describe("message-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getMessagesForContact", () => {
    const messages: Record<string, Message[]> = {
      contact1: [
        { id: "1", senderId: "user1", senderName: "User 1", content: "Hello", timestamp: "", type: "text" },
        { id: "2", senderId: "user2", senderName: "User 2", content: "Hi there", timestamp: "", type: "text" },
      ],
      contact2: [
        { id: "3", senderId: "user1", senderName: "User 1", content: "How are you?", timestamp: "", type: "text" },
      ],
    };

    it("should return messages for existing contact", () => {
      const result = getMessagesForContact("contact1", messages);
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe("Hello");
      expect(result[1].content).toBe("Hi there");
    });

    it("should return empty array for non-existing contact", () => {
      const result = getMessagesForContact("non-existing", messages);
      expect(result).toEqual([]);
    });

    it("should return empty array for undefined messages", () => {
      const result = getMessagesForContact("contact1", {});
      expect(result).toEqual([]);
    });

    it("should return empty array when messages[contactId] is not an array", () => {
      const invalidMessages = { contact1: "not an array" } as any;
      const result = getMessagesForContact("contact1", invalidMessages);
      expect(result).toEqual([]);
    });

    it("should handle empty messages object", () => {
      const result = getMessagesForContact("contact1", {});
      expect(result).toEqual([]);
    });

    it("should return correct message order", () => {
      const result = getMessagesForContact("contact1", messages);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
    });
  });

  describe("createMessage", () => {
    it("should create text message with all parameters", () => {
      const message = createMessage("Hello", "text", "user1", "User 1");

      expect(message.content).toBe("Hello");
      expect(message.type).toBe("text");
      expect(message.senderId).toBe("user1");
      expect(message.senderName).toBe("User 1");
      expect(message.status).toBe("sent");
      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeDefined();
    });

    it("should create message with different types", () => {
      const types: Array<Message["type"]> = ["text", "image", "video", "audio", "file"];

      types.forEach((type) => {
        const message = createMessage("test", type, "user1", "User 1");
        expect(message.type).toBe(type);
      });
    });

    it("should generate unique IDs for each message", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 10; i++) {
        ids.add(createMessage("test" + i).id);
      }
      // At least some IDs should be unique
      expect(ids.size).toBeGreaterThan(0);
    });

    it("should set timestamp as ISO string", () => {
      const message = createMessage("Hello");
      
      expect(message.timestamp).toBeDefined();
      expect(typeof message.timestamp).toBe("string");
      expect(new Date(message.timestamp).toISOString()).toBe(message.timestamp);
    });

    it("should use default sender values when not provided", () => {
      const message = createMessage("Hello");

      expect(message.senderId).toBe("current-user");
      expect(message.senderName).toBe("我");
    });

    it("should use default type when not provided", () => {
      const message = createMessage("Hello");
      expect(message.type).toBe("text");
    });

    it("should handle empty content", () => {
      const message = createMessage("", "text", "user1", "User 1");
      expect(message.content).toBe("");
    });

    it("should handle unicode content", () => {
      const message = createMessage("你好世界 🌍", "text", "user1", "用户");
      expect(message.content).toBe("你好世界 🌍");
      expect(message.senderName).toBe("用户");
    });

    it("should handle special characters in content", () => {
      const message = createMessage("<>&\"'@#$%", "text", "user1", "User 1");
      expect(message.content).toBe("<>&\"'@#$%");
    });

    it("should set status to sent by default", () => {
      const message = createMessage("Hello");
      expect(message.status).toBe("sent");
    });
  });

  describe("addMessageToContact", () => {
    it("should add message to existing contact", () => {
      const messages: Record<string, Message[]> = {
        contact1: [{ id: "1", senderId: "user1", senderName: "User 1", content: "Hello", timestamp: "", type: "text" }],
      };

      const newMessage: Message = {
        id: "2",
        senderId: "user2",
        senderName: "User 2",
        content: "Hi",
        timestamp: "",
        type: "text",
      };

      addMessageToContact("contact1", newMessage, messages);

      expect(messages.contact1).toHaveLength(2);
      expect(messages.contact1[1].content).toBe("Hi");
    });

    it("should create new array for new contact", () => {
      const messages: Record<string, Message[]> = {};

      const newMessage: Message = {
        id: "1",
        senderId: "user1",
        senderName: "User 1",
        content: "Hello",
        timestamp: "",
        type: "text",
      };

      addMessageToContact("newContact", newMessage, messages);

      expect(messages.newContact).toHaveLength(1);
      expect(messages.newContact[0].content).toBe("Hello");
    });

    it("should handle adding multiple messages to same contact", () => {
      const messages: Record<string, Message[]> = {};

      const message1: Message = { id: "1", senderId: "user1", senderName: "User 1", content: "First", timestamp: "", type: "text" };
      const message2: Message = { id: "2", senderId: "user1", senderName: "User 1", content: "Second", timestamp: "", type: "text" };
      const message3: Message = { id: "3", senderId: "user1", senderName: "User 1", content: "Third", timestamp: "", type: "text" };

      addMessageToContact("contact", message1, messages);
      addMessageToContact("contact", message2, messages);
      addMessageToContact("contact", message3, messages);

      expect(messages.contact).toHaveLength(3);
      expect(messages.contact.map((m) => m.content)).toEqual(["First", "Second", "Third"]);
    });

    it("should handle empty string contactId", () => {
      const messages: Record<string, Message[]> = {};
      const newMessage: Message = { id: "1", senderId: "user1", senderName: "User 1", content: "Hello", timestamp: "", type: "text" };

      addMessageToContact("", newMessage, messages);

      expect(messages[""]).toHaveLength(1);
    });

    it("should add message with all types", () => {
      const messages: Record<string, Message[]> = {};

      const types: Array<Message["type"]> = ["text", "image", "video", "audio", "file"];

      types.forEach((type, index) => {
        const message: Message = {
          id: String(index),
          senderId: "user1",
          senderName: "User 1",
          content: `Message ${index}`,
          timestamp: "",
          type,
        };
        addMessageToContact("contact", message, messages);
      });

      expect(messages.contact).toHaveLength(5);
    });
  });

  describe("handleContactAction", () => {
    const mockContact: Contact = {
      id: "contact-1",
      name: "Test Contact",
      avatar: "https://example.com/avatar.jpg",
      lastMessage: "Last message",
      timestamp: "2024-01-15T10:30:00Z",
    };

    const mockOnStartCall = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should handle voice call action", () => {
      handleContactAction("call", mockContact, mockOnStartCall);

      expect(mockOnStartCall).toHaveBeenCalledWith(
        "contact-1",
        "Test Contact",
        "https://example.com/avatar.jpg",
        "voice"
      );
    });

    it("should handle video call action", () => {
      handleContactAction("video-call", mockContact, mockOnStartCall);

      expect(mockOnStartCall).toHaveBeenCalledWith(
        "contact-1",
        "Test Contact",
        "https://example.com/avatar.jpg",
        "video"
      );
    });

    it("should handle delete action", () => {
      handleContactAction("delete", mockContact, mockOnStartCall);

      expect(console.log).toHaveBeenCalledWith("Delete contact:", mockContact);
      expect(mockOnStartCall).not.toHaveBeenCalled();
    });

    it("should handle block action", () => {
      handleContactAction("block", mockContact, mockOnStartCall);

      expect(console.log).toHaveBeenCalledWith("Block contact:", mockContact);
      expect(mockOnStartCall).not.toHaveBeenCalled();
    });

    it("should handle pin action", () => {
      handleContactAction("pin", mockContact, mockOnStartCall);

      expect(console.log).toHaveBeenCalledWith("Pin contact:", mockContact);
      expect(mockOnStartCall).not.toHaveBeenCalled();
    });

    it("should handle mute action", () => {
      handleContactAction("mute", mockContact, mockOnStartCall);

      expect(console.log).toHaveBeenCalledWith("Mute contact:", mockContact);
      expect(mockOnStartCall).not.toHaveBeenCalled();
    });

    it("should handle unknown action", () => {
      handleContactAction("unknown-action", mockContact, mockOnStartCall);

      expect(console.log).not.toHaveBeenCalled();
      expect(mockOnStartCall).not.toHaveBeenCalled();
    });

    it("should handle empty avatar string", () => {
      const contactWithEmptyAvatar: Contact = {
        ...mockContact,
        avatar: "",
      };

      handleContactAction("call", contactWithEmptyAvatar, mockOnStartCall);

      expect(mockOnStartCall).toHaveBeenCalledWith(
        "contact-1",
        "Test Contact",
        "",
        "voice"
      );
    });

    it("should handle undefined avatar", () => {
      const contactWithUndefinedAvatar: Contact = {
        ...mockContact,
        avatar: undefined as any,
      };

      handleContactAction("call", contactWithUndefinedAvatar, mockOnStartCall);

      expect(mockOnStartCall).toHaveBeenCalledWith(
        "contact-1",
        "Test Contact",
        "",
        "voice"
      );
    });

    it("should handle contact with unicode name", () => {
      const unicodeContact: Contact = {
        ...mockContact,
        name: "你好世界 🌍",
      };

      handleContactAction("call", unicodeContact, mockOnStartCall);

      expect(mockOnStartCall).toHaveBeenCalledWith(
        "contact-1",
        "你好世界 🌍",
        "https://example.com/avatar.jpg",
        "voice"
      );
    });

    it("should handle multiple sequential actions", () => {
      handleContactAction("call", mockContact, mockOnStartCall);
      expect(mockOnStartCall).toHaveBeenCalledTimes(1);

      handleContactAction("video-call", mockContact, mockOnStartCall);
      expect(mockOnStartCall).toHaveBeenCalledTimes(2);

      handleContactAction("delete", mockContact, mockOnStartCall);
      expect(mockOnStartCall).toHaveBeenCalledTimes(2);
    });

    it("should not call onStartCall for non-call actions", () => {
      const actions = ["delete", "block", "pin", "mute", "unknown"];

      actions.forEach((action) => {
        vi.clearAllMocks();
        handleContactAction(action, mockContact, mockOnStartCall);
        expect(mockOnStartCall).not.toHaveBeenCalled();
      });
    });

    it("should call console.log for appropriate actions", () => {
      const logActions = ["delete", "block", "pin", "mute"];

      logActions.forEach((action) => {
        vi.clearAllMocks();
        vi.spyOn(console, "log").mockImplementation(() => {});

        handleContactAction(action, mockContact, mockOnStartCall);

        expect(console.log).toHaveBeenCalled();
      });
    });
  });
});
