import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessagesController } from "@/messages/presentation/messages.controller";
import { NotFoundException } from "@nestjs/common";

describe("MessagesController", () => {
  let messagesController: MessagesController;
  let mockMessagesService: any;
  let mockChatGateway: any;

  const mockMessage = {
    id: "message-1",
    chatId: "chat-1",
    senderId: "user-1",
    type: "TEXT",
    content: "Hello, World!",
    mediaUrl: null,
    replyToMessageId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sender: {
      id: "user-1",
      username: "user1",
      avatar: null,
    },
  };

  beforeEach(() => {
    mockMessagesService = {
      createMessage: vi.fn(),
      getMessages: vi.fn(),
      updateMessage: vi.fn(),
      deleteMessage: vi.fn(),
    };

    mockChatGateway = {
      deliverToParticipants: vi
        .fn()
        .mockResolvedValue({ deliveredOnline: false }),
      emitDelivered: vi.fn(),
    };

    messagesController = new MessagesController(
      mockMessagesService,
      mockChatGateway,
    );
  });

  describe("getMessages", () => {
    it("should return paginated messages", async () => {
      const messages = [mockMessage, { ...mockMessage, id: "message-2" }];
      mockMessagesService.getMessages.mockResolvedValue(messages);

      const result = await messagesController.getMessages("chat-1", "1", "20");

      expect(result).toEqual({
        success: true,
        data: messages,
      });
      expect(mockMessagesService.getMessages).toHaveBeenCalledWith("chat-1", {
        page: 1,
        limit: 20,
      });
    });

    it("should use default pagination values", async () => {
      mockMessagesService.getMessages.mockResolvedValue([]);

      await messagesController.getMessages("chat-1", undefined, undefined);

      expect(mockMessagesService.getMessages).toHaveBeenCalledWith("chat-1", {
        page: 1,
        limit: 20,
      });
    });

    it("should include search parameter when provided", async () => {
      mockMessagesService.getMessages.mockResolvedValue([]);

      await messagesController.getMessages("chat-1", "1", "20", "Hello");

      expect(mockMessagesService.getMessages).toHaveBeenCalledWith("chat-1", {
        page: 1,
        limit: 20,
        search: "Hello",
      });
    });

    it("should parse pagination string values correctly", async () => {
      mockMessagesService.getMessages.mockResolvedValue([]);

      await messagesController.getMessages("chat-1", "3", "50");

      expect(mockMessagesService.getMessages).toHaveBeenCalledWith("chat-1", {
        page: 3,
        limit: 50,
      });
    });
  });

  describe("createMessage", () => {
    const mockUser = { id: "user-1", username: "user1" };

    const createMessageDto = {
      content: "Hello, World!",
      type: "TEXT",
      chatId: "chat-1",
    };

    it("should create a message and deliver to participants", async () => {
      mockMessagesService.createMessage.mockResolvedValue(mockMessage);
      mockChatGateway.deliverToParticipants.mockResolvedValue({
        deliveredOnline: true,
      });

      const result = await messagesController.createMessage(
        mockUser,
        createMessageDto,
      );

      expect(result).toEqual({
        success: true,
        message: "消息发送成功",
        data: mockMessage,
      });
      expect(mockMessagesService.createMessage).toHaveBeenCalledWith({
        content: createMessageDto.content,
        type: createMessageDto.type,
        chatId: createMessageDto.chatId,
        senderId: mockUser.id,
      });
      expect(mockChatGateway.deliverToParticipants).toHaveBeenCalledWith(
        mockMessage,
        mockMessage.chatId,
        mockMessage.senderId,
      );
      expect(mockChatGateway.emitDelivered).toHaveBeenCalledWith("user-1", {
        messageId: "message-1",
        chatId: "chat-1",
      });
    });

    it("should include mediaUrl when provided", async () => {
      const messageWithMedia = {
        ...createMessageDto,
        mediaUrl: "https://example.com/image.jpg",
      };

      mockMessagesService.createMessage.mockResolvedValue({
        ...mockMessage,
        mediaUrl: "https://example.com/image.jpg",
      });
      mockChatGateway.deliverToParticipants.mockResolvedValue({
        deliveredOnline: false,
      });

      await messagesController.createMessage(mockUser, messageWithMedia);

      expect(mockMessagesService.createMessage).toHaveBeenCalledWith({
        content: messageWithMedia.content,
        type: messageWithMedia.type,
        chatId: messageWithMedia.chatId,
        senderId: mockUser.id,
        mediaUrl: messageWithMedia.mediaUrl,
      });
    });

    it("should include replyToMessageId when provided", async () => {
      const messageWithReply = {
        ...createMessageDto,
        replyToMessageId: "original-message-id",
      };

      mockMessagesService.createMessage.mockResolvedValue({
        ...mockMessage,
        replyToMessageId: "original-message-id",
      });
      mockChatGateway.deliverToParticipants.mockResolvedValue({
        deliveredOnline: false,
      });

      await messagesController.createMessage(mockUser, messageWithReply);

      expect(mockMessagesService.createMessage).toHaveBeenCalledWith({
        content: messageWithReply.content,
        type: messageWithReply.type,
        chatId: messageWithReply.chatId,
        senderId: mockUser.id,
        replyToMessageId: messageWithReply.replyToMessageId,
      });
    });

    it("should throw NotFoundException when chat does not exist", async () => {
      mockMessagesService.createMessage.mockRejectedValue(
        new NotFoundException("聊天不存在"),
      );

      await expect(
        messagesController.createMessage(mockUser, createMessageDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateMessage", () => {
    it("should update message content", async () => {
      const updatedMessage = { ...mockMessage, content: "Updated content" };
      mockMessagesService.updateMessage.mockResolvedValue(updatedMessage);

      const result = await messagesController.updateMessage("message-1", {
        content: "Updated content",
      });

      expect(result).toEqual({
        success: true,
        message: "消息更新成功",
        data: updatedMessage,
      });
      expect(mockMessagesService.updateMessage).toHaveBeenCalledWith(
        "message-1",
        { content: "Updated content" },
      );
    });

    it("should update message type", async () => {
      const updatedMessage = { ...mockMessage, type: "IMAGE" };
      mockMessagesService.updateMessage.mockResolvedValue(updatedMessage);

      const result = await messagesController.updateMessage("message-1", {
        type: "IMAGE",
      });

      expect(result.data.type).toBe("IMAGE");
    });

    it("should update both content and type", async () => {
      const updatedMessage = {
        ...mockMessage,
        content: "New content",
        type: "IMAGE",
      };
      mockMessagesService.updateMessage.mockResolvedValue(updatedMessage);

      const result = await messagesController.updateMessage("message-1", {
        content: "New content",
        type: "IMAGE",
      });

      expect(result.data.content).toBe("New content");
      expect(result.data.type).toBe("IMAGE");
    });
  });

  describe("deleteMessage", () => {
    it("should delete message successfully", async () => {
      mockMessagesService.deleteMessage.mockResolvedValue(mockMessage);

      const result = await messagesController.deleteMessage("message-1");

      expect(result).toEqual({
        success: true,
        message: "消息删除成功",
      });
      expect(mockMessagesService.deleteMessage).toHaveBeenCalledWith(
        "message-1",
      );
    });
  });
});
