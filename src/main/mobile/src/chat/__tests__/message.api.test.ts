import { MessageApi } from "../message.api";

const createMockHttpClient = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
});

describe("MessageApi", () => {
  let adapter: MessageApi;
  let mockHttp: ReturnType<typeof createMockHttpClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHttp = createMockHttpClient();
    adapter = new MessageApi(mockHttp);
  });

  describe("getMessages", () => {
    it("should return array of messages when API returns messages", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "user-1",
          type: "TEXT",
          content: "Hello",
          createdAt: "2024-01-01T00:00:00Z",
          sender: { id: "user-1", username: "Alice" },
        },
        {
          id: "msg-2",
          chatId: "chat-1",
          senderId: "user-2",
          type: "TEXT",
          content: "Hi there",
          createdAt: "2024-01-01T00:01:00Z",
          sender: { id: "user-2", username: "Bob" },
        },
      ];
      mockHttp.get.mockResolvedValue({
        data: { messages: mockMessages },
      });

      const result = await adapter.getMessages("chat-1");

      expect(result).toHaveLength(2);
      expect(mockHttp.get).toHaveBeenCalledWith("/chats/chat-1/messages", {
        params: { page_size: 50 },
      });
    });

    it("should return empty array when API returns null messages", async () => {
      mockHttp.get.mockResolvedValue({
        data: { messages: null },
      });

      const result = await adapter.getMessages("chat-1");

      expect(result).toEqual([]);
    });

    it("should return empty array when API returns non-array messages", async () => {
      mockHttp.get.mockResolvedValue({
        data: { messages: "not an array" },
      });

      const result = await adapter.getMessages("chat-1");

      expect(result).toEqual([]);
    });

    it("should throw error when HTTP request fails", async () => {
      mockHttp.get.mockRejectedValue(new Error("Network error"));

      await expect(adapter.getMessages("chat-1")).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("sendMessage", () => {
    it("should send message successfully with TEXT type", async () => {
      const mockResponse = {
        data: {
          id: "new-msg",
          chatId: "chat-1",
          senderId: "user-1",
          type: "TEXT",
          content: "New message",
          createdAt: "2024-01-01T00:00:00Z",
        },
      };
      mockHttp.post.mockResolvedValue(mockResponse);

      const result = await adapter.sendMessage("chat-1", "New message", "TEXT");

      expect(result.id).toBe("new-msg");
      expect(result.content).toBe("New message");
      expect(mockHttp.post).toHaveBeenCalledWith("/chats/chat-1/messages", {
        content: "New message",
        type: "TEXT",
      });
    });

    it("should send message with IMAGE type", async () => {
      const mockResponse = {
        data: {
          id: "img-msg",
          chatId: "chat-1",
          senderId: "user-1",
          type: "IMAGE",
          content: "",
          createdAt: "2024-01-01T00:00:00Z",
        },
      };
      mockHttp.post.mockResolvedValue(mockResponse);

      await adapter.sendMessage("chat-1", "Check this", "IMAGE");

      expect(mockHttp.post).toHaveBeenCalledWith("/chats/chat-1/messages", {
        content: "Check this",
        type: "IMAGE",
      });
    });

    it("should use TEXT as default type", async () => {
      const mockResponse = {
        data: {
          id: "default-msg",
          chatId: "chat-1",
          senderId: "user-1",
          type: "TEXT",
          content: "Test",
          createdAt: "2024-01-01T00:00:00Z",
        },
      };
      mockHttp.post.mockResolvedValue(mockResponse);

      await adapter.sendMessage("chat-1", "Test");

      expect(mockHttp.post).toHaveBeenCalledWith("/chats/chat-1/messages", {
        content: "Test",
        type: "TEXT",
      });
    });

    it("should throw error when API returns no data", async () => {
      mockHttp.post.mockResolvedValue({ data: null });

      await expect(adapter.sendMessage("chat-1", "Test")).rejects.toThrow(
        "Send failed",
      );
    });

    it("should throw error when HTTP request fails", async () => {
      mockHttp.post.mockRejectedValue(new Error("Network error"));

      await expect(adapter.sendMessage("chat-1", "Test")).rejects.toThrow();
    });
  });
});
