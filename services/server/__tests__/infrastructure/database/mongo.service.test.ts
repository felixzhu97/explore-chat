import { describe, it, expect, vi, beforeEach } from "vitest";
import { MongoService } from "@/core/database/mongo.service";
import { ConfigService } from "@/core/config/config.service";

vi.mock("@/core/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      mongodb: {
        uri: "mongodb://localhost:27017/whatschat",
      },
    })),
  },
}));

describe("MongoService", () => {
  let service: MongoService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MongoService();
  });

  describe("constructor", () => {
    it("should create service instance", () => {
      expect(service).toBeDefined();
    });

    it("should load configuration from ConfigService", () => {
      expect(ConfigService.loadConfig).toHaveBeenCalled();
    });
  });

  describe("getDb", () => {
    it("should return null when not connected", () => {
      const db = service.getDb();
      expect(db).toBeNull();
    });
  });

  describe("isConnected", () => {
    it("should return false when not connected", () => {
      expect(service.isConnected()).toBe(false);
    });
  });

  describe("onModuleDestroy", () => {
    it("should set client and db to null", async () => {
      await service.onModuleDestroy();
      expect(service.getDb()).toBeNull();
      expect(service.isConnected()).toBe(false);
    });
  });
});
