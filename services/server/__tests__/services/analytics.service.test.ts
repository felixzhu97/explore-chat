import { describe, it, expect, beforeEach, vi } from "vitest";
import { AnalyticsService } from "@/analytics/service/analytics.service";

describe("AnalyticsService", () => {
  let service: AnalyticsService;
  let mockPrisma: {
    analyticsEvent: {
      createMany: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    $queryRaw: ReturnType<typeof vi.fn>;
  };
  let mockRedis: {
    setIfNotExists: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      analyticsEvent: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
        groupBy: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
      },
      $queryRaw: vi.fn().mockResolvedValue([]),
    };

    mockRedis = {
      setIfNotExists: vi.fn().mockResolvedValue(true),
    };

    service = new AnalyticsService(mockPrisma as never, mockRedis as never);
  });

  describe("ingest", () => {
    it("should return early for empty events", async () => {
      await service.ingest([]);

      expect(mockPrisma.analyticsEvent.createMany).not.toHaveBeenCalled();
    });

    it("should ingest events with idempotency key", async () => {
      mockRedis.setIfNotExists.mockResolvedValue(true);

      await service.ingest([
        {
          eventName: "test_event",
          idempotencyKey: "key-1",
          properties: { value: 1 },
        },
      ]);

      expect(mockPrisma.analyticsEvent.createMany).toHaveBeenCalled();
    });

    it("should skip duplicate events with same idempotency key", async () => {
      mockRedis.setIfNotExists.mockResolvedValue(false);

      await service.ingest([
        {
          eventName: "test_event",
          idempotencyKey: "key-1",
        },
      ]);

      expect(mockPrisma.analyticsEvent.createMany).not.toHaveBeenCalled();
    });
  });

  describe("getOverview", () => {
    it("should return overview statistics", async () => {
      mockPrisma.analyticsEvent.groupBy.mockResolvedValue([
        { eventName: "test", _count: { id: 10 } },
      ]);
      mockPrisma.analyticsEvent.count.mockResolvedValue(100);

      const start = new Date("2024-01-01");
      const end = new Date("2024-01-31");

      const result = await service.getOverview(start, end);

      expect(result.total).toBe(100);
    });
  });

  describe("getEvents", () => {
    it("should return paginated events", async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([
        {
          id: "1",
          eventName: "test",
          userId: "user-1",
          createdAt: new Date(),
          properties: {},
        },
      ]);
      mockPrisma.analyticsEvent.count.mockResolvedValue(1);

      const start = new Date("2024-01-01");
      const end = new Date("2024-01-31");

      const result = await service.getEvents({ start, end });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should filter events by eventName", async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);
      mockPrisma.analyticsEvent.count.mockResolvedValue(0);

      const start = new Date("2024-01-01");
      const end = new Date("2024-01-31");

      await service.getEvents({ start, end, eventName: "specific_event" });

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalled();
    });
  });
});
