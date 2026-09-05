import { describe, it, expect, beforeEach, vi } from "vitest";
import { CallsService, CreateCallData } from "@/calls/service/calls.service";

describe("CallsService", () => {
  let service: CallsService;
  let mockPrisma: {
    call: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    chat: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    user: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      call: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "call-1" }),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      },
      chat: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    service = new CallsService(mockPrisma as never);
  });

  describe("getCalls", () => {
    it("should return empty array when no calls found", async () => {
      mockPrisma.call.findMany.mockResolvedValue([]);

      const result = await service.getCalls("user-1");

      expect(result).toEqual([]);
      expect(mockPrisma.call.findMany).toHaveBeenCalled();
    });

    it("should return calls for user", async () => {
      const mockCalls = [
        { id: "call-1", type: "VIDEO", status: "COMPLETED" },
        { id: "call-2", type: "AUDIO", status: "MISSED" },
      ];
      mockPrisma.call.findMany.mockResolvedValue(mockCalls);

      const result = await service.getCalls("user-1");

      expect(result).toEqual(mockCalls);
    });
  });

  describe("createCall", () => {
    it("should throw error when no target provided", async () => {
      await expect(
        service.createCall("user-1", { type: "VIDEO" }),
      ).rejects.toThrow();
    });

    it("should throw NotFoundException when chat not found", async () => {
      mockPrisma.chat.findUnique.mockResolvedValue(null);

      await expect(
        service.createCall("user-1", { type: "VIDEO", chatId: "chat-1" }),
      ).rejects.toThrow();
    });

    it("should throw NotFoundException when target user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createCall("user-1", {
          type: "VIDEO",
          targetUserId: "non-existent",
        }),
      ).rejects.toThrow();
    });

    it("should create call with targetUserId", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-2",
        username: "user2",
      });

      const result = await service.createCall("user-1", {
        type: "VIDEO",
        targetUserId: "user-2",
      });

      expect(mockPrisma.call.create).toHaveBeenCalled();
    });

    it("should create call with chatId", async () => {
      mockPrisma.chat.findUnique.mockResolvedValue({
        id: "chat-1",
        participants: [{ userId: "user-1" }, { userId: "user-2" }],
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-2",
        username: "user2",
      });

      const result = await service.createCall("user-1", {
        type: "AUDIO",
        chatId: "chat-1",
      });

      expect(mockPrisma.call.create).toHaveBeenCalled();
    });
  });
});
