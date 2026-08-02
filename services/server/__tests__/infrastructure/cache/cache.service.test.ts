import { describe, it, expect, beforeEach, vi } from "vitest";
import { CacheService } from "@/core/cache/cache.service";

describe("CacheService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create service with redis dependency", () => {
      const mockRedisService = {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
      } as never;
      const service = new CacheService(mockRedisService);
      expect(service).toBeDefined();
    });
  });

  describe("get", () => {
    it("should delegate to redis get with prefix", async () => {
      const mockRedisService = {
        get: vi.fn().mockResolvedValue({ data: "test" }),
      } as never;
      const service = new CacheService(mockRedisService);

      const result = await service.get("test-key");

      expect(mockRedisService.get).toHaveBeenCalledWith("cache:test-key");
      expect(result).toEqual({ data: "test" });
    });

    it("should return null when key not found", async () => {
      const mockRedisService = {
        get: vi.fn().mockResolvedValue(null),
      } as never;
      const service = new CacheService(mockRedisService);

      const result = await service.get("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should delegate to redis set with prefix and default TTL", async () => {
      const mockRedisService = {
        set: vi.fn().mockResolvedValue(undefined),
      } as never;
      const service = new CacheService(mockRedisService);

      await service.set("test-key", { data: "test" });

      expect(mockRedisService.set).toHaveBeenCalledWith(
        "cache:test-key",
        { data: "test" },
        300,
      );
    });

    it("should use custom TTL when provided", async () => {
      const mockRedisService = {
        set: vi.fn().mockResolvedValue(undefined),
      } as never;
      const service = new CacheService(mockRedisService);

      await service.set("test-key", { data: "test" }, 600);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        "cache:test-key",
        { data: "test" },
        600,
      );
    });
  });

  describe("del", () => {
    it("should delegate to redis del with prefix", async () => {
      const mockRedisService = {
        del: vi.fn().mockResolvedValue(undefined),
      } as never;
      const service = new CacheService(mockRedisService);

      await service.del("test-key");

      expect(mockRedisService.del).toHaveBeenCalledWith("cache:test-key");
    });
  });

  describe("delMany", () => {
    it("should delete multiple keys with prefix", async () => {
      const mockRedisService = {
        del: vi.fn().mockResolvedValue(undefined),
      } as never;
      const service = new CacheService(mockRedisService);

      await service.delMany(["key-1", "key-2", "key-3"]);

      expect(mockRedisService.del).toHaveBeenCalledTimes(3);
      expect(mockRedisService.del).toHaveBeenCalledWith("cache:key-1");
      expect(mockRedisService.del).toHaveBeenCalledWith("cache:key-2");
      expect(mockRedisService.del).toHaveBeenCalledWith("cache:key-3");
    });

    it("should handle empty array", async () => {
      const mockRedisService = {
        del: vi.fn().mockResolvedValue(undefined),
      } as never;
      const service = new CacheService(mockRedisService);

      await service.delMany([]);

      expect(mockRedisService.del).not.toHaveBeenCalled();
    });
  });
});
