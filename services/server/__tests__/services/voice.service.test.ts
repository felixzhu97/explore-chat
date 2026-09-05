import { describe, it, expect, beforeEach, vi } from "vitest";
import { VoiceService } from "@/ai/service/voice.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      voice: {
        voiceApiBaseUrl: "",
      },
    })),
  },
}));

describe("VoiceService", () => {
  let service: VoiceService;
  let mockAiService: {
    chat: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAiService = {
      chat: vi.fn().mockResolvedValue({ content: "Hello world" }),
    };

    service = new VoiceService(mockAiService as never);
  });

  describe("generate", () => {
    it("should throw BadRequestException when voice generation not configured", async () => {
      await expect(service.generate({ prompt: "say hello" })).rejects.toThrow();
    });
  });

  describe("translate", () => {
    it("should translate text to Chinese", async () => {
      mockAiService.chat.mockResolvedValue({ content: "你好世界" });

      const result = await service.translate({
        text: "Hello world",
        targetLang: "zh",
      });

      expect(result.translatedText).toBe("你好世界");
    });

    it("should translate text to English", async () => {
      mockAiService.chat.mockResolvedValue({ content: "Hello world" });

      const result = await service.translate({
        text: "你好世界",
        targetLang: "en",
      });

      expect(result.translatedText).toBe("Hello world");
    });
  });
});
