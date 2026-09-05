import {
  MessageEntity,
  MessageType,
  MessageStatus,
  Message,
} from "../message.model";

describe("MessageEntity", () => {
  const createValidMessageData = (overrides = {}): Message => ({
    id: "msg-1",
    chatId: "chat-1",
    senderId: "sender-1",
    senderName: "John Doe",
    senderAvatar: "https://example.com/avatar.jpg",
    content: "Hello, World!",
    type: MessageType.Text as const,
    status: MessageStatus.Sent as const,
    timestamp: new Date("2024-06-15T12:00:00Z"),
    updatedAt: new Date("2024-06-15T13:00:00Z"),
    fileName: "document.pdf",
    fileUrl: "https://example.com/file.pdf",
    thumbnailUrl: "https://example.com/thumb.jpg",
    fileSize: 1024,
    mimeType: "application/pdf",
    latitude: 40.7128,
    longitude: -74.006,
    locationName: "New York",
    duration: 120,
    replyToId: "reply-1",
    replyToContent: "Original message",
    isForwarded: true,
    forwardedFrom: ["user-1", "user-2"],
    metadata: { key: "value" },
    ...overrides,
  });

  // ==========================================================================
  // Constructor Tests
  // ==========================================================================
  describe("constructor", () => {
    describe("when creating with all properties", () => {
      it("should create MessageEntity with all properties", () => {
        const data = createValidMessageData();
        const entity = new MessageEntity(data);

        expect(entity.id).toBe("msg-1");
        expect(entity.chatId).toBe("chat-1");
        expect(entity.senderId).toBe("sender-1");
        expect(entity.senderName).toBe("John Doe");
        expect(entity.senderAvatar).toBe("https://example.com/avatar.jpg");
        expect(entity.content).toBe("Hello, World!");
        expect(entity.type).toBe(MessageType.Text);
        expect(entity.status).toBe(MessageStatus.Sent);
        expect(entity.timestamp).toBeInstanceOf(Date);
        expect(entity.updatedAt).toBeInstanceOf(Date);
        expect(entity.fileName).toBe("document.pdf");
        expect(entity.fileUrl).toBe("https://example.com/file.pdf");
        expect(entity.thumbnailUrl).toBe("https://example.com/thumb.jpg");
        expect(entity.fileSize).toBe(1024);
        expect(entity.mimeType).toBe("application/pdf");
        expect(entity.latitude).toBe(40.7128);
        expect(entity.longitude).toBe(-74.006);
        expect(entity.locationName).toBe("New York");
        expect(entity.duration).toBe(120);
        expect(entity.replyToId).toBe("reply-1");
        expect(entity.replyToContent).toBe("Original message");
        expect(entity.isForwarded).toBe(true);
        expect(entity.forwardedFrom).toEqual(["user-1", "user-2"]);
        expect(entity.metadata).toEqual({ key: "value" });
      });
    });

    describe("when status is undefined", () => {
      it("should default status to Sent", () => {
        const data = createValidMessageData({ status: undefined });
        const entity = new MessageEntity(data);

        expect(entity.status).toBe(MessageStatus.Sent);
      });
    });

    describe("when isForwarded is undefined", () => {
      it("should default isForwarded to false", () => {
        const data = createValidMessageData({ isForwarded: undefined });
        const entity = new MessageEntity(data);

        expect(entity.isForwarded).toBe(false);
      });
    });

    describe("when forwardedFrom is undefined", () => {
      it("should default forwardedFrom to empty array", () => {
        const data = createValidMessageData({ forwardedFrom: undefined });
        const entity = new MessageEntity(data);

        expect(entity.forwardedFrom).toEqual([]);
      });
    });

    describe("when updatedAt is undefined", () => {
      it("should set updatedAt to undefined", () => {
        const data = createValidMessageData({ updatedAt: undefined });
        const entity = new MessageEntity(data);

        expect(entity.updatedAt).toBeUndefined();
      });
    });

    describe("when optional media fields are undefined", () => {
      it("should handle undefined media fields", () => {
        const data = createValidMessageData({
          fileName: undefined,
          fileUrl: undefined,
          thumbnailUrl: undefined,
          fileSize: undefined,
          mimeType: undefined,
        });
        const entity = new MessageEntity(data);

        expect(entity.fileName).toBeUndefined();
        expect(entity.fileUrl).toBeUndefined();
        expect(entity.thumbnailUrl).toBeUndefined();
        expect(entity.fileSize).toBeUndefined();
        expect(entity.mimeType).toBeUndefined();
      });
    });

    describe("when location fields are undefined", () => {
      it("should handle undefined location fields", () => {
        const data = createValidMessageData({
          latitude: undefined,
          longitude: undefined,
          locationName: undefined,
        });
        const entity = new MessageEntity(data);

        expect(entity.latitude).toBeUndefined();
        expect(entity.longitude).toBeUndefined();
        expect(entity.locationName).toBeUndefined();
      });
    });

    describe("when duration is undefined", () => {
      it("should set duration to undefined", () => {
        const data = createValidMessageData({ duration: undefined });
        const entity = new MessageEntity(data);

        expect(entity.duration).toBeUndefined();
      });
    });

    describe("when reply fields are undefined", () => {
      it("should handle undefined reply fields", () => {
        const data = createValidMessageData({
          replyToId: undefined,
          replyToContent: undefined,
        });
        const entity = new MessageEntity(data);

        expect(entity.replyToId).toBeUndefined();
        expect(entity.replyToContent).toBeUndefined();
      });
    });

    describe("when metadata is undefined", () => {
      it("should set metadata to undefined", () => {
        const data = createValidMessageData({ metadata: undefined });
        const entity = new MessageEntity(data);

        expect(entity.metadata).toBeUndefined();
      });
    });

    describe("when fileSize is a string", () => {
      it("should coerce string to number", () => {
        const data = createValidMessageData({
          fileSize: "2048" as unknown as number,
        });
        const entity = new MessageEntity(data);

        expect(entity.fileSize).toBe(2048);
      });
    });
  });

  // ==========================================================================
  // MessageType Tests
  // ==========================================================================
  describe("MessageType enum", () => {
    it('should have Text type with value "text"', () => {
      expect(MessageType.Text).toBe("text");
    });

    it('should have Image type with value "image"', () => {
      expect(MessageType.Image).toBe("image");
    });

    it('should have Video type with value "video"', () => {
      expect(MessageType.Video).toBe("video");
    });

    it('should have Audio type with value "audio"', () => {
      expect(MessageType.Audio).toBe("audio");
    });

    it('should have File type with value "file"', () => {
      expect(MessageType.File).toBe("file");
    });

    it('should have Location type with value "location"', () => {
      expect(MessageType.Location).toBe("location");
    });

    it('should have Contact type with value "contact"', () => {
      expect(MessageType.Contact).toBe("contact");
    });

    it('should have Sticker type with value "sticker"', () => {
      expect(MessageType.Sticker).toBe("sticker");
    });

    it('should have Gif type with value "gif"', () => {
      expect(MessageType.Gif).toBe("gif");
    });

    it('should have Voice type with value "voice"', () => {
      expect(MessageType.Voice).toBe("voice");
    });

    it('should have System type with value "system"', () => {
      expect(MessageType.System).toBe("system");
    });

    it("should have all 11 message types", () => {
      const enumValues = Object.values(MessageType);
      expect(enumValues).toHaveLength(11);
    });
  });

  // ==========================================================================
  // MessageStatus Tests
  // ==========================================================================
  describe("MessageStatus enum", () => {
    it('should have Sending status with value "sending"', () => {
      expect(MessageStatus.Sending).toBe("sending");
    });

    it('should have Sent status with value "sent"', () => {
      expect(MessageStatus.Sent).toBe("sent");
    });

    it('should have Delivered status with value "delivered"', () => {
      expect(MessageStatus.Delivered).toBe("delivered");
    });

    it('should have Read status with value "read"', () => {
      expect(MessageStatus.Read).toBe("read");
    });

    it('should have Failed status with value "failed"', () => {
      expect(MessageStatus.Failed).toBe("failed");
    });

    it("should have all 5 message statuses", () => {
      const enumValues = Object.values(MessageStatus);
      expect(enumValues).toHaveLength(5);
    });
  });

  // ==========================================================================
  // copyWith Tests
  // ==========================================================================
  describe("copyWith", () => {
    describe("when updating content", () => {
      it("should create a copy with updated content", () => {
        const original = new MessageEntity(createValidMessageData());
        const updated = original.copyWith({ content: "Updated content" });

        expect(updated.content).toBe("Updated content");
        expect(updated.id).toBe(original.id);
        expect(updated.chatId).toBe(original.chatId);
      });
    });

    describe("when updating status", () => {
      it("should create a copy with updated status", () => {
        const original = new MessageEntity(createValidMessageData());
        const updated = original.copyWith({ status: MessageStatus.Delivered });

        expect(updated.status).toBe(MessageStatus.Delivered);
        expect(original.status).toBe(MessageStatus.Sent);
      });
    });

    describe("when updating type", () => {
      it("should create a copy with updated type", () => {
        const original = new MessageEntity(
          createValidMessageData({ type: MessageType.Text }),
        );
        const updated = original.copyWith({ type: MessageType.Image });

        expect(updated.type).toBe(MessageType.Image);
        expect(original.type).toBe(MessageType.Text);
      });
    });

    describe("when updating multiple properties", () => {
      it("should create a copy with all updated properties", () => {
        const original = new MessageEntity(createValidMessageData());
        const updated = original.copyWith({
          content: "New content",
          status: MessageStatus.Read,
          isForwarded: false,
        });

        expect(updated.content).toBe("New content");
        expect(updated.status).toBe(MessageStatus.Read);
        expect(updated.isForwarded).toBe(false);
        expect(updated.id).toBe(original.id);
      });
    });

    describe("when updates are undefined", () => {
      it("should preserve original values", () => {
        const original = new MessageEntity(
          createValidMessageData({ content: "Original" }),
        );
        const copy = original.copyWith({});

        expect(copy.content).toBe("Original");
      });
    });

    describe("when copying with no changes", () => {
      it("should create an identical copy", () => {
        const original = new MessageEntity(createValidMessageData());
        const copy = original.copyWith({});

        expect(copy.id).toBe(original.id);
        expect(copy.content).toBe(original.content);
        expect(copy.type).toBe(original.type);
        expect(copy.status).toBe(original.status);
      });
    });

    describe("immutability", () => {
      it("should create a new instance", () => {
        const original = new MessageEntity(createValidMessageData());
        const copy = original.copyWith({ content: "New" });

        expect(copy).not.toBe(original);
      });

      it("should not mutate original entity", () => {
        const original = new MessageEntity(
          createValidMessageData({ content: "Original" }),
        );
        original.copyWith({ content: "Modified" });

        expect(original.content).toBe("Original");
      });
    });
  });

  // ==========================================================================
  // toMap Tests
  // ==========================================================================
  describe("toMap", () => {
    describe("when converting to map", () => {
      it("should convert entity to map with timestamp as milliseconds", () => {
        const data = createValidMessageData();
        const entity = new MessageEntity(data);
        const map = entity.toMap();

        expect(map.id).toBe("msg-1");
        expect(map.chatId).toBe("chat-1");
        expect(map.content).toBe("Hello, World!");
        expect(map.type).toBe(MessageType.Text);
        expect(map.timestamp).toBe(data.timestamp.getTime());
        const updatedAt =
          data.updatedAt instanceof Date
            ? data.updatedAt.getTime()
            : data.updatedAt;
        expect(map.updatedAt).toBe(updatedAt);
        expect(map.isForwarded).toBe(true);
        expect(map.forwardedFrom).toEqual(["user-1", "user-2"]);
      });
    });

    describe("when entity has undefined optional fields", () => {
      it("should include undefined fields in map", () => {
        const data = createValidMessageData({
          updatedAt: undefined,
          fileName: undefined,
          fileUrl: undefined,
        });
        const entity = new MessageEntity(data);
        const map = entity.toMap();

        expect(map.updatedAt).toBeUndefined();
        expect(map.fileName).toBeUndefined();
        expect(map.fileUrl).toBeUndefined();
      });
    });

    describe("when entity has location data", () => {
      it("should include location fields in map", () => {
        const data = createValidMessageData({
          type: MessageType.Location,
          latitude: 40.7128,
          longitude: -74.006,
          locationName: "New York",
        });
        const entity = new MessageEntity(data);
        const map = entity.toMap();

        expect(map.latitude).toBe(40.7128);
        expect(map.longitude).toBe(-74.006);
        expect(map.locationName).toBe("New York");
      });
    });

    describe("when entity has media data", () => {
      it("should include media fields in map", () => {
        const data = createValidMessageData({
          type: MessageType.Video,
          fileName: "video.mp4",
          fileUrl: "https://example.com/video.mp4",
          thumbnailUrl: "https://example.com/thumb.jpg",
          fileSize: 1024000,
          mimeType: "video/mp4",
          duration: 120,
        });
        const entity = new MessageEntity(data);
        const map = entity.toMap();

        expect(map.fileName).toBe("video.mp4");
        expect(map.fileUrl).toBe("https://example.com/video.mp4");
        expect(map.thumbnailUrl).toBe("https://example.com/thumb.jpg");
        expect(map.fileSize).toBe(1024000);
        expect(map.mimeType).toBe("video/mp4");
        expect(map.duration).toBe(120);
      });
    });

    describe("when entity has reply data", () => {
      it("should include reply fields in map", () => {
        const data = createValidMessageData({
          replyToId: "reply-123",
          replyToContent: "Original message",
        });
        const entity = new MessageEntity(data);
        const map = entity.toMap();

        expect(map.replyToId).toBe("reply-123");
        expect(map.replyToContent).toBe("Original message");
      });
    });

    describe("when entity has metadata", () => {
      it("should include metadata in map", () => {
        const data = createValidMessageData({
          metadata: { customKey: "customValue", count: 42 },
        });
        const entity = new MessageEntity(data);
        const map = entity.toMap();

        expect(map.metadata).toEqual({ customKey: "customValue", count: 42 });
      });
    });

    describe("when entity has forwardedFrom array", () => {
      it("should include forwardedFrom array in map", () => {
        const data = createValidMessageData({
          isForwarded: true,
          forwardedFrom: ["user-1", "user-2", "user-3"],
        });
        const entity = new MessageEntity(data);
        const map = entity.toMap();

        expect(map.isForwarded).toBe(true);
        expect(map.forwardedFrom).toEqual(["user-1", "user-2", "user-3"]);
      });
    });

    describe("when lastMessageTime is undefined", () => {
      it("should not throw error", () => {
        const data = createValidMessageData({ updatedAt: undefined });
        const entity = new MessageEntity(data);

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
          id: "msg-map-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Jane Doe",
          content: "Message from map",
          type: 1,
          status: 1,
          timestamp: 1718452800000,
          updatedAt: 1718456400000,
          isForwarded: true,
          forwardedFrom: ["user-a", "user-b"],
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.id).toBe("msg-map-1");
        expect(entity.chatId).toBe("chat-1");
        expect(entity.senderId).toBe("sender-1");
        expect(entity.senderName).toBe("Jane Doe");
        expect(entity.content).toBe("Message from map");
        expect(entity.type).toBe(MessageType.Image);
        expect(entity.status).toBe(MessageStatus.Delivered);
        expect(entity.timestamp).toBeInstanceOf(Date);
        expect(entity.isForwarded).toBe(true);
        expect(entity.forwardedFrom).toEqual(["user-a", "user-b"]);
      });
    });

    describe("when type number is invalid", () => {
      it("should default to Text for invalid type number", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Content",
          type: 999,
          timestamp: 1718452800000,
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.type).toBe(MessageType.Text);
      });

      it("should default to Text for negative type number", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Content",
          type: -1,
          timestamp: 1718452800000,
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.type).toBe(MessageType.Text);
      });
    });

    describe("when status number is invalid", () => {
      it("should default to Sent for invalid status number", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Content",
          status: 999,
          timestamp: 1718452800000,
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.status).toBe(MessageStatus.Sent);
      });
    });

    describe("when map has missing required fields", () => {
      it("should default id to empty string for missing id", () => {
        const map = {
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Content",
          timestamp: 1718452800000,
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.id).toBe("");
      });

      it("should default chatId to empty string for missing chatId", () => {
        const map = {
          id: "msg-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Content",
          timestamp: 1718452800000,
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.chatId).toBe("");
      });

      it("should default content to empty string for missing content", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          timestamp: 1718452800000,
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.content).toBe("");
      });
    });

    describe("when forwardedFrom is not an array", () => {
      it("should default to empty array when forwardedFrom is a string", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Content",
          timestamp: 1718452800000,
          forwardedFrom: "not-an-array",
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.forwardedFrom).toEqual([]);
      });

      it("should default to empty array when forwardedFrom is null", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Content",
          timestamp: 1718452800000,
          forwardedFrom: null,
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.forwardedFrom).toEqual([]);
      });
    });

    describe("when map has location data", () => {
      it("should parse location fields from map", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Location",
          type: 5,
          timestamp: 1718452800000,
          latitude: 40.7128,
          longitude: -74.006,
          locationName: "New York",
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.latitude).toBe(40.7128);
        expect(entity.longitude).toBe(-74.006);
        expect(entity.locationName).toBe("New York");
      });
    });

    describe("when map has media data", () => {
      it("should parse media fields from map", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Video",
          type: 2,
          timestamp: 1718452800000,
          fileName: "video.mp4",
          fileUrl: "https://example.com/video.mp4",
          thumbnailUrl: "https://example.com/thumb.jpg",
          fileSize: 1024000,
          mimeType: "video/mp4",
          duration: 120,
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.fileName).toBe("video.mp4");
        expect(entity.fileUrl).toBe("https://example.com/video.mp4");
        expect(entity.thumbnailUrl).toBe("https://example.com/thumb.jpg");
        expect(entity.fileSize).toBe(1024000);
        expect(entity.mimeType).toBe("video/mp4");
        expect(entity.duration).toBe(120);
      });
    });

    describe("when map has reply data", () => {
      it("should parse reply fields from map", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Reply",
          timestamp: 1718452800000,
          replyToId: "reply-123",
          replyToContent: "Original message",
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.replyToId).toBe("reply-123");
        expect(entity.replyToContent).toBe("Original message");
      });
    });

    describe("when map has metadata", () => {
      it("should parse metadata from map", () => {
        const map = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "sender-1",
          senderName: "Name",
          content: "Content",
          timestamp: 1718452800000,
          metadata: { customKey: "customValue" },
        };

        const entity = MessageEntity.fromMap(map);

        expect(entity.metadata).toEqual({ customKey: "customValue" });
      });
    });

    describe("type number mapping", () => {
      it.each`
        typeNum | expectedType
        ${0}    | ${MessageType.Text}
        ${1}    | ${MessageType.Image}
        ${2}    | ${MessageType.Video}
        ${3}    | ${MessageType.Audio}
        ${4}    | ${MessageType.File}
        ${5}    | ${MessageType.Location}
        ${6}    | ${MessageType.Contact}
        ${7}    | ${MessageType.Sticker}
        ${8}    | ${MessageType.Gif}
        ${9}    | ${MessageType.Voice}
        ${10}   | ${MessageType.System}
      `(
        "should map type $typeNum to $expectedType",
        ({ typeNum, expectedType }) => {
          const map = {
            id: "msg-1",
            chatId: "chat-1",
            senderId: "sender-1",
            senderName: "Name",
            content: "Content",
            type: typeNum,
            timestamp: 1718452800000,
          };

          const entity = MessageEntity.fromMap(map);

          expect(entity.type).toBe(expectedType);
        },
      );
    });

    describe("status number mapping", () => {
      it.each`
        statusNum | expectedStatus
        ${0}      | ${MessageStatus.Sent}
        ${1}      | ${MessageStatus.Delivered}
        ${2}      | ${MessageStatus.Read}
        ${3}      | ${MessageStatus.Failed}
      `(
        "should map status $statusNum to $expectedStatus",
        ({ statusNum, expectedStatus }) => {
          const map = {
            id: "msg-1",
            chatId: "chat-1",
            senderId: "sender-1",
            senderName: "Name",
            content: "Content",
            status: statusNum,
            timestamp: 1718452800000,
          };

          const entity = MessageEntity.fromMap(map);

          expect(entity.status).toBe(expectedStatus);
        },
      );
    });
  });

  // ==========================================================================
  // toString Tests
  // ==========================================================================
  describe("toString", () => {
    describe("when converting to string", () => {
      it("should return formatted string with id", () => {
        const entity = new MessageEntity(createValidMessageData());
        const str = entity.toString();

        expect(str).toContain("msg-1");
      });

      it("should return formatted string with type", () => {
        const entity = new MessageEntity(createValidMessageData());
        const str = entity.toString();

        expect(str).toContain("text");
      });

      it("should return formatted string with content", () => {
        const entity = new MessageEntity(createValidMessageData());
        const str = entity.toString();

        expect(str).toContain("Hello, World!");
      });

      it("should return formatted string with timestamp", () => {
        const entity = new MessageEntity(createValidMessageData());
        const str = entity.toString();

        expect(str).toContain("timestamp");
      });
    });
  });

  // ==========================================================================
  // equals Tests
  // ==========================================================================
  describe("equals", () => {
    describe("when comparing same id", () => {
      it("should return true for same id", () => {
        const entity = new MessageEntity(
          createValidMessageData({ id: "same-id" }),
        );
        const other = createValidMessageData({ id: "same-id" });

        expect(entity.equals(other)).toBe(true);
      });

      it("should return true even if content differs", () => {
        const entity = new MessageEntity(
          createValidMessageData({ id: "same-id", content: "Content A" }),
        );
        const other = createValidMessageData({
          id: "same-id",
          content: "Content B",
        });

        expect(entity.equals(other)).toBe(true);
      });
    });

    describe("when comparing different id", () => {
      it("should return false for different id", () => {
        const entity = new MessageEntity(
          createValidMessageData({ id: "id-1" }),
        );
        const other = createValidMessageData({ id: "id-2" });

        expect(entity.equals(other)).toBe(false);
      });
    });

    describe("when comparing with partial object", () => {
      it("should return true if id matches", () => {
        const entity = new MessageEntity(
          createValidMessageData({ id: "msg-1" }),
        );
        const other = { id: "msg-1" } as Message;

        expect(entity.equals(other)).toBe(true);
      });
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe("edge cases", () => {
    describe("when content is empty string", () => {
      it("should handle empty content", () => {
        const data = createValidMessageData({ content: "" });
        const entity = new MessageEntity(data);

        expect(entity.content).toBe("");
      });
    });

    describe("when content is very long", () => {
      it("should handle long content", () => {
        const longContent = "a".repeat(10000);
        const data = createValidMessageData({ content: longContent });
        const entity = new MessageEntity(data);

        expect(entity.content).toHaveLength(10000);
      });
    });

    describe("when fileSize is zero", () => {
      it("should handle zero fileSize", () => {
        const data = createValidMessageData({ fileSize: 0 });
        const entity = new MessageEntity(data);

        expect(entity.fileSize).toBe(0);
      });
    });

    describe("when fileSize is negative", () => {
      it("should handle negative fileSize", () => {
        const data = createValidMessageData({ fileSize: -100 });
        const entity = new MessageEntity(data);

        expect(entity.fileSize).toBe(-100);
      });
    });

    describe("when duration is zero", () => {
      it("should handle zero duration", () => {
        const data = createValidMessageData({ duration: 0 });
        const entity = new MessageEntity(data);

        expect(entity.duration).toBe(0);
      });
    });

    describe("when coordinates are zero", () => {
      it("should handle zero coordinates", () => {
        const data = createValidMessageData({ latitude: 0, longitude: 0 });
        const entity = new MessageEntity(data);

        expect(entity.latitude).toBe(0);
        expect(entity.longitude).toBe(0);
      });
    });

    describe("when coordinates are negative", () => {
      it("should handle negative coordinates", () => {
        const data = createValidMessageData({ latitude: -90, longitude: -180 });
        const entity = new MessageEntity(data);

        expect(entity.latitude).toBe(-90);
        expect(entity.longitude).toBe(-180);
      });
    });

    describe("when coordinates exceed valid range", () => {
      it("should handle latitude exceeding 90", () => {
        const data = createValidMessageData({ latitude: 91 });
        const entity = new MessageEntity(data);

        expect(entity.latitude).toBe(91);
      });

      it("should handle longitude exceeding 180", () => {
        const data = createValidMessageData({ longitude: 181 });
        const entity = new MessageEntity(data);

        expect(entity.longitude).toBe(181);
      });
    });

    describe("when forwardedFrom has many entries", () => {
      it("should handle many forwarded entries", () => {
        const manyForwarded = Array.from(
          { length: 100 },
          (_, i) => `user-${i}`,
        );
        const data = createValidMessageData({ forwardedFrom: manyForwarded });
        const entity = new MessageEntity(data);

        expect(entity.forwardedFrom).toHaveLength(100);
        expect(entity.forwardedFrom[0]).toBe("user-0");
        expect(entity.forwardedFrom[99]).toBe("user-99");
      });
    });

    describe("when metadata has nested objects", () => {
      it("should handle nested metadata", () => {
        const data = createValidMessageData({
          metadata: {
            level1: {
              level2: {
                level3: "deep value",
              },
            },
            array: [1, 2, 3],
          },
        });
        const entity = new MessageEntity(data);

        expect(entity.metadata).toEqual({
          level1: {
            level2: {
              level3: "deep value",
            },
          },
          array: [1, 2, 3],
        });
      });
    });

    describe("roundtrip conversion", () => {
      it("should preserve data through toMap and fromMap", () => {
        const original = new MessageEntity(createValidMessageData());
        const map = original.toMap();
        const restored = MessageEntity.fromMap(map);

        expect(restored.id).toBe(original.id);
        expect(restored.chatId).toBe(original.chatId);
        expect(restored.senderId).toBe(original.senderId);
        expect(restored.senderName).toBe(original.senderName);
        expect(restored.content).toBe(original.content);
        expect(restored.type).toBe(original.type);
        expect(restored.status).toBe(original.status);
        expect(restored.isForwarded).toBe(original.isForwarded);
      });
    });
  });
});
