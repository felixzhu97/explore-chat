import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import type { Chat } from "../domain";
import {
  chatReducer,
  setChats,
  addChat,
  updateChat,
  deleteChat,
  setSelectedChat,
} from "../application/chat.slice";

describe("Chat Slice", () => {
  const createTestStore = () =>
    configureStore({
      reducer: {
        chat: chatReducer,
      },
    });

  const mockChat: Chat = {
    id: "chat-1",
    name: "Test Chat",
    type: "private",
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe("initial state", () => {
    it("should have empty chats array", () => {
      const store = createTestStore();
      expect(store.getState().chat.chats).toEqual([]);
    });

    it("should have null selectedChat", () => {
      const store = createTestStore();
      expect(store.getState().chat.selectedChat).toBeNull();
    });
  });

  describe("setChats", () => {
    it("should set all chats", () => {
      const store = createTestStore();
      const chats: Chat[] = [
        mockChat,
        { ...mockChat, id: "chat-2", name: "Chat 2" },
      ];

      store.dispatch(setChats(chats));

      expect(store.getState().chat.chats).toHaveLength(2);
      expect(store.getState().chat.chats[0].id).toBe("chat-1");
      expect(store.getState().chat.chats[1].id).toBe("chat-2");
    });

    it("should replace existing chats", () => {
      const store = createTestStore();
      store.dispatch(setChats([mockChat]));
      store.dispatch(setChats([{ ...mockChat, id: "chat-2" }]));

      expect(store.getState().chat.chats).toHaveLength(1);
      expect(store.getState().chat.chats[0].id).toBe("chat-2");
    });
  });

  describe("addChat", () => {
    it("should add a single chat", () => {
      const store = createTestStore();

      store.dispatch(addChat(mockChat));

      expect(store.getState().chat.chats).toHaveLength(1);
      expect(store.getState().chat.chats[0]).toEqual(mockChat);
    });

    it("should append to existing chats", () => {
      const store = createTestStore();
      store.dispatch(addChat(mockChat));
      store.dispatch(addChat({ ...mockChat, id: "chat-2" }));

      expect(store.getState().chat.chats).toHaveLength(2);
    });
  });

  describe("updateChat", () => {
    it("should update existing chat", () => {
      const store = createTestStore();
      store.dispatch(setChats([mockChat]));

      store.dispatch(
        updateChat({
          chatId: "chat-1",
          updates: { name: "Updated Name" },
        })
      );

      expect(store.getState().chat.chats[0].name).toBe("Updated Name");
    });

    it("should not affect other properties", () => {
      const store = createTestStore();
      store.dispatch(setChats([mockChat]));

      store.dispatch(
        updateChat({
          chatId: "chat-1",
          updates: { name: "New Name" },
        })
      );

      expect(store.getState().chat.chats[0].id).toBe("chat-1");
      expect(store.getState().chat.chats[0].type).toBe("private");
    });

    it("should not throw for non-existent chat", () => {
      const store = createTestStore();
      store.dispatch(setChats([mockChat]));

      expect(() => {
        store.dispatch(
          updateChat({
            chatId: "non-existent",
            updates: { name: "Should not fail" },
          })
        );
      }).not.toThrow();
    });
  });

  describe("deleteChat", () => {
    it("should remove chat by id", () => {
      const store = createTestStore();
      store.dispatch(setChats([mockChat, { ...mockChat, id: "chat-2" }]));

      store.dispatch(deleteChat("chat-1"));

      expect(store.getState().chat.chats).toHaveLength(1);
      expect(store.getState().chat.chats[0].id).toBe("chat-2");
    });

    it("should clear selectedChat if deleted chat was selected", () => {
      const store = createTestStore();
      store.dispatch(setChats([mockChat]));
      store.dispatch(setSelectedChat(mockChat));

      store.dispatch(deleteChat("chat-1"));

      expect(store.getState().chat.selectedChat).toBeNull();
    });

    it("should not affect selectedChat if different chat was selected", () => {
      const store = createTestStore();
      const chat2 = { ...mockChat, id: "chat-2" };
      store.dispatch(setChats([mockChat, chat2]));
      store.dispatch(setSelectedChat(chat2));

      store.dispatch(deleteChat("chat-1"));

      expect(store.getState().chat.selectedChat).toEqual(chat2);
    });
  });

  describe("setSelectedChat", () => {
    it("should set selected chat", () => {
      const store = createTestStore();
      store.dispatch(setChats([mockChat]));

      store.dispatch(setSelectedChat(mockChat));

      expect(store.getState().chat.selectedChat).toEqual(mockChat);
    });

    it("should update selected chat", () => {
      const store = createTestStore();
      store.dispatch(setChats([mockChat]));
      store.dispatch(setSelectedChat(mockChat));

      const updated = { ...mockChat, name: "New Name" };
      store.dispatch(setSelectedChat(updated));

      expect(store.getState().chat.selectedChat?.name).toBe("New Name");
    });

    it("should set selectedChat to null", () => {
      const store = createTestStore();
      store.dispatch(setChats([mockChat]));
      store.dispatch(setSelectedChat(mockChat));

      store.dispatch(setSelectedChat(null));

      expect(store.getState().chat.selectedChat).toBeNull();
    });
  });

  describe("combined operations", () => {
    it("should handle full CRUD workflow", () => {
      const store = createTestStore();

      // Create
      store.dispatch(addChat(mockChat));
      expect(store.getState().chat.chats).toHaveLength(1);

      // Read
      expect(store.getState().chat.chats[0].name).toBe("Test Chat");

      // Update
      store.dispatch(
        updateChat({
          chatId: "chat-1",
          updates: { name: "Updated Chat" },
        })
      );
      expect(store.getState().chat.chats[0].name).toBe("Updated Chat");

      // Select
      store.dispatch(setSelectedChat(store.getState().chat.chats[0]));
      expect(store.getState().chat.selectedChat?.name).toBe("Updated Chat");

      // Delete
      store.dispatch(deleteChat("chat-1"));
      expect(store.getState().chat.chats).toHaveLength(0);
      expect(store.getState().chat.selectedChat).toBeNull();
    });
  });
});
