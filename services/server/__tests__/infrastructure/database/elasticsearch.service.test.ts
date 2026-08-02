import { describe, it, expect, vi, beforeEach } from "vitest";
import { ElasticsearchService } from "@/core/database/elasticsearch.service";
import { ConfigService } from "@/core/config/config.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      elasticsearch: {
        node: "http://localhost:9200",
        username: undefined,
        password: undefined,
      },
    })),
  },
}));

describe("ElasticsearchService", () => {
  let service: ElasticsearchService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ElasticsearchService();
  });

  describe("constructor", () => {
    it("should create service instance", () => {
      expect(service).toBeDefined();
    });

    it("should load configuration from ConfigService", () => {
      expect(ConfigService.loadConfig).toHaveBeenCalled();
    });
  });

  describe("getClient", () => {
    it("should return null when not connected", () => {
      const client = service.getClient();
      expect(client).toBeNull();
    });
  });

  describe("isConnected", () => {
    it("should return false when not connected", () => {
      expect(service.isConnected()).toBe(false);
    });
  });

  describe("indexUser", () => {
    it("should not throw when client is null", async () => {
      await expect(
        service.indexUser({
          id: "user-1",
          username: "testuser",
          createdAt: "2024-01-01",
        }),
      ).resolves.not.toThrow();
    });
  });

  describe("deleteUser", () => {
    it("should not throw when client is null", async () => {
      await expect(service.deleteUser("user-1")).resolves.not.toThrow();
    });
  });

  describe("onModuleDestroy", () => {
    it("should set client to null", async () => {
      await service.onModuleDestroy();
      expect(service.getClient()).toBeNull();
    });
  });
});
