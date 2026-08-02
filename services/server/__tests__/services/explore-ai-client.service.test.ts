import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ExploreAiClientService,
  userIdToClientId,
} from "@/ai/application/explore-ai-client.service";
import { ServiceUnavailableException } from "@nestjs/common";

const mockConfigResult = {
  exploreAi: {
    enabled: true,
    baseUrl: "http://localhost:9000",
    serviceKey: "test-service-key",
    timeoutMs: 60000,
  },
};

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => mockConfigResult),
  },
}));

describe("userIdToClientId", () => {
  it("should produce a stable UUID-formatted id for the same userId", () => {
    const id1 = userIdToClientId("user-123");
    const id2 = userIdToClientId("user-123");
    expect(id1).toBe(id2);
    expect(id1).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("should produce different ids for different userIds", () => {
    expect(userIdToClientId("user-a")).not.toBe(userIdToClientId("user-b"));
  });
});

describe("ExploreAiClientService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigResult.exploreAi.enabled = true;
    mockConfigResult.exploreAi.serviceKey = "test-service-key";
  });

  describe("buildHeaders", () => {
    it("should include service key, client id, CSRF and request id", () => {
      const service = new ExploreAiClientService();
      const headers = service.buildHeaders("user-abc");

      expect(headers["X-Service-Key"]).toBe("test-service-key");
      expect(headers["X-Client-Id"]).toBe(userIdToClientId("user-abc"));
      expect(headers["X-Requested-With"]).toBe("XMLHttpRequest");
      expect(headers["X-Request-Id"]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe("assertAvailable", () => {
    it("should throw when disabled", () => {
      mockConfigResult.exploreAi.enabled = false;
      const service = new ExploreAiClientService();

      expect(() => service.assertAvailable()).toThrow(
        ServiceUnavailableException,
      );
    });

    it("should throw when service key is missing", () => {
      mockConfigResult.exploreAi.serviceKey = "";
      const service = new ExploreAiClientService();

      expect(() => service.assertAvailable()).toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
