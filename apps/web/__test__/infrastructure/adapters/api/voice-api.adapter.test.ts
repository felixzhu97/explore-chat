import { describe, it, expect, vi, beforeEach } from "vitest";
import { VoiceApi } from "@/ai/apis/voice.api";
import type { ApiClient } from "@/auth/api-client";
import type { ApiResponse } from "@/auth/api-response.model";

describe("VoiceApi", () => {
  let adapter: VoiceApi;
  let mockApiClient: ApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      upload: vi.fn(),
      postStream: vi.fn(),
      setToken: vi.fn(),
      getToken: vi.fn(),
    } as unknown as ApiClient;
    adapter = new VoiceApi(mockApiClient);
  });

  describe("generate", () => {
    it("should generate voice with prompt only", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { audioUrl: "http://example.com/audio.mp3" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.generate("Hello, how are you?");

      expect(mockApiClient.post).toHaveBeenCalledWith("/voice/generate", {
        prompt: "Hello, how are you?",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should generate voice with target language", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { audioUrl: "http://example.com/audio.mp3" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.generate("Hello", "zh");

      expect(mockApiClient.post).toHaveBeenCalledWith("/voice/generate", {
        prompt: "Hello",
        targetLang: "zh",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should generate voice with auto target language", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { audioUrl: "http://example.com/audio.mp3" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.generate("Bonjour", "auto");

      expect(mockApiClient.post).toHaveBeenCalledWith("/voice/generate", {
        prompt: "Bonjour",
        targetLang: "auto",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should not include targetLang when undefined", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { audioUrl: "http://example.com/audio.mp3" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await adapter.generate("Hello");

      expect(mockApiClient.post).toHaveBeenCalledWith("/voice/generate", {
        prompt: "Hello",
      });
    });
  });

  describe("translate", () => {
    it("should translate text to Chinese", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { translatedText: "你好" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.translate("Hello", "zh");

      expect(mockApiClient.post).toHaveBeenCalledWith("/voice/translate", {
        text: "Hello",
        targetLang: "zh",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should translate text to English", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { translatedText: "Good morning" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.translate("早上好", "en");

      expect(mockApiClient.post).toHaveBeenCalledWith("/voice/translate", {
        text: "早上好",
        targetLang: "en",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle long text translation", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { translatedText: "translated" },
      };
      (mockApiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const longText = "A".repeat(1000);
      await adapter.translate(longText, "zh");

      expect(mockApiClient.post).toHaveBeenCalledWith("/voice/translate", {
        text: longText,
        targetLang: "zh",
      });
    });
  });
});
