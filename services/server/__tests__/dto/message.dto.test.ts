import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import {
  CreateMessageDto,
  GetMessagesDto,
  UpdateMessageDto,
} from "@/messages/application/message.dto";

describe("CreateMessageDto", () => {
  it("should pass with valid TEXT message", async () => {
    const dto = plainToInstance(CreateMessageDto, {
      content: "Hello, World!",
      type: "TEXT",
      chatId: "chat-1",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with IMAGE message type", async () => {
    const dto = plainToInstance(CreateMessageDto, {
      content: "",
      type: "IMAGE",
      chatId: "chat-1",
      mediaUrl: "https://example.com/image.jpg",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail when content is missing for TEXT message", async () => {
    const dto = plainToInstance(CreateMessageDto, {
      type: "TEXT",
      chatId: "chat-1",
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when chatId is missing", async () => {
    const dto = plainToInstance(CreateMessageDto, {
      content: "Hello",
      type: "TEXT",
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail with invalid message type", async () => {
    const dto = plainToInstance(CreateMessageDto, {
      content: "Hello",
      type: "INVALID_TYPE",
      chatId: "chat-1",
    } as any);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should pass with optional replyToMessageId", async () => {
    const dto = plainToInstance(CreateMessageDto, {
      content: "Reply message",
      type: "TEXT",
      chatId: "chat-1",
      replyToMessageId: "msg-123",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with optional metadata", async () => {
    const dto = plainToInstance(CreateMessageDto, {
      content: "Message with metadata",
      type: "TEXT",
      chatId: "chat-1",
      metadata: { key: "value" },
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe("GetMessagesDto", () => {
  it("should pass with valid default values", async () => {
    const dto = plainToInstance(GetMessagesDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with valid page and limit", async () => {
    const dto = plainToInstance(GetMessagesDto, { page: 3, limit: 50 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with search string", async () => {
    const dto = plainToInstance(GetMessagesDto, { search: "hello" });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail when page is less than 1", async () => {
    const dto = plainToInstance(GetMessagesDto, { page: -1 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when limit exceeds 100", async () => {
    const dto = plainToInstance(GetMessagesDto, { limit: 200 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("UpdateMessageDto", () => {
  it("should pass with valid content update", async () => {
    const dto = plainToInstance(UpdateMessageDto, {
      content: "Updated message",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with empty object", async () => {
    const dto = plainToInstance(UpdateMessageDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
