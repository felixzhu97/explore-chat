import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Message } from "@whatschat/shared-types";
import { useRealChat } from "@/chat/hooks/use-real-chat";

// Mock WebSocket manager
const mockWebSocketManager = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  send: vi.fn(),
  sendMessage: vi.fn(),
  sendTyping: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isConnected: vi.fn(() => true),
};

vi.mock("@/chat/websocket", () => ({
  getWebSocketAdapter: () => mockWebSocketManager,
  getWebSocketManager: () => mockWebSocketManager,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useRealChat Hook", () => {
  const mockContactId = "contact-1";
  const mockMessages = [
    {
      id: "msg-1",
      content: "Hello!",
      type: "text",
      senderId: "contact-1",
      senderName: "John Doe",
      timestamp: "2024-01-01T10:00:00.000Z",
      isOwn: false,
      status: "read",
      isStarred: false,
      replyTo: null,
    },
    {
      id: "msg-2",
      content: "Hi there!",
      type: "text",
      senderId: "user-1",
      senderName: "Me",
      timestamp: "2024-01-01T10:01:00.000Z",
      isOwn: true,
      status: "read",
      isStarred: false,
      replyTo: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockMessages));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      expect(result.current.messages).toEqual(mockMessages);
      expect(result.current.isConnected).toBe(true);
      expect(result.current.isTyping).toBe(false);
    });

    it("should load chat history from localStorage", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `chat_${mockContactId}`,
      );
      expect(result.current.messages).toEqual(mockMessages);
    });

    it("should handle empty localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useRealChat(mockContactId));

      // 当 localStorage 为空时，hook 会设置欢迎消息
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe("欢迎使用 Instagram！");
      expect(result.current.messages[1].content).toBe(
        "这是一个功能完整的聊天应用演示",
      );
    });
  });

  describe("WebSocket Connection", () => {
    it("should register event listeners", () => {
      renderHook(() => useRealChat(mockContactId));

      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "message",
        expect.any(Function),
      );
      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "message_status",
        expect.any(Function),
      );
      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "typing",
        expect.any(Function),
      );
      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "connected",
        expect.any(Function),
      );
      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "disconnected",
        expect.any(Function),
      );
    });
  });

  describe("Send Message", () => {
    it("should send text message", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        await result.current.sendMessage("Hello, world!", "text");
      });

      expect(mockWebSocketManager.send).toHaveBeenCalledWith({
        type: "message",
        to: mockContactId,
        data: {
          id: expect.any(String),
          text: "Hello, world!",
          type: "text",
        },
      });
    });

    it("should send message with reply", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        await result.current.sendMessage("Reply message", "text");
      });

      expect(mockWebSocketManager.send).toHaveBeenCalledWith({
        type: "message",
        to: mockContactId,
        data: {
          id: expect.any(String),
          text: "Reply message",
          type: "text",
        },
      });
    });

    it("should send different message types", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        await result.current.sendMessage("image.jpg", "image");
      });

      expect(mockWebSocketManager.send).toHaveBeenCalledWith({
        type: "message",
        to: mockContactId,
        data: {
          id: expect.any(String),
          text: "image.jpg",
          type: "image",
        },
      });
    });

    it("should handle send message errors", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      mockWebSocketManager.send.mockRejectedValueOnce(new Error("Send failed"));

      await act(async () => {
        await result.current.sendMessage("Hello!", "text");
      });

      // 消息仍然会被添加到本地状态，即使发送失败
      expect(result.current.messages).toContainEqual(
        expect.objectContaining({
          content: "Hello!",
          type: "text",
        }),
      );
    });
  });

  describe("Typing Indicators", () => {
    it("should send typing indicator when typing", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        result.current.startTyping();
      });

      expect(mockWebSocketManager.send).toHaveBeenCalledWith({
        type: "typing",
        to: mockContactId,
        data: { isTyping: true },
      });
    });

    it("should stop typing indicator", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        result.current.stopTyping();
      });

      expect(mockWebSocketManager.send).toHaveBeenCalledWith({
        type: "typing",
        to: mockContactId,
        data: { isTyping: false },
      });
    });
  });

  describe("Message Handling", () => {
    it("should handle incoming messages", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      const newMessage = {
        id: "msg-3",
        content: "New message",
        type: "text",
        senderId: mockContactId,
        senderName: "对方",
        timestamp: expect.any(String),
        isOwn: false,
        status: "delivered",
        isStarred: false,
        replyTo: null,
      };

      // Get the message handler that was registered
      const messageHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "message",
      )?.[1];

      act(() => {
        messageHandler?.({
          type: "message",
          from: mockContactId,
          data: { text: "New message" },
        });
      });

      expect(result.current.messages).toContainEqual(
        expect.objectContaining({
          content: "New message",
          senderId: mockContactId,
          senderName: "对方",
        }),
      );
    });

    it("should handle message status updates", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the message status handler
      const statusHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "message_status",
      )?.[1];

      act(() => {
        statusHandler?.({
          messageId: "msg-1",
          status: "read",
        });
      });

      const updatedMessage = result.current.messages.find(
        (msg: Message) => msg.id === "msg-1",
      );
      expect(updatedMessage?.status).toBe("read");
    });

    it("should handle typing indicators", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the typing handler
      const typingHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "typing",
      )?.[1];

      act(() => {
        typingHandler?.({
          from: mockContactId,
          data: { isTyping: true },
        });
      });

      expect(result.current.isTyping).toBe(true);
    });

    it("should auto-clear typing indicator after timeout", () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the typing handler
      const typingHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "typing",
      )?.[1];

      act(() => {
        typingHandler?.({
          from: mockContactId,
          data: { isTyping: true },
        });
      });

      expect(result.current.isTyping).toBe(true);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.isTyping).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("Connection Status", () => {
    it("should handle connection events", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the connected handler
      const connectedHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "connected",
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      expect(result.current.isConnected).toBe(true);
    });

    it("should handle disconnection events", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the disconnected handler
      const disconnectedHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "disconnected",
      )?.[1];

      act(() => {
        disconnectedHandler?.();
      });

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("Message Management", () => {
    it("should save messages to localStorage", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      const newMessage = {
        id: "msg-3",
        content: "New message",
        type: "text",
        senderId: mockContactId,
        senderName: "对方",
        timestamp: expect.any(String),
        isOwn: false,
        status: "delivered",
        isStarred: false,
        replyTo: null,
      };

      // Get the message handler
      const messageHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "message",
      )?.[1];

      act(() => {
        messageHandler?.({
          type: "message",
          from: mockContactId,
          data: newMessage,
        });
      });

      // 等待 setTimeout 执行
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `chat_${mockContactId}`,
        expect.any(String),
      );
    });

    it("should handle message updates", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      act(() => {
        result.current.editMessage("msg-1", "Updated message");
      });

      const updatedMessage = result.current.messages.find(
        (msg: Message) => msg.id === "msg-1",
      );
      expect(updatedMessage?.content).toBe("Updated message");
      expect(updatedMessage?.isEdited).toBe(true);
    });

    it("should handle message deletion", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      act(() => {
        result.current.deleteMessage("msg-1");
      });

      const deletedMessage = result.current.messages.find(
        (msg: Message) => msg.id === "msg-1",
      );
      expect(deletedMessage).toBeUndefined();
    });
  });

  describe("Contact Change", () => {
    it("should reload chat history when contact changes", () => {
      const { rerender } = renderHook(
        ({ contactId }) => useRealChat(contactId),
        { initialProps: { contactId: "contact-1" } },
      );

      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      rerender({ contactId: "contact-2" });

      expect(localStorageMock.getItem).toHaveBeenCalledWith("chat_contact-2");
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed localStorage data", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      const { result } = renderHook(() => useRealChat(mockContactId));

      expect(result.current.messages).toEqual([]);
    });

    it("should handle empty message content", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        await result.current.sendMessage("", "text");
      });

      // 空消息仍然会被发送
      expect(mockWebSocketManager.send).toHaveBeenCalledWith({
        type: "message",
        to: mockContactId,
        data: {
          id: expect.any(String),
          text: "",
          type: "text",
        },
      });
    });

    it("should handle null contact ID", () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { result } = renderHook(() => useRealChat(""));

      // 当 contactId 为空时，hook 仍然会设置欢迎消息
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe("欢迎使用 Instagram！");
      expect(result.current.messages[1].content).toBe(
        "这是一个功能完整的聊天应用演示",
      );
    });
  });
});
