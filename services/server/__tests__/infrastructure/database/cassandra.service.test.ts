import { describe, it, expect, vi, beforeEach } from "vitest";
import { CassandraService } from "@/core/database/cassandra.service";
import { ConfigService } from "@/core/config/config.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      cassandra: {
        contactPoints: ["localhost:9042"],
        keyspace: "test_keyspace",
        localDatacenter: "datacenter1",
      },
    })),
  },
}));

describe("CassandraService", () => {
  let service: CassandraService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CassandraService();
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

  describe("onModuleDestroy", () => {
    it("should not throw when client is null", async () => {
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});
