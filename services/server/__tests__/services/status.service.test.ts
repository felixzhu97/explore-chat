import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  StatusService,
  CreateStatusData,
} from "@/status/application/status.service";

describe("StatusService", () => {
  let service: StatusService;
  let mockPrisma: {
    contact: { findMany: ReturnType<typeof vi.fn> };
    user: { findMany: ReturnType<typeof vi.fn> };
    status: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    statusView: { upsert: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      contact: { findMany: vi.fn().mockResolvedValue([]) },
      user: { findMany: vi.fn().mockResolvedValue([]) },
      status: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "status-1" }),
        delete: vi.fn().mockResolvedValue({}),
      },
      statusView: { upsert: vi.fn().mockResolvedValue({}) },
    };

    service = new StatusService(mockPrisma as never);
  });

  describe("getStatuses", () => {
    it("should return empty array when user has no contacts", async () => {
      mockPrisma.contact.findMany.mockResolvedValue([]);

      const result = await service.getStatuses("user-1");

      expect(result).toEqual([]);
    });
  });

  describe("createStatus", () => {
    it("should create status with TEXT type", async () => {
      mockPrisma.status.create.mockResolvedValue({
        id: "status-1",
        type: "TEXT",
        content: "Hello",
      });

      const result = await service.createStatus("user-1", {
        type: "TEXT",
        content: "Hello",
      });

      expect(result).toBeDefined();
      expect(mockPrisma.status.create).toHaveBeenCalled();
    });

    it("should create status with IMAGE type and mediaUrl", async () => {
      mockPrisma.status.create.mockResolvedValue({
        id: "status-1",
        type: "IMAGE",
        mediaUrl: "http://example.com/image.jpg",
      });

      const result = await service.createStatus("user-1", {
        type: "IMAGE",
        mediaUrl: "http://example.com/image.jpg",
      });

      expect(result).toBeDefined();
    });
  });

  describe("getStatusById", () => {
    it("should throw NotFoundException when status not found", async () => {
      mockPrisma.status.findUnique.mockResolvedValue(null);

      await expect(service.getStatusById("non-existent")).rejects.toThrow();
    });

    it("should throw NotFoundException when status expired", async () => {
      mockPrisma.status.findUnique.mockResolvedValue({
        id: "status-1",
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.getStatusById("status-1")).rejects.toThrow();
    });
  });

  describe("deleteStatus", () => {
    it("should throw NotFoundException when status not found", async () => {
      mockPrisma.status.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteStatus("non-existent", "user-1"),
      ).rejects.toThrow();
    });

    it("should throw NotFoundException when user is not owner", async () => {
      mockPrisma.status.findUnique.mockResolvedValue({
        id: "status-1",
        userId: "other-user",
      });

      await expect(
        service.deleteStatus("status-1", "user-1"),
      ).rejects.toThrow();
    });

    it("should delete status successfully", async () => {
      mockPrisma.status.findUnique.mockResolvedValue({
        id: "status-1",
        userId: "user-1",
      });

      const result = await service.deleteStatus("status-1", "user-1");

      expect(mockPrisma.status.delete).toHaveBeenCalled();
    });
  });

  describe("viewStatus", () => {
    it("should throw NotFoundException when status not found", async () => {
      mockPrisma.status.findUnique.mockResolvedValue(null);

      await expect(
        service.viewStatus("non-existent", "user-1"),
      ).rejects.toThrow();
    });

    it("should mark status as viewed", async () => {
      mockPrisma.status.findUnique.mockResolvedValue({
        id: "status-1",
        expiresAt: new Date(Date.now() + 10000),
      });

      const result = await service.viewStatus("status-1", "user-1");

      expect(mockPrisma.statusView.upsert).toHaveBeenCalled();
      expect(result.isViewed).toBe(true);
    });
  });
});
