import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessagesService } from "@/chat/services/messages.service";
import { bindAppStore } from "@/layout/store-access";

const mockMessage = {
  id: "msg-1",
  senderId: "user-1",
  senderName: "Test",
  content: "Hello",
  timestamp: new Date().toISOString(),
  type: "text" as const,
  status: "sent" as const,
  isStarred: false,
};

const mockStore = {
  getState: vi.fn(() => ({
    messages: {
      messages: { "contact-1": [mockMessage] },
      currentUserId: "user-1",
      searchResults: [],
      starredMessages: [],
      typingUsers: {},
      selectedMessages: [],
      replyingTo: null,
      editingMessage: null,
    },
  })),
  dispatch: vi.fn(),
};

describe("MessagesService", () => {
  let messagesService: MessagesService;

  beforeEach(() => {
    vi.clearAllMocks();
    bindAppStore(mockStore);
    messagesService = new MessagesService();
  });

  describe("constructor", () => {
    it("should create instance without error", () => {
      expect(messagesService).toBeDefined();
    });
  });

  describe("getMessagesForContact", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.getMessagesForContact("contact-1"),
      ).not.toThrow();
    });
  });

  describe("addMessage", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.addMessage("contact-1", mockMessage as any),
      ).not.toThrow();
    });
  });

  describe("updateMessage", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.updateMessage("contact-1", "msg-1", {
          content: "Updated",
        }),
      ).not.toThrow();
    });
  });

  describe("deleteMessage", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.deleteMessage("contact-1", "msg-1"),
      ).not.toThrow();
    });
  });

  describe("deleteMessages", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.deleteMessages("contact-1", ["msg-1"]),
      ).not.toThrow();
    });
  });

  describe("sendMessage", () => {
    it("should be callable", async () => {
      await expect(
        messagesService.sendMessage("contact-1", "Hello"),
      ).resolves.not.toThrow();
    });
  });

  describe("editMessageContent", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.editMessageContent("contact-1", "msg-1", "Edited"),
      ).not.toThrow();
    });
  });

  describe("forwardMessage", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.forwardMessage("msg-1", ["contact-2"]),
      ).not.toThrow();
    });
  });

  describe("replyToMessage", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.replyToMessage(
          "contact-1",
          mockMessage as any,
          "Reply",
        ),
      ).not.toThrow();
    });
  });

  describe("markAsRead", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.markAsRead("contact-1", ["msg-1"]),
      ).not.toThrow();
    });
  });

  describe("markAsDelivered", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.markAsDelivered("contact-1", ["msg-1"]),
      ).not.toThrow();
    });
  });

  describe("updateMessageStatus", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.updateMessageStatus("contact-1", "msg-1", "read"),
      ).not.toThrow();
    });
  });

  describe("toggleStarMessage", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.toggleStarMessage("contact-1", "msg-1"),
      ).not.toThrow();
    });
  });

  describe("getStarredMessages", () => {
    it("should be callable", () => {
      expect(() => messagesService.getStarredMessages()).not.toThrow();
    });
  });

  describe("searchMessages", () => {
    it("should be callable", () => {
      expect(() => messagesService.searchMessages("hello")).not.toThrow();
    });
  });

  describe("getMessageById", () => {
    it("should be callable", () => {
      expect(() =>
        messagesService.getMessageById("contact-1", "msg-1"),
      ).not.toThrow();
    });
  });

  describe("getLastMessage", () => {
    it("should be callable", () => {
      expect(() => messagesService.getLastMessage("contact-1")).not.toThrow();
    });
  });

  describe("getUnreadCount", () => {
    it("should be callable", () => {
      expect(() => messagesService.getUnreadCount("contact-1")).not.toThrow();
    });
  });

  describe("setTyping", () => {
    it("should be callable", () => {
      expect(() => messagesService.setTyping("contact-1", true)).not.toThrow();
    });
  });

  describe("isUserTyping", () => {
    it("should be callable", () => {
      expect(() => messagesService.isUserTyping("contact-1")).not.toThrow();
    });
  });
});
