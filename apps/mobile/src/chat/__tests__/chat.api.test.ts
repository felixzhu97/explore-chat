import { ChatApi } from "../chat.api";
import type { HttpClient } from "@/core/api-client";

describe("ChatApi", () => {
  const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<
    Pick<HttpClient, "get" | "post" | "put" | "delete">
  >;

  const adapter = new ChatApi(mockHttpClient);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getChats", () => {
    it("returns empty array when response is not successful", async () => {
      mockHttpClient.get.mockResolvedValue({ data: { success: false } });

      const result = await adapter.getChats();

      expect(result).toEqual([]);
    });

    it("returns empty array when data is not an array", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { success: true, data: "not-an-array" },
      });

      const result = await adapter.getChats();

      expect(result).toEqual([]);
    });

    it("returns empty array when data is null", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { success: true, data: null },
      });

      const result = await adapter.getChats();

      expect(result).toEqual([]);
    });

    it("maps chat data correctly", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          success: true,
          data: [
            {
              id: "chat-1",
              name: "Test Chat",
              type: "INDIVIDUAL",
              updatedAt: "2024-06-15T12:00:00Z",
            },
          ],
        },
      });

      const result = await adapter.getChats();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("chat-1");
      expect(result[0].name).toBe("Test Chat");
    });

    it("maps multiple chats", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          success: true,
          data: [
            { id: "chat-1", name: "Chat 1", updatedAt: "2024-06-15T12:00:00Z" },
            { id: "chat-2", name: "Chat 2", updatedAt: "2024-06-14T12:00:00Z" },
          ],
        },
      });

      const result = await adapter.getChats();

      expect(result).toHaveLength(2);
    });
  });

  describe("getChatById", () => {
    it("returns null when response is not successful", async () => {
      mockHttpClient.get.mockResolvedValue({ data: { success: false } });

      const result = await adapter.getChatById("chat-1");

      expect(result).toBeNull();
    });

    it("returns null when data is null", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { success: true, data: null },
      });

      const result = await adapter.getChatById("chat-1");

      expect(result).toBeNull();
    });

    it("returns null when data is undefined", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: { success: true, data: undefined },
      });

      const result = await adapter.getChatById("chat-1");

      expect(result).toBeNull();
    });

    it("returns mapped chat when successful", async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: "chat-1",
            name: "Test Chat",
            type: "GROUP",
            updatedAt: "2024-06-15T12:00:00Z",
          },
        },
      });

      const result = await adapter.getChatById("chat-1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("chat-1");
      expect(result!.name).toBe("Test Chat");
    });

    it("returns null when an error is thrown", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Network error"));

      const result = await adapter.getChatById("chat-1");

      expect(result).toBeNull();
    });
  });
});
