import { ChatEntity, ChatType, Chat } from "../chat.model";

describe("ChatEntity", () => {
  const createValidChatData = (overrides = {}): Chat => ({
    id: "chat-1",
    name: "Test Chat",
    description: "Test Description",
    type: ChatType.Individual as const,
    participantIds: ["user-1", "user-2"],
    groupImage: "https://example.com/image.jpg",
    lastMessageId: "msg-1",
    lastMessageContent: "Hello",
    lastMessageTime: new Date("2024-06-15T12:00:00Z"),
    lastMessageSender: "user-1",
    unreadCount: 5,
    isMuted: true,
    mutedUntil: new Date("2024-06-16T12:00:00Z"),
    isPinned: true,
    isArchived: true,
    adminId: "admin-1",
    adminIds: ["admin-1"],
    createdAt: new Date("2024-06-01T12:00:00Z"),
    updatedAt: new Date("2024-06-15T12:00:00Z"),
    settings: { theme: "dark" },
    ...overrides,
  });

  // ==========================================================================
  // Constructor Tests
  // ==========================================================================
  describe("constructor", () => {
    describe("when creating with all properties", () => {
      it("should create ChatEntity with all properties", () => {
        const data = createValidChatData();
        const entity = new ChatEntity(data);

        expect(entity.id).toBe("chat-1");
        expect(entity.name).toBe("Test Chat");
        expect(entity.description).toBe("Test Description");
        expect(entity.type).toBe(ChatType.Individual);
        expect(entity.participantIds).toEqual(["user-1", "user-2"]);
        expect(entity.groupImage).toBe("https://example.com/image.jpg");
        expect(entity.lastMessageId).toBe("msg-1");
        expect(entity.lastMessageContent).toBe("Hello");
        expect(entity.lastMessageTime).toBeInstanceOf(Date);
        expect(entity.lastMessageSender).toBe("user-1");
        expect(entity.unreadCount).toBe(5);
        expect(entity.isMuted).toBe(true);
        expect(entity.mutedUntil).toBeInstanceOf(Date);
        expect(entity.isPinned).toBe(true);
        expect(entity.isArchived).toBe(true);
        expect(entity.adminId).toBe("admin-1");
        expect(entity.adminIds).toEqual(["admin-1"]);
        expect(entity.createdAt).toBeInstanceOf(Date);
        expect(entity.updatedAt).toBeInstanceOf(Date);
        expect(entity.settings).toEqual({ theme: "dark" });
      });
    });

    describe("when unreadCount is undefined", () => {
      it("should default unreadCount to 0", () => {
        const data = createValidChatData({ unreadCount: undefined });
        const entity = new ChatEntity(data);

        expect(entity.unreadCount).toBe(0);
      });
    });

    describe("when isMuted is undefined", () => {
      it("should default isMuted to false", () => {
        const data = createValidChatData({ isMuted: undefined });
        const entity = new ChatEntity(data);

        expect(entity.isMuted).toBe(false);
      });
    });

    describe("when isPinned is undefined", () => {
      it("should default isPinned to false", () => {
        const data = createValidChatData({ isPinned: undefined });
        const entity = new ChatEntity(data);

        expect(entity.isPinned).toBe(false);
      });
    });

    describe("when isArchived is undefined", () => {
      it("should default isArchived to false", () => {
        const data = createValidChatData({ isArchived: undefined });
        const entity = new ChatEntity(data);

        expect(entity.isArchived).toBe(false);
      });
    });

    describe("when adminIds is undefined", () => {
      it("should default adminIds to empty array", () => {
        const data = createValidChatData({ adminIds: undefined });
        const entity = new ChatEntity(data);

        expect(entity.adminIds).toEqual([]);
      });
    });

    describe("when optional date fields are undefined", () => {
      it("should handle undefined lastMessageTime", () => {
        const data = createValidChatData({ lastMessageTime: undefined });
        const entity = new ChatEntity(data);

        expect(entity.lastMessageTime).toBeUndefined();
      });

      it("should handle undefined mutedUntil", () => {
        const data = createValidChatData({ mutedUntil: undefined });
        const entity = new ChatEntity(data);

        expect(entity.mutedUntil).toBeUndefined();
      });
    });

    describe("when optional string fields are undefined", () => {
      it("should handle undefined description", () => {
        const data = createValidChatData({ description: undefined });
        const entity = new ChatEntity(data);

        expect(entity.description).toBeUndefined();
      });

      it("should handle undefined groupImage", () => {
        const data = createValidChatData({ groupImage: undefined });
        const entity = new ChatEntity(data);

        expect(entity.groupImage).toBeUndefined();
      });

      it("should handle undefined lastMessageId", () => {
        const data = createValidChatData({ lastMessageId: undefined });
        const entity = new ChatEntity(data);

        expect(entity.lastMessageId).toBeUndefined();
      });

      it("should handle undefined lastMessageContent", () => {
        const data = createValidChatData({ lastMessageContent: undefined });
        const entity = new ChatEntity(data);

        expect(entity.lastMessageContent).toBeUndefined();
      });

      it("should handle undefined lastMessageSender", () => {
        const data = createValidChatData({ lastMessageSender: undefined });
        const entity = new ChatEntity(data);

        expect(entity.lastMessageSender).toBeUndefined();
      });

      it("should handle undefined adminId", () => {
        const data = createValidChatData({ adminId: undefined });
        const entity = new ChatEntity(data);

        expect(entity.adminId).toBeUndefined();
      });
    });

    describe("when participantIds is empty", () => {
      it("should handle empty participantIds array", () => {
        const data = createValidChatData({ participantIds: [] });
        const entity = new ChatEntity(data);

        expect(entity.participantIds).toEqual([]);
      });
    });

    describe("when settings is undefined", () => {
      it("should set settings to undefined", () => {
        const data = createValidChatData({ settings: undefined });
        const entity = new ChatEntity(data);

        expect(entity.settings).toBeUndefined();
      });
    });
  });

  // ==========================================================================
  // ChatType Enum Tests
  // ==========================================================================
  describe("ChatType enum", () => {
    it('should have Individual type with value "individual"', () => {
      expect(ChatType.Individual).toBe("individual");
    });

    it('should have Group type with value "group"', () => {
      expect(ChatType.Group).toBe("group");
    });

    it('should have Broadcast type with value "broadcast"', () => {
      expect(ChatType.Broadcast).toBe("broadcast");
    });

    it("should have all 3 chat types", () => {
      const enumValues = Object.values(ChatType);
      expect(enumValues).toHaveLength(3);
    });
  });

  // ==========================================================================
  // copyWith Tests
  // ==========================================================================
  describe("copyWith", () => {
    describe("when updating name", () => {
      it("should create a copy with updated name", () => {
        const original = new ChatEntity(createValidChatData());
        const updated = original.copyWith({ name: "Updated Chat" });

        expect(updated.name).toBe("Updated Chat");
        expect(updated.id).toBe(original.id);
        expect(updated.type).toBe(original.type);
      });
    });

    describe("when updating unreadCount", () => {
      it("should create a copy with updated unreadCount", () => {
        const original = new ChatEntity(createValidChatData());
        const updated = original.copyWith({ unreadCount: 10 });

        expect(updated.unreadCount).toBe(10);
        expect(original.unreadCount).toBe(5);
      });
    });

    describe("when updating type", () => {
      it("should create a copy with updated type", () => {
        const original = new ChatEntity(
          createValidChatData({ type: ChatType.Individual }),
        );
        const updated = original.copyWith({ type: ChatType.Group });

        expect(updated.type).toBe(ChatType.Group);
        expect(original.type).toBe(ChatType.Individual);
      });
    });

    describe("when updating multiple properties", () => {
      it("should create a copy with all updated properties", () => {
        const original = new ChatEntity(createValidChatData());
        const updated = original.copyWith({
          name: "New Name",
          unreadCount: 20,
          isMuted: false,
          isPinned: false,
        });

        expect(updated.name).toBe("New Name");
        expect(updated.unreadCount).toBe(20);
        expect(updated.isMuted).toBe(false);
        expect(updated.isPinned).toBe(false);
        expect(updated.id).toBe(original.id);
      });
    });

    describe("when updating participantIds", () => {
      it("should create a copy with updated participantIds", () => {
        const original = new ChatEntity(createValidChatData());
        const updated = original.copyWith({
          participantIds: ["user-1", "user-2", "user-3"],
        });

        expect(updated.participantIds).toEqual(["user-1", "user-2", "user-3"]);
        expect(original.participantIds).toEqual(["user-1", "user-2"]);
      });
    });

    describe("when updating isMuted", () => {
      it("should toggle isMuted from true to false", () => {
        const original = new ChatEntity(createValidChatData({ isMuted: true }));
        const updated = original.copyWith({ isMuted: false });

        expect(updated.isMuted).toBe(false);
        expect(original.isMuted).toBe(true);
      });

      it("should toggle isMuted from false to true", () => {
        const original = new ChatEntity(
          createValidChatData({ isMuted: false }),
        );
        const updated = original.copyWith({ isMuted: true });

        expect(updated.isMuted).toBe(true);
        expect(original.isMuted).toBe(false);
      });
    });

    describe("when updates are undefined", () => {
      it("should preserve original values", () => {
        const original = new ChatEntity(
          createValidChatData({ name: "Original" }),
        );
        const copy = original.copyWith({});

        expect(copy.name).toBe("Original");
      });
    });

    describe("immutability", () => {
      it("should create a new instance", () => {
        const original = new ChatEntity(createValidChatData());
        const copy = original.copyWith({ name: "New Name" });

        expect(copy).not.toBe(original);
      });

      it("should not mutate original entity", () => {
        const original = new ChatEntity(
          createValidChatData({ name: "Original" }),
        );
        original.copyWith({ name: "Modified" });

        expect(original.name).toBe("Original");
      });
    });
  });

  // ==========================================================================
  // toMap Tests
  // ==========================================================================
  describe("toMap", () => {
    describe("when converting to map", () => {
      it("should convert entity to map with timestamp as milliseconds", () => {
        const data = createValidChatData();
        const entity = new ChatEntity(data);
        const map = entity.toMap();

        expect(map.id).toBe("chat-1");
        expect(map.name).toBe("Test Chat");
        expect(map.type).toBe(ChatType.Individual);
        const lastMessageTime =
          data.lastMessageTime instanceof Date
            ? data.lastMessageTime.getTime()
            : data.lastMessageTime;
        const mutedUntil =
          data.mutedUntil instanceof Date
            ? data.mutedUntil.getTime()
            : data.mutedUntil;
        expect(map.lastMessageTime).toBe(lastMessageTime);
        expect(map.mutedUntil).toBe(mutedUntil);
        expect(map.createdAt).toBe(data.createdAt.getTime());
        expect(map.updatedAt).toBe(data.updatedAt.getTime());
      });
    });

    describe("when entity has undefined optional fields", () => {
      it("should include undefined fields in map", () => {
        const data = createValidChatData({
          lastMessageTime: undefined,
          mutedUntil: undefined,
        });
        const entity = new ChatEntity(data);
        const map = entity.toMap();

        expect(map.lastMessageTime).toBeUndefined();
        expect(map.mutedUntil).toBeUndefined();
      });
    });

    describe("when entity has description", () => {
      it("should include description in map", () => {
        const data = createValidChatData({ description: "A chat description" });
        const entity = new ChatEntity(data);
        const map = entity.toMap();

        expect(map.description).toBe("A chat description");
      });
    });

    describe("when entity has groupImage", () => {
      it("should include groupImage in map", () => {
        const data = createValidChatData({
          groupImage: "https://example.com/group.jpg",
        });
        const entity = new ChatEntity(data);
        const map = entity.toMap();

        expect(map.groupImage).toBe("https://example.com/group.jpg");
      });
    });

    describe("when entity has participantIds", () => {
      it("should include participantIds array in map", () => {
        const data = createValidChatData({
          participantIds: ["user-1", "user-2", "user-3"],
        });
        const entity = new ChatEntity(data);
        const map = entity.toMap();

        expect(map.participantIds).toEqual(["user-1", "user-2", "user-3"]);
      });
    });

    describe("when entity has adminIds", () => {
      it("should include adminIds array in map", () => {
        const data = createValidChatData({ adminIds: ["admin-1", "admin-2"] });
        const entity = new ChatEntity(data);
        const map = entity.toMap();

        expect(map.adminIds).toEqual(["admin-1", "admin-2"]);
      });
    });

    describe("when entity has settings", () => {
      it("should include settings object in map", () => {
        const data = createValidChatData({
          settings: { theme: "dark", notifications: true },
        });
        const entity = new ChatEntity(data);
        const map = entity.toMap();

        expect(map.settings).toEqual({ theme: "dark", notifications: true });
      });
    });

    describe("when entity has lastMessage data", () => {
      it("should include lastMessage fields in map", () => {
        const data = createValidChatData({
          lastMessageId: "msg-123",
          lastMessageContent: "Last message content",
          lastMessageSender: "user-1",
        });
        const entity = new ChatEntity(data);
        const map = entity.toMap();

        expect(map.lastMessageId).toBe("msg-123");
        expect(map.lastMessageContent).toBe("Last message content");
        expect(map.lastMessageSender).toBe("user-1");
      });
    });

    describe("when lastMessageTime is undefined", () => {
      it("should not throw error", () => {
        const data = createValidChatData({
          lastMessageTime: undefined,
        });
        const entity = new ChatEntity(data);

        expect(() => entity.toMap()).not.toThrow();
      });
    });

    describe("when mutedUntil is undefined", () => {
      it("should not throw error", () => {
        const data = createValidChatData({
          mutedUntil: undefined,
        });
        const entity = new ChatEntity(data);

        expect(() => entity.toMap()).not.toThrow();
      });
    });
  });

  // ==========================================================================
  // fromMap Tests
  // ==========================================================================
  describe("fromMap", () => {
    describe("when creating from valid map", () => {
      it("should create entity from map", () => {
        const map = {
          id: "chat-map-1",
          name: "Map Chat",
          type: 1,
          participantIds: ["p1", "p2"],
          unreadCount: 3,
          isMuted: false,
          isPinned: true,
          isArchived: false,
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.id).toBe("chat-map-1");
        expect(entity.name).toBe("Map Chat");
        expect(entity.type).toBe(ChatType.Group);
        expect(entity.participantIds).toEqual(["p1", "p2"]);
        expect(entity.unreadCount).toBe(3);
        expect(entity.isMuted).toBe(false);
        expect(entity.isPinned).toBe(true);
        expect(entity.isArchived).toBe(false);
        expect(entity.createdAt).toBeInstanceOf(Date);
        expect(entity.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe("when type number is invalid", () => {
      it("should default to Individual for invalid type number", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          type: 999,
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.type).toBe(ChatType.Individual);
      });

      it("should default to Individual for negative type number", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          type: -1,
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.type).toBe(ChatType.Individual);
      });
    });

    describe("when map has missing required fields", () => {
      it("should default id to empty string for missing id", () => {
        const map = {
          name: "Chat",
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.id).toBe("");
      });

      it("should default name to empty string for missing name", () => {
        const map = {
          id: "chat-1",
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.name).toBe("");
      });
    });

    describe("when participantIds is not an array", () => {
      it("should default to empty array when participantIds is a string", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          participantIds: "not-an-array",
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.participantIds).toEqual([]);
      });

      it("should default to empty array when participantIds is null", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          participantIds: null,
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.participantIds).toEqual([]);
      });
    });

    describe("when adminIds is not an array", () => {
      it("should default to empty array when adminIds is a string", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          adminIds: "not-an-array",
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.adminIds).toEqual([]);
      });
    });

    describe("when map has optional fields", () => {
      it("should parse description from map", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          description: "A description",
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.description).toBe("A description");
      });

      it("should parse groupImage from map", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          groupImage: "https://example.com/group.jpg",
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.groupImage).toBe("https://example.com/group.jpg");
      });

      it("should parse lastMessageTime from map", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          lastMessageTime: 1718452800000,
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.lastMessageTime).toBeInstanceOf(Date);
        expect(entity.lastMessageTime?.getTime()).toBe(1718452800000);
      });

      it("should parse mutedUntil from map", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          mutedUntil: 1718539200000,
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.mutedUntil).toBeInstanceOf(Date);
        expect(entity.mutedUntil?.getTime()).toBe(1718539200000);
      });
    });

    describe("type number mapping", () => {
      it.each`
        typeNum | expectedType
        ${0}    | ${ChatType.Individual}
        ${1}    | ${ChatType.Group}
        ${2}    | ${ChatType.Broadcast}
      `(
        "should map type $typeNum to $expectedType",
        ({ typeNum, expectedType }) => {
          const map = {
            id: "chat-1",
            name: "Chat",
            type: typeNum,
            createdAt: 1717252800000,
            updatedAt: 1718452800000,
          };

          const entity = ChatEntity.fromMap(map);

          expect(entity.type).toBe(expectedType);
        },
      );
    });

    describe("when map has settings", () => {
      it("should parse settings from map", () => {
        const map = {
          id: "chat-1",
          name: "Chat",
          settings: { theme: "dark", notifications: true },
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const entity = ChatEntity.fromMap(map);

        expect(entity.settings).toEqual({ theme: "dark", notifications: true });
      });
    });
  });

  // ==========================================================================
  // Type Guards Tests
  // ==========================================================================
  describe("type guards", () => {
    describe("when type is Group", () => {
      it("should return true for isGroup", () => {
        const entity = new ChatEntity(
          createValidChatData({ type: ChatType.Group }),
        );

        expect(entity.isGroup).toBe(true);
      });

      it("should return false for isIndividual", () => {
        const entity = new ChatEntity(
          createValidChatData({ type: ChatType.Group }),
        );

        expect(entity.isIndividual).toBe(false);
      });

      it("should return false for isBroadcast", () => {
        const entity = new ChatEntity(
          createValidChatData({ type: ChatType.Group }),
        );

        expect(entity.isBroadcast).toBe(false);
      });
    });

    describe("when type is Individual", () => {
      it("should return false for isGroup", () => {
        const entity = new ChatEntity(
          createValidChatData({ type: ChatType.Individual }),
        );

        expect(entity.isGroup).toBe(false);
      });

      it("should return true for isIndividual", () => {
        const entity = new ChatEntity(
          createValidChatData({ type: ChatType.Individual }),
        );

        expect(entity.isIndividual).toBe(true);
      });

      it("should return false for isBroadcast", () => {
        const entity = new ChatEntity(
          createValidChatData({ type: ChatType.Individual }),
        );

        expect(entity.isBroadcast).toBe(false);
      });
    });

    describe("when type is Broadcast", () => {
      it("should return false for isGroup", () => {
        const entity = new ChatEntity(
          createValidChatData({ type: ChatType.Broadcast }),
        );

        expect(entity.isGroup).toBe(false);
      });

      it("should return false for isIndividual", () => {
        const entity = new ChatEntity(
          createValidChatData({ type: ChatType.Broadcast }),
        );

        expect(entity.isIndividual).toBe(false);
      });

      it("should return true for isBroadcast", () => {
        const entity = new ChatEntity(
          createValidChatData({ type: ChatType.Broadcast }),
        );

        expect(entity.isBroadcast).toBe(true);
      });
    });
  });

  // ==========================================================================
  // toString Tests
  // ==========================================================================
  describe("toString", () => {
    describe("when converting to string", () => {
      it("should return formatted string with id", () => {
        const entity = new ChatEntity(createValidChatData());
        const str = entity.toString();

        expect(str).toContain("chat-1");
      });

      it("should return formatted string with name", () => {
        const entity = new ChatEntity(createValidChatData());
        const str = entity.toString();

        expect(str).toContain("Test Chat");
      });

      it("should return formatted string with type", () => {
        const entity = new ChatEntity(createValidChatData());
        const str = entity.toString();

        expect(str).toContain("individual");
      });

      it("should return formatted string with participant count", () => {
        const entity = new ChatEntity(createValidChatData());
        const str = entity.toString();

        expect(str).toContain("2");
      });
    });
  });

  // ==========================================================================
  // equals Tests
  // ==========================================================================
  describe("equals", () => {
    describe("when comparing same id", () => {
      it("should return true for same id", () => {
        const entity = new ChatEntity(createValidChatData({ id: "same-id" }));
        const other = createValidChatData({ id: "same-id" });

        expect(entity.equals(other)).toBe(true);
      });

      it("should return true even if name differs", () => {
        const entity = new ChatEntity(
          createValidChatData({ id: "same-id", name: "Name A" }),
        );
        const other = createValidChatData({ id: "same-id", name: "Name B" });

        expect(entity.equals(other)).toBe(true);
      });
    });

    describe("when comparing different id", () => {
      it("should return false for different id", () => {
        const entity = new ChatEntity(createValidChatData({ id: "id-1" }));
        const other = createValidChatData({ id: "id-2" });

        expect(entity.equals(other)).toBe(false);
      });
    });

    describe("when comparing with partial object", () => {
      it("should return true if id matches", () => {
        const entity = new ChatEntity(createValidChatData({ id: "chat-1" }));
        const other = { id: "chat-1" } as Chat;

        expect(entity.equals(other)).toBe(true);
      });
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe("edge cases", () => {
    describe("when name is empty string", () => {
      it("should handle empty name", () => {
        const data = createValidChatData({ name: "" });
        const entity = new ChatEntity(data);

        expect(entity.name).toBe("");
      });
    });

    describe("when name is very long", () => {
      it("should handle long name", () => {
        const longName = "a".repeat(1000);
        const data = createValidChatData({ name: longName });
        const entity = new ChatEntity(data);

        expect(entity.name).toHaveLength(1000);
      });
    });

    describe("when unreadCount is zero", () => {
      it("should handle zero unreadCount", () => {
        const data = createValidChatData({ unreadCount: 0 });
        const entity = new ChatEntity(data);

        expect(entity.unreadCount).toBe(0);
      });
    });

    describe("when unreadCount is very large", () => {
      it("should handle large unreadCount", () => {
        const data = createValidChatData({ unreadCount: 99999 });
        const entity = new ChatEntity(data);

        expect(entity.unreadCount).toBe(99999);
      });
    });

    describe("when participantIds has many entries", () => {
      it("should handle many participants", () => {
        const manyParticipants = Array.from(
          { length: 100 },
          (_, i) => `user-${i}`,
        );
        const data = createValidChatData({ participantIds: manyParticipants });
        const entity = new ChatEntity(data);

        expect(entity.participantIds).toHaveLength(100);
        expect(entity.participantIds[0]).toBe("user-0");
        expect(entity.participantIds[99]).toBe("user-99");
      });
    });

    describe("when adminIds has many entries", () => {
      it("should handle many admins", () => {
        const manyAdmins = Array.from({ length: 10 }, (_, i) => `admin-${i}`);
        const data = createValidChatData({ adminIds: manyAdmins });
        const entity = new ChatEntity(data);

        expect(entity.adminIds).toHaveLength(10);
      });
    });

    describe("when settings has nested objects", () => {
      it("should handle nested settings", () => {
        const data = createValidChatData({
          settings: {
            theme: "dark",
            notifications: {
              messages: true,
              calls: false,
            },
          },
        });
        const entity = new ChatEntity(data);

        expect(entity.settings).toEqual({
          theme: "dark",
          notifications: {
            messages: true,
            calls: false,
          },
        });
      });
    });

    describe("roundtrip conversion with numeric type", () => {
      it("should preserve data through toMap and fromMap", () => {
        const map: Record<string, unknown> = {
          id: "chat-1",
          name: "Test Chat",
          type: 0,
          participantIds: ["user-1", "user-2"],
          unreadCount: 5,
          isMuted: true,
          isPinned: true,
          isArchived: true,
          createdAt: 1717252800000,
          updatedAt: 1718452800000,
        };

        const original = ChatEntity.fromMap(map);
        const restoredMap = original.toMap();
        const restored = ChatEntity.fromMap(restoredMap);

        expect(restored.id).toBe(original.id);
        expect(restored.name).toBe(original.name);
        expect(restored.type).toBe(ChatType.Individual);
        expect(restored.participantIds).toEqual(original.participantIds);
        expect(restored.unreadCount).toBe(original.unreadCount);
        expect(restored.isMuted).toBe(original.isMuted);
        expect(restored.isPinned).toBe(original.isPinned);
        expect(restored.isArchived).toBe(original.isArchived);
      });
    });

    describe("copyWith should not affect original when using nested objects", () => {
      it("should create independent copy of participantIds", () => {
        const originalParticipants = ["user-1", "user-2"];
        const original = new ChatEntity(
          createValidChatData({
            participantIds: originalParticipants,
          }),
        );
        const updated = original.copyWith({
          participantIds: ["user-1", "user-2", "user-3"],
        });

        expect(original.participantIds).toEqual(["user-1", "user-2"]);
        expect(updated.participantIds).toEqual(["user-1", "user-2", "user-3"]);
      });

      it("should create independent copy of settings", () => {
        const originalSettings = { theme: "dark" };
        const original = new ChatEntity(
          createValidChatData({
            settings: originalSettings,
          }),
        );
        const updated = original.copyWith({
          settings: { theme: "light" },
        });

        expect(original.settings).toEqual({ theme: "dark" });
        expect(updated.settings).toEqual({ theme: "light" });
      });
    });
  });
});
