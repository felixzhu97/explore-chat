import { describe, it, expect, beforeEach, vi } from "vitest";
import { AiService } from "@/ai/application/ai.service";

vi.mock("@/lib/llm", () => ({
  createClient: vi.fn(() => ({
    chat: vi.fn(),
    chatStream: vi.fn(),
  })),
}));

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      ai: {
        ollamaBaseUrl: "http://localhost:11434",
        defaultModel: "llama2",
      },
    })),
  },
}));

describe("AiService", () => {
  let service: AiService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AiService();
  });

  describe("moderateText", () => {
    it("should return safe for empty text", async () => {
      const result = await service.moderateText("");
      expect(result).toEqual({ safe: true, categories: [] });
    });

    it("should return safe for null text", async () => {
      const result = await service.moderateText(null as any);
      expect(result).toEqual({ safe: true, categories: [] });
    });

    it("should return safe for whitespace-only text", async () => {
      const result = await service.moderateText("   \n\t  ");
      expect(result).toEqual({ safe: true, categories: [] });
    });

    it("should return safe when ollama is not configured", async () => {
      const { ConfigService } = vi.mocked(
        await import("@/core/config/config.service"),
      );
      ConfigService.loadConfig.mockReturnValueOnce({
        ai: { ollamaBaseUrl: null, defaultModel: "llama2" },
      } as any);

      const newService = new AiService();
      const result = await newService.moderateText("test content");
      expect(result).toEqual({ safe: true, categories: [] });
    });

    it("should return safe for SAFE response", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi.fn().mockResolvedValue({ content: "SAFE" }),
      };
      (createClient as any).mockReturnValue(mockClient);

      const result = await service.moderateText("hello world");
      expect(result).toEqual({ safe: true, categories: [] });
    });

    it("should return unsafe for UNSAFE response", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi.fn().mockResolvedValue({ content: "UNSAFE:violence,hate" }),
      };
      (createClient as any).mockReturnValue(mockClient);

      const result = await service.moderateText("some content");
      expect(result).toEqual({ safe: false, categories: ["violence", "hate"] });
    });

    it("should filter out invalid categories", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi
          .fn()
          .mockResolvedValue({
            content: "UNSAFE:violence,invalid,hate,unknown",
          }),
      };
      (createClient as any).mockReturnValue(mockClient);

      const result = await service.moderateText("some content");
      expect(result).toEqual({ safe: false, categories: ["violence", "hate"] });
    });

    it("should handle case-insensitive UNSAFE prefix", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi.fn().mockResolvedValue({ content: "unsafe:violence" }),
      };
      (createClient as any).mockReturnValue(mockClient);

      const result = await service.moderateText("some content");
      expect(result).toEqual({ safe: false, categories: ["violence"] });
    });

    it("should truncate long text to 2000 characters", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi.fn().mockResolvedValue({ content: "SAFE" }),
      };
      (createClient as any).mockReturnValue(mockClient);

      const longText = "a".repeat(3000);
      await service.moderateText(longText);

      const callArgs = mockClient.chat.mock.calls[0][0];
      expect(callArgs[1].content.length).toBe(2000);
    });

    it("should return safe on timeout", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ content: "SAFE" }), 3000),
              ),
          ),
      };
      (createClient as any).mockReturnValue(mockClient);

      const result = await service.moderateText("test");
      expect(result).toEqual({ safe: true, categories: [] });
    });

    it("should return safe on chat error", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi.fn().mockRejectedValue(new Error("Connection failed")),
      };
      (createClient as any).mockReturnValue(mockClient);

      const result = await service.moderateText("test content");
      expect(result).toEqual({ safe: true, categories: [] });
    });

    it("should return safe when content has no prefix", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi.fn().mockResolvedValue({ content: "Some random response" }),
      };
      (createClient as any).mockReturnValue(mockClient);

      const result = await service.moderateText("test");
      expect(result).toEqual({ safe: true, categories: [] });
    });
  });

  describe("chat", () => {
    it("should return chat response", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi.fn().mockResolvedValue({ content: "Hello, how can I help?" }),
      };
      (createClient as any).mockReturnValue(mockClient);

      const result = await service.chat({
        messages: [{ role: "user", content: "Hi" }],
      });

      expect(result).toEqual({ content: "Hello, how can I help?" });
    });

    it("should use provided model", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi.fn().mockResolvedValue({ content: "response" }),
      };
      (createClient as any).mockReturnValue(mockClient);

      await service.chat({
        messages: [{ role: "user", content: "Hi" }],
        model: "custom-model",
      });

      expect(mockClient.chat).toHaveBeenCalledWith(
        [{ role: "user", content: "Hi" }],
        { model: "custom-model" },
      );
    });

    it("should use default model when not provided", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockClient = {
        chat: vi.fn().mockResolvedValue({ content: "response" }),
      };
      (createClient as any).mockReturnValue(mockClient);

      await service.chat({
        messages: [{ role: "user", content: "Hi" }],
      });

      expect(mockClient.chat).toHaveBeenCalledWith(
        [{ role: "user", content: "Hi" }],
        { model: "llama2" },
      );
    });
  });

  describe("chatStream", () => {
    it("should yield chunks from stream", async () => {
      const { createClient } = await import("@/lib/llm");
      const mockStream = {
        [Symbol.asyncIterator]: vi.fn().mockReturnValue({
          next: vi
            .fn()
            .mockResolvedValueOnce({ value: "Hello", done: false })
            .mockResolvedValueOnce({ value: " World", done: false })
            .mockResolvedValueOnce({ done: true }),
        }),
      };
      const mockClient = {
        chatStream: vi.fn().mockResolvedValue(mockStream),
      };
      (createClient as any).mockReturnValue(mockClient);

      const chunks: string[] = [];
      for await (const chunk of service.chatStream({
        messages: [{ role: "user", content: "Hi" }],
      })) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["Hello", " World"]);
    });
  });
});
