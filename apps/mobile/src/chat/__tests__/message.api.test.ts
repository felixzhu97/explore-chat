import { MessageApi } from "../message.api";

const createMockHttpClient = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
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
    it("should return array of messages when API returns success", async () => {
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
        data: { success: true, data: mockMessages },
      });

      const result = await adapter.getMessages("chat-1");

      expect(result).toHaveLength(2);
      expect(mockHttp.get).toHaveBeenCalledWith("/messages/chat-1", {
        params: { page: 1, limit: 50 },
      });
    });

    it("should return empty array when API returns null data", async () => {
      mockHttp.get.mockResolvedValue({
        data: { success: true, data: null },
      });

      const result = await adapter.getMessages("chat-1");

      expect(result).toEqual([]);
    });

    it("should return empty array when API returns non-array data", async () => {
      mockHttp.get.mockResolvedValue({
        data: { success: true, data: "not an array" },
      });

      const result = await adapter.getMessages("chat-1");

      expect(result).toEqual([]);
    });

    it("should return empty array when API returns failure", async () => {
      mockHttp.get.mockResolvedValue({
        data: { success: false },
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

    it("should pass correct pagination params", async () => {
      mockHttp.get.mockResolvedValue({
        data: { success: true, data: [] },
      });

      await adapter.getMessages("chat-1");

      expect(mockHttp.get).toHaveBeenCalledWith("/messages/chat-1", {
        params: { page: 1, limit: 50 },
      });
    });
  });

  describe("sendMessage", () => {
    it("should send message successfully with TEXT type", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: "new-msg",
            chatId: "chat-1",
            senderId: "user-1",
            type: "TEXT",
            content: "New message",
            createdAt: "2024-01-01T00:00:00Z",
          },
        },
      };
      mockHttp.post.mockResolvedValue(mockResponse);

      const result = await adapter.sendMessage("chat-1", "New message", "TEXT");

      expect(result.id).toBe("new-msg");
      expect(result.content).toBe("New message");
      expect(mockHttp.post).toHaveBeenCalledWith("/messages", {
        chatId: "chat-1",
        content: "New message",
        type: "TEXT",
      });
    });

    it("should send message with IMAGE type", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: "img-msg",
            chatId: "chat-1",
            senderId: "user-1",
            type: "IMAGE",
            content: "",
            createdAt: "2024-01-01T00:00:00Z",
          },
        },
      };
      mockHttp.post.mockResolvedValue(mockResponse);

      await adapter.sendMessage("chat-1", "Check this", "IMAGE");

      expect(mockHttp.post).toHaveBeenCalledWith("/messages", {
        chatId: "chat-1",
        content: "Check this",
        type: "IMAGE",
      });
    });

    it("should use TEXT as default type", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: "default-msg",
            chatId: "chat-1",
            senderId: "user-1",
            type: "TEXT",
            content: "Test",
            createdAt: "2024-01-01T00:00:00Z",
          },
        },
      };
      mockHttp.post.mockResolvedValue(mockResponse);

      await adapter.sendMessage("chat-1", "Test");

      expect(mockHttp.post).toHaveBeenCalledWith("/messages", {
        chatId: "chat-1",
        content: "Test",
        type: "TEXT",
      });
    });

    it("should throw error when API returns failure", async () => {
      mockHttp.post.mockResolvedValue({
        data: { success: false },
      });

      await expect(adapter.sendMessage("chat-1", "Test")).rejects.toThrow(
        "Send failed",
      );
    });

    it("should throw error when API returns success but no data", async () => {
      mockHttp.post.mockResolvedValue({
        data: { success: true, data: null },
      });

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
