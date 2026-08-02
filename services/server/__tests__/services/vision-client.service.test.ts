import { describe, it, expect, beforeEach, vi } from "vitest";
import { VisionClientService } from "@/ai/application/vision-client.service";

const mockConfigResult = {
  vision: {
    enabled: true,
    serviceUrl: "http://localhost:8080",
    moderationEnabled: true,
    timeoutMs: 5000,
  },
};

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => mockConfigResult),
  },
}));

describe("VisionClientService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create service instance", () => {
      const service = new VisionClientService();
      expect(service).toBeDefined();
    });
  });
});
