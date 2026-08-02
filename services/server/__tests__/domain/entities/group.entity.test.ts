import { describe, it, expect } from "vitest";
import {
  Group,
  ParticipantRole,
  GroupParticipant,
  GroupSettings,
} from "@/groups/domain/group.entity";
import {
  GROUP_DOMAIN,
  USER_DOMAIN,
  createTestParticipant,
  createTestParticipants,
} from "@whatschat/shared-types/test-utils/domain-values";

/**
 * Local factory functions that wrap domain factories with test-specific defaults
 */
const createGroup = (overrides?: Parameters<typeof Group.create>[0]) =>
  Group.create({
    id: GROUP_DOMAIN.VALID.id,
    name: GROUP_DOMAIN.VALID.name,
    creatorId: USER_DOMAIN.VALID.id,
    description: GROUP_DOMAIN.VALID.description,
    avatar: GROUP_DOMAIN.VALID.avatar,
    ...overrides,
  });

const createGroupWithParticipants = (
  count: number,
  overrides?: Parameters<typeof Group.create>[0],
) =>
  createGroup({
    participants: createTestParticipants(count),
    ...overrides,
  });

const createAdminParticipant = (userId: string = USER_DOMAIN.VALID.id) =>
  createTestParticipant({ userId, role: "ADMIN" });

const createMemberParticipant = (userId: string) =>
  createTestParticipant({ userId, role: "MEMBER" });

describe("Group Entity", () => {
  // ==========================================================================
  // CONSTRUCTOR TESTS
  // ==========================================================================
  describe("constructor", () => {
    it("should create a group with all required fields", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const participants = createTestParticipants(2);
      const settings: GroupSettings = {
        onlyAdminsCanSendMessages: true,
        onlyAdminsCanEditInfo: true,
        onlyAdminsCanAddParticipants: false,
      };

      const group = new Group(
        GROUP_DOMAIN.VALID.id,
        GROUP_DOMAIN.VALID.name,
        USER_DOMAIN.VALID.id,
        GROUP_DOMAIN.VALID.description,
        GROUP_DOMAIN.VALID.avatar,
        participants,
        settings,
        createdAt,
        updatedAt,
      );

      expect(group.id).toBe(GROUP_DOMAIN.VALID.id);
      expect(group.name).toBe(GROUP_DOMAIN.VALID.name);
      expect(group.creatorId).toBe(USER_DOMAIN.VALID.id);
      expect(group.description).toBe(GROUP_DOMAIN.VALID.description);
      expect(group.avatar).toBe(GROUP_DOMAIN.VALID.avatar);
      expect(group.settings.onlyAdminsCanSendMessages).toBe(true);
      expect(group.settings.onlyAdminsCanEditInfo).toBe(true);
      expect(group.settings.onlyAdminsCanAddParticipants).toBe(false);
      expect(group.createdAt).toBe(createdAt);
      expect(group.updatedAt).toBe(updatedAt);
    });

    it("should use default values for optional fields", () => {
      const group = new Group(
        GROUP_DOMAIN.VALID.id,
        GROUP_DOMAIN.VALID.name,
        USER_DOMAIN.VALID.id,
      );

      expect(group.description).toBeUndefined();
      expect(group.avatar).toBeUndefined();
      expect(group.participants).toEqual([]);
      expect(group.settings.onlyAdminsCanSendMessages).toBe(false);
      expect(group.settings.onlyAdminsCanEditInfo).toBe(false);
      expect(group.settings.onlyAdminsCanAddParticipants).toBe(false);
      expect(group.createdAt).toBeInstanceOf(Date);
      expect(group.updatedAt).toBeInstanceOf(Date);
    });

    it("should accept participants array", () => {
      const participants = createTestParticipants(2);
      const group = new Group(
        GROUP_DOMAIN.VALID.id,
        GROUP_DOMAIN.VALID.name,
        USER_DOMAIN.VALID.id,
        undefined,
        undefined,
        participants,
      );

      expect(group.participants).toHaveLength(2);
      expect(group.participants[0].userId).toBe(participants[0].userId);
      expect(group.participants[0].role).toBe("ADMIN");
      expect(group.participants[1].role).toBe("MEMBER");
    });

    it("should accept custom settings", () => {
      const settings: GroupSettings = {
        onlyAdminsCanSendMessages: true,
        onlyAdminsCanEditInfo: true,
        onlyAdminsCanAddParticipants: true,
      };
      const group = new Group(
        GROUP_DOMAIN.VALID.id,
        GROUP_DOMAIN.VALID.name,
        USER_DOMAIN.VALID.id,
        undefined,
        undefined,
        [],
        settings,
      );

      expect(group.settings).toEqual(settings);
    });
  });

  // ==========================================================================
  // GROUP.CREATE TESTS - BASIC CREATION
  // ==========================================================================
  describe("Group.create - basic creation", () => {
    it("should create a group with provided data", () => {
      const createdAt = new Date("2024-01-01");
      const participants = createTestParticipants(1);
      const settings: GroupSettings = {
        onlyAdminsCanSendMessages: true,
        onlyAdminsCanEditInfo: false,
        onlyAdminsCanAddParticipants: true,
      };

      const group = Group.create({
        id: GROUP_DOMAIN.VALID.id,
        name: GROUP_DOMAIN.VALID.name,
        creatorId: USER_DOMAIN.VALID.id,
        description: GROUP_DOMAIN.VALID.description,
        avatar: GROUP_DOMAIN.VALID.avatar,
        participants,
        settings,
        createdAt,
        updatedAt: createdAt,
      });

      expect(group.id).toBe(GROUP_DOMAIN.VALID.id);
      expect(group.name).toBe(GROUP_DOMAIN.VALID.name);
      expect(group.creatorId).toBe(USER_DOMAIN.VALID.id);
      expect(group.description).toBe(GROUP_DOMAIN.VALID.description);
      expect(group.avatar).toBe(GROUP_DOMAIN.VALID.avatar);
      expect(group.participants).toHaveLength(1);
      expect(group.settings.onlyAdminsCanSendMessages).toBe(true);
    });

    it("should use default settings when not provided", () => {
      const group = createGroup();

      expect(group.settings.onlyAdminsCanSendMessages).toBe(false);
      expect(group.settings.onlyAdminsCanEditInfo).toBe(false);
      expect(group.settings.onlyAdminsCanAddParticipants).toBe(false);
    });

    it("should use default empty participants array when not provided", () => {
      const group = createGroup();

      expect(group.participants).toEqual([]);
    });

    it("should set dates when not provided", () => {
      const beforeCreate = new Date();
      const group = createGroup();
      const afterCreate = new Date();

      expect(group.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime() - 1000,
      );
      expect(group.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime() - 1000,
      );
    });
  });

  // ==========================================================================
  // GROUP.CREATE TESTS - PARTICIPANTS
  // ==========================================================================
  describe("Group.create - participants", () => {
    it("should create group with single participant", () => {
      const group = createGroupWithParticipants(1);

      expect(group.participants).toHaveLength(1);
    });

    it("should create group with multiple participants", () => {
      const group = createGroupWithParticipants(10);

      expect(group.participants).toHaveLength(10);
    });

    it("should create group with empty participants", () => {
      const group = createGroup();

      expect(group.participants).toHaveLength(0);
    });

    it("should set first participant as ADMIN by default", () => {
      const group = createGroupWithParticipants(2);

      expect(group.participants[0].role).toBe("ADMIN");
    });

    it("should set other participants as MEMBER by default", () => {
      const group = createGroupWithParticipants(3);

      expect(group.participants[1].role).toBe("MEMBER");
      expect(group.participants[2].role).toBe("MEMBER");
    });
  });

  // ==========================================================================
  // GROUP.CREATE TESTS - SETTINGS
  // ==========================================================================
  describe("Group.create - settings", () => {
    it("should create group with default settings", () => {
      const group = createGroup();

      expect(group.settings).toEqual(GROUP_DOMAIN.SETTINGS.default);
    });

    it("should create group with restricted settings", () => {
      const group = createGroup({ settings: GROUP_DOMAIN.SETTINGS.restricted });

      expect(group.settings).toEqual(GROUP_DOMAIN.SETTINGS.restricted);
    });

    it("should create group with onlyAdminsCanSendMessages enabled", () => {
      const group = createGroup({
        settings: {
          ...GROUP_DOMAIN.SETTINGS.default,
          onlyAdminsCanSendMessages: true,
        },
      });

      expect(group.settings.onlyAdminsCanSendMessages).toBe(true);
    });

    it("should create group with onlyAdminsCanEditInfo enabled", () => {
      const group = createGroup({
        settings: {
          ...GROUP_DOMAIN.SETTINGS.default,
          onlyAdminsCanEditInfo: true,
        },
      });

      expect(group.settings.onlyAdminsCanEditInfo).toBe(true);
    });

    it("should create group with onlyAdminsCanAddParticipants enabled", () => {
      const group = createGroup({
        settings: {
          ...GROUP_DOMAIN.SETTINGS.default,
          onlyAdminsCanAddParticipants: true,
        },
      });

      expect(group.settings.onlyAdminsCanAddParticipants).toBe(true);
    });
  });

  // ==========================================================================
  // ADDPARTICIPANT TESTS (Parameterized)
  // ==========================================================================
  describe("addParticipant", () => {
    it("should add a new participant to the group", () => {
      const group = createGroupWithParticipants(1);
      const newUserId = "user-new";

      const updatedGroup = group.addParticipant(
        newUserId,
        USER_DOMAIN.VALID.id,
        "MEMBER",
      );

      expect(updatedGroup.participants).toHaveLength(2);
      expect(updatedGroup.participants[1].userId).toBe(newUserId);
      expect(updatedGroup.participants[1].role).toBe("MEMBER");
    });

    it("should set addedBy when adding participant", () => {
      const group = createGroup();
      const addedBy = "admin-user";

      const updatedGroup = group.addParticipant("new-user", addedBy);

      expect(updatedGroup.participants[0].addedBy).toBe(addedBy);
    });

    it("should use MEMBER as default role", () => {
      const group = createGroup();

      const updatedGroup = group.addParticipant("user-2", USER_DOMAIN.VALID.id);

      expect(updatedGroup.participants[0].role).toBe("MEMBER");
    });

    it("should accept ADMIN as role", () => {
      const group = createGroup();

      const updatedGroup = group.addParticipant(
        "user-2",
        USER_DOMAIN.VALID.id,
        "ADMIN",
      );

      expect(updatedGroup.participants[0].role).toBe("ADMIN");
    });

    it("should not add duplicate participant", () => {
      const group = createGroupWithParticipants(1, {
        participants: [createAdminParticipant(USER_DOMAIN.VALID.id)],
      });

      const updatedGroup = group.addParticipant(
        USER_DOMAIN.VALID.id,
        USER_DOMAIN.VALID.id,
        "ADMIN",
      );

      expect(updatedGroup.participants).toHaveLength(1);
    });

    it("should preserve original group unchanged (immutability)", () => {
      const group = createGroup();

      const updatedGroup = group.addParticipant("user-1", USER_DOMAIN.VALID.id);

      expect(group.participants).toHaveLength(0);
      expect(updatedGroup.participants).toHaveLength(1);
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const group = createGroup({ createdAt, updatedAt: createdAt });
      const beforeUpdate = new Date();

      const updatedGroup = group.addParticipant(
        "user-new",
        USER_DOMAIN.VALID.id,
      );

      expect(updatedGroup.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime() - 1000,
      );
    });

    it("should preserve existing participants when adding new one", () => {
      const existingParticipant = createAdminParticipant("user-existing");
      const group = createGroup({ participants: [existingParticipant] });

      const updatedGroup = group.addParticipant(
        "user-new",
        USER_DOMAIN.VALID.id,
      );

      expect(updatedGroup.participants).toHaveLength(2);
      expect(updatedGroup.participants[0].userId).toBe("user-existing");
      expect(updatedGroup.participants[1].userId).toBe("user-new");
    });

    it("should set joinedAt timestamp", () => {
      const group = createGroup();
      const beforeAdd = new Date();

      const updatedGroup = group.addParticipant(
        "user-new",
        USER_DOMAIN.VALID.id,
      );

      expect(
        updatedGroup.participants[0].joinedAt.getTime(),
      ).toBeGreaterThanOrEqual(beforeAdd.getTime() - 1000);
    });
  });

  // ==========================================================================
  // REMOVEPARTICIPANT TESTS
  // ==========================================================================
  describe("removeParticipant", () => {
    it("should remove a participant from the group", () => {
      const group = createGroupWithParticipants(2);

      const updatedGroup = group.removeParticipant("user_1");

      expect(updatedGroup.participants).toHaveLength(1);
    });

    it("should remove the correct participant", () => {
      const group = createGroupWithParticipants(3);

      const updatedGroup = group.removeParticipant("user_1");

      const remainingIds = updatedGroup.participants.map((p) => p.userId);
      expect(remainingIds).not.toContain("user_1");
    });

    it("should preserve original group unchanged (immutability)", () => {
      const group = createGroupWithParticipants(1);

      const updatedGroup = group.removeParticipant("user_0");

      expect(group.participants).toHaveLength(1);
      expect(updatedGroup.participants).toHaveLength(0);
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const group = createGroupWithParticipants(1, {
        createdAt,
        updatedAt: createdAt,
      });
      const beforeUpdate = new Date();

      const updatedGroup = group.removeParticipant("user_0");

      expect(updatedGroup.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime() - 1000,
      );
    });

    it("should handle removing non-existent participant", () => {
      const group = createGroupWithParticipants(1);

      const updatedGroup = group.removeParticipant("non-existent");

      expect(updatedGroup.participants).toHaveLength(1);
    });

    it("should handle removing from group with no participants", () => {
      const group = createGroup();

      const updatedGroup = group.removeParticipant("user_0");

      expect(updatedGroup.participants).toHaveLength(0);
    });
  });

  // ==========================================================================
  // PROMOTE TO ADMIN TESTS
  // ==========================================================================
  describe("promoteToAdmin", () => {
    it("should promote a member to admin", () => {
      const group = createGroupWithParticipants(2, {
        participants: [
          createAdminParticipant("user-0"),
          createMemberParticipant("user-1"),
        ],
      });

      const updatedGroup = group.promoteToAdmin("user-1");

      expect(updatedGroup.participants[1].role).toBe("ADMIN");
    });

    it("should preserve original group unchanged (immutability)", () => {
      const group = createGroupWithParticipants(1, {
        participants: [createMemberParticipant(USER_DOMAIN.VALID.id)],
      });

      const updatedGroup = group.promoteToAdmin(USER_DOMAIN.VALID.id);

      expect(group.participants[0].role).toBe("MEMBER");
      expect(updatedGroup.participants[0].role).toBe("ADMIN");
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const group = createGroupWithParticipants(1, {
        participants: [createMemberParticipant("user-0")],
        createdAt,
        updatedAt: createdAt,
      });
      const beforeUpdate = new Date();

      const updatedGroup = group.promoteToAdmin("user-0");

      expect(updatedGroup.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime() - 1000,
      );
    });

    it("should only update the specified participant", () => {
      const group = createGroupWithParticipants(3, {
        participants: [
          createMemberParticipant("user-0"),
          createMemberParticipant("user-1"),
          createMemberParticipant("user-2"),
        ],
      });

      const updatedGroup = group.promoteToAdmin("user-1");

      expect(updatedGroup.participants[0].role).toBe("MEMBER");
      expect(updatedGroup.participants[1].role).toBe("ADMIN");
      expect(updatedGroup.participants[2].role).toBe("MEMBER");
    });

    it("should handle promoting non-existent participant", () => {
      const group = createGroupWithParticipants(1);

      const updatedGroup = group.promoteToAdmin("non-existent");

      expect(updatedGroup.participants).toHaveLength(1);
      expect(updatedGroup.participants[0].role).toBe("ADMIN");
    });

    it("should not change role of already admin participant", () => {
      const group = createGroupWithParticipants(2, {
        participants: [
          createAdminParticipant("user-0"),
          createAdminParticipant("user-1"),
        ],
      });

      const updatedGroup = group.promoteToAdmin("user-0");

      expect(updatedGroup.participants[0].role).toBe("ADMIN");
    });
  });

  // ==========================================================================
  // TYPE DEFINITION TESTS (Parameterized)
  // ==========================================================================
  describe("type definitions", () => {
    describe.each(GROUP_DOMAIN.ROLES)("ParticipantRole: %s", (role) => {
      it(`should accept valid role: ${role}`, () => {
        const validRole: ParticipantRole = role as ParticipantRole;
        expect(validRole).toBe(role);
      });
    });

    it("should have valid ParticipantRole type", () => {
      const adminRole: ParticipantRole = "ADMIN";
      const memberRole: ParticipantRole = "MEMBER";

      expect(adminRole).toBe("ADMIN");
      expect(memberRole).toBe("MEMBER");
    });

    it("should allow role assignment in GroupParticipant", () => {
      const participant: GroupParticipant = {
        userId: USER_DOMAIN.VALID.id,
        role: "ADMIN",
        joinedAt: new Date(),
        addedBy: USER_DOMAIN.VALID.id,
      };

      expect(participant.role).toBe("ADMIN");
      expect(participant.addedBy).toBe(USER_DOMAIN.VALID.id);
    });

    it("should allow optional addedBy in GroupParticipant", () => {
      const participant: GroupParticipant = {
        userId: USER_DOMAIN.VALID.id,
        role: "MEMBER",
        joinedAt: new Date(),
      };

      expect(participant.addedBy).toBeUndefined();
    });

    it("should have valid GroupSettings structure", () => {
      const settings: GroupSettings = {
        onlyAdminsCanSendMessages: true,
        onlyAdminsCanEditInfo: false,
        onlyAdminsCanAddParticipants: true,
      };

      expect(settings.onlyAdminsCanSendMessages).toBe(true);
      expect(settings.onlyAdminsCanEditInfo).toBe(false);
      expect(settings.onlyAdminsCanAddParticipants).toBe(true);
    });
  });

  // ==========================================================================
  // BOUNDARY VALUE TESTS
  // ==========================================================================
  describe("boundary values", () => {
    describe("participant counts", () => {
      it("should accept empty participants", () => {
        const group = createGroup();

        expect(group.participants).toHaveLength(0);
      });

      it("should accept single participant", () => {
        const group = createGroupWithParticipants(1);

        expect(group.participants).toHaveLength(1);
      });

      it("should accept many participants", () => {
        const group = createGroupWithParticipants(100);

        expect(group.participants).toHaveLength(100);
      });
    });

    describe("group properties", () => {
      it("should accept minimum name length", () => {
        const group = createGroup({ name: "A" });

        expect(group.name).toBe("A");
      });

      it("should accept very long name", () => {
        const longName = "G".repeat(255);
        const group = createGroup({ name: longName });

        expect(group.name).toHaveLength(255);
      });

      it("should accept empty description", () => {
        const group = createGroup({ description: "" });

        expect(group.description).toBe("");
      });

      it("should accept very long description", () => {
        const longDesc = "D".repeat(1000);
        const group = createGroup({ description: longDesc });

        expect(group.description).toHaveLength(1000);
      });
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  describe("edge cases", () => {
    it("should handle unicode group name", () => {
      const group = createGroup({ name: "群组 🎉" });

      expect(group.name).toBe("群组 🎉");
    });

    it("should handle special characters in name", () => {
      const group = createGroup({ name: "Group & Friends <Official>" });

      expect(group.name).toBe("Group & Friends <Official>");
    });

    it("should handle unicode description", () => {
      const group = createGroup({ description: "这是一个测试群组描述" });

      expect(group.description).toBe("这是一个测试群组描述");
    });

    it("should handle empty string userId for participant", () => {
      const group = createGroup();
      const participant = createTestParticipant({ userId: "" });

      const updatedGroup = group.addParticipant("", USER_DOMAIN.VALID.id);

      expect(updatedGroup.participants[0].userId).toBe("");
    });

    it("should preserve settings when adding/removing participants", () => {
      const settings: GroupSettings = {
        onlyAdminsCanSendMessages: true,
        onlyAdminsCanEditInfo: true,
        onlyAdminsCanAddParticipants: true,
      };
      const group = createGroup({ settings });

      const withParticipant = group.addParticipant(
        "user-new",
        USER_DOMAIN.VALID.id,
      );
      const withoutParticipant = withParticipant.removeParticipant("user-new");

      expect(withoutParticipant.settings).toEqual(settings);
    });
  });
});
