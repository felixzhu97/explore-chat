import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  GroupsService,
  CreateGroupData,
  UpdateGroupData,
} from "@/groups/service/groups.service";

describe("GroupsService", () => {
  let service: GroupsService;
  let mockPrisma: {
    groupParticipant: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    group: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    user: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      groupParticipant: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      },
      group: {
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: "group-1" }),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      },
      user: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    service = new GroupsService(mockPrisma as never);
  });

  describe("getGroups", () => {
    it("should return empty array when no groups found", async () => {
      mockPrisma.groupParticipant.findMany.mockResolvedValue([]);

      const result = await service.getGroups("user-1");

      expect(result).toEqual([]);
    });

    it("should return groups for user", async () => {
      const mockGroups = [
        {
          group: {
            id: "group-1",
            name: "Test Group",
            description: "Description",
            avatar: null,
            creator: { id: "user-1", username: "creator", avatar: null },
            participants: [
              {
                user: {
                  id: "user-1",
                  username: "user1",
                  avatar: null,
                  isOnline: true,
                },
                role: "ADMIN",
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];
      mockPrisma.groupParticipant.findMany.mockResolvedValue(mockGroups);

      const result = await service.getGroups("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("group-1");
    });
  });

  describe("createGroup", () => {
    it("should throw BadRequestException when name is empty", async () => {
      await expect(
        service.createGroup("user-1", { name: "", participantIds: [] }),
      ).rejects.toThrow();
    });

    it("should throw BadRequestException when name is whitespace only", async () => {
      await expect(
        service.createGroup("user-1", { name: "   ", participantIds: [] }),
      ).rejects.toThrow();
    });

    it("should throw BadRequestException when some participants not found", async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: "user-1" }]);

      await expect(
        service.createGroup("user-1", {
          name: "Group",
          participantIds: ["user-1", "non-existent"],
        }),
      ).rejects.toThrow();
    });

    it("should create group successfully", async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: "user-2" }]);
      mockPrisma.group.create.mockResolvedValue({
        id: "group-1",
        name: "Test Group",
      });

      const result = await service.createGroup("user-1", {
        name: "Test Group",
        description: "A test group",
        participantIds: ["user-2"],
      });

      expect(mockPrisma.group.create).toHaveBeenCalled();
    });
  });
});
