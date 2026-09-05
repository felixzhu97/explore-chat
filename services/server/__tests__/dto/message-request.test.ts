import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import {
  CreateMessageRequest,
  GetMessagesRequest,
  UpdateMessageRequest,
} from "@/messages/controller/message-request";

describe("CreateMessageRequest", () => {
  it("should pass with valid TEXT message", async () => {
    const dto = plainToInstance(CreateMessageRequest, {
      content: "Hello, World!",
      type: "TEXT",
      chatId: "chat-1",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with IMAGE message type", async () => {
    const dto = plainToInstance(CreateMessageRequest, {
      content: "",
      type: "IMAGE",
      chatId: "chat-1",
      mediaUrl: "https://example.com/image.jpg",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail when content is missing for TEXT message", async () => {
    const dto = plainToInstance(CreateMessageRequest, {
      type: "TEXT",
      chatId: "chat-1",
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when chatId is missing", async () => {
    const dto = plainToInstance(CreateMessageRequest, {
      content: "Hello",
      type: "TEXT",
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail with invalid message type", async () => {
    const dto = plainToInstance(CreateMessageRequest, {
      content: "Hello",
      type: "INVALID_TYPE",
      chatId: "chat-1",
    } as any);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should pass with optional replyToMessageId", async () => {
    const dto = plainToInstance(CreateMessageRequest, {
      content: "Reply message",
      type: "TEXT",
      chatId: "chat-1",
      replyToMessageId: "msg-123",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with optional metadata", async () => {
    const dto = plainToInstance(CreateMessageRequest, {
      content: "Message with metadata",
      type: "TEXT",
      chatId: "chat-1",
      metadata: { key: "value" },
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe("GetMessagesRequest", () => {
  it("should pass with valid default values", async () => {
    const dto = plainToInstance(GetMessagesRequest, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with valid page and limit", async () => {
    const dto = plainToInstance(GetMessagesRequest, { page: 3, limit: 50 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with search string", async () => {
    const dto = plainToInstance(GetMessagesRequest, { search: "hello" });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail when page is less than 1", async () => {
    const dto = plainToInstance(GetMessagesRequest, { page: -1 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when limit exceeds 100", async () => {
    const dto = plainToInstance(GetMessagesRequest, { limit: 200 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("UpdateMessageRequest", () => {
  it("should pass with valid content update", async () => {
    const dto = plainToInstance(UpdateMessageRequest, {
      content: "Updated message",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with empty object", async () => {
    const dto = plainToInstance(UpdateMessageRequest, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
