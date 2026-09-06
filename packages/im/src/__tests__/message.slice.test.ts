import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import type { Message } from "../domain";
import {
  messageReducer,
  addMessage,
  updateMessage,
  deleteMessage,
  setMessages,
} from "../application/message.slice";

describe("Message Slice", () => {
  const createTestStore = () =>
    configureStore({
      reducer: {
        message: messageReducer,
      },
    });

  const mockMessage: Message = {
    id: "msg-1",
    senderId: "user-1",
    senderName: "User 1",
    content: "Hello, World!",
    timestamp: "2024-01-15T10:30:00.000Z",
    type: "text",
    status: "sent",
  };

  const createMessage = (id: string, chatId: string): Message => ({
    ...mockMessage,
    id,
    senderId: `user-${id}`,
    content: `Message ${id}`,
  });

  describe("initial state", () => {
    it("should have empty messages object", () => {
      const store = createTestStore();
      expect(store.getState().message.messages).toEqual({});
    });
  });

  describe("addMessage", () => {
    it("should add message to empty chat", () => {
      const store = createTestStore();

      store.dispatch(addMessage({ chatId: "chat-1", message: mockMessage }));

      expect(store.getState().message.messages["chat-1"]).toHaveLength(1);
      expect(store.getState().message.messages["chat-1"][0]).toEqual(mockMessage);
    });

    it("should append message to existing chat", () => {
      const store = createTestStore();
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-1" } })
      );

      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-2" } })
      );

      expect(store.getState().message.messages["chat-1"]).toHaveLength(2);
    });

    it("should handle multiple different chats", () => {
      const store = createTestStore();

      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-1" } })
      );
      store.dispatch(
        addMessage({ chatId: "chat-2", message: { ...mockMessage, id: "msg-2" } })
      );

      expect(store.getState().message.messages["chat-1"]).toHaveLength(1);
      expect(store.getState().message.messages["chat-2"]).toHaveLength(1);
    });
  });

  describe("updateMessage", () => {
    it("should update existing message", () => {
      const store = createTestStore();
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-1" } })
      );

      store.dispatch(
        updateMessage({
          chatId: "chat-1",
          messageId: "msg-1",
          updates: { content: "Updated content" },
        })
      );

      expect(store.getState().message.messages["chat-1"][0].content).toBe(
        "Updated content"
      );
    });

    it("should not affect other messages", () => {
      const store = createTestStore();
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-1" } })
      );
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-2" } })
      );

      store.dispatch(
        updateMessage({
          chatId: "chat-1",
          messageId: "msg-1",
          updates: { content: "Updated" },
        })
      );

      expect(store.getState().message.messages["chat-1"][1].content).toBe(
        "Hello, World!"
      );
    });

    it("should not throw for non-existent chat", () => {
      const store = createTestStore();

      expect(() => {
        store.dispatch(
          updateMessage({
            chatId: "non-existent",
            messageId: "msg-1",
            updates: { content: "Should not fail" },
          })
        );
      }).not.toThrow();
    });

    it("should not throw for non-existent message", () => {
      const store = createTestStore();
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-1" } })
      );

      expect(() => {
        store.dispatch(
          updateMessage({
            chatId: "chat-1",
            messageId: "non-existent",
            updates: { content: "Should not fail" },
          })
        );
      }).not.toThrow();
    });

    it("should update message status", () => {
      const store = createTestStore();
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-1" } })
      );

      store.dispatch(
        updateMessage({
          chatId: "chat-1",
          messageId: "msg-1",
          updates: { status: "delivered" },
        })
      );

      expect(store.getState().message.messages["chat-1"][0].status).toBe("delivered");
    });
  });

  describe("deleteMessage", () => {
    it("should remove message by id", () => {
      const store = createTestStore();
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-1" } })
      );
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-2" } })
      );

      store.dispatch(deleteMessage({ chatId: "chat-1", messageId: "msg-1" }));

      expect(store.getState().message.messages["chat-1"]).toHaveLength(1);
      expect(store.getState().message.messages["chat-1"][0].id).toBe("msg-2");
    });

    it("should not affect other chats", () => {
      const store = createTestStore();
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-1" } })
      );
      store.dispatch(
        addMessage({ chatId: "chat-2", message: { ...mockMessage, id: "msg-2" } })
      );

      store.dispatch(deleteMessage({ chatId: "chat-1", messageId: "msg-1" }));

      expect(store.getState().message.messages["chat-2"]).toHaveLength(1);
    });

    it("should handle non-existent chat gracefully", () => {
      const store = createTestStore();

      expect(() => {
        store.dispatch(
          deleteMessage({ chatId: "non-existent", messageId: "msg-1" })
        );
      }).not.toThrow();
    });
  });

  describe("setMessages", () => {
    it("should set all messages for a chat", () => {
      const store = createTestStore();
      const messages: Message[] = [
        createMessage("msg-1", "chat-1"),
        createMessage("msg-2", "chat-1"),
      ];

      store.dispatch(setMessages({ chatId: "chat-1", messages }));

      expect(store.getState().message.messages["chat-1"]).toHaveLength(2);
    });

    it("should replace existing messages", () => {
      const store = createTestStore();
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "old" } })
      );

      store.dispatch(
        setMessages({
          chatId: "chat-1",
          messages: [createMessage("new-1", "chat-1")],
        })
      );

      expect(store.getState().message.messages["chat-1"]).toHaveLength(1);
      expect(store.getState().message.messages["chat-1"][0].id).toBe("new-1");
    });

    it("should handle empty array", () => {
      const store = createTestStore();
      store.dispatch(
        addMessage({ chatId: "chat-1", message: { ...mockMessage, id: "msg-1" } })
      );

      store.dispatch(setMessages({ chatId: "chat-1", messages: [] }));

      expect(store.getState().message.messages["chat-1"]).toHaveLength(0);
    });
  });

  describe("combined operations", () => {
    it("should handle full CRUD workflow", () => {
      const store = createTestStore();
      const chatId = "chat-1";

      // Create
      store.dispatch(addMessage({ chatId, message: createMessage("msg-1", chatId) }));
      expect(store.getState().message.messages[chatId]).toHaveLength(1);

      // Read
      expect(store.getState().message.messages[chatId][0].content).toBe("Message msg-1");

      // Update
      store.dispatch(
        updateMessage({
          chatId,
          messageId: "msg-1",
          updates: { content: "Updated message" },
        })
      );
      expect(store.getState().message.messages[chatId][0].content).toBe("Updated message");

      // Add more
      store.dispatch(addMessage({ chatId, message: createMessage("msg-2", chatId) }));
      expect(store.getState().message.messages[chatId]).toHaveLength(2);

      // Delete
      store.dispatch(deleteMessage({ chatId, messageId: "msg-1" }));
      expect(store.getState().message.messages[chatId]).toHaveLength(1);
      expect(store.getState().message.messages[chatId][0].id).toBe("msg-2");

      // Set messages
      store.dispatch(
        setMessages({
          chatId,
          messages: [createMessage("msg-3", chatId), createMessage("msg-4", chatId)],
        })
      );
      expect(store.getState().message.messages[chatId]).toHaveLength(2);
    });
  });
});
