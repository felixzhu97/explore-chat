import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { GetUsersDto, UpdateUserDto } from "@/users/application/user.dto";

describe("GetUsersDto", () => {
  it("should pass with valid default values", async () => {
    const dto = plainToInstance(GetUsersDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with valid page and limit", async () => {
    const dto = plainToInstance(GetUsersDto, { page: 5, limit: 50 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with search string", async () => {
    const dto = plainToInstance(GetUsersDto, { search: "john" });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail when page is less than 1", async () => {
    const dto = plainToInstance(GetUsersDto, { page: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when limit is less than 1", async () => {
    const dto = plainToInstance(GetUsersDto, { limit: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when limit exceeds 100", async () => {
    const dto = plainToInstance(GetUsersDto, { limit: 150 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("UpdateUserDto", () => {
  it("should pass with valid username", async () => {
    const dto = plainToInstance(UpdateUserDto, { username: "newname" });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with valid phone", async () => {
    const dto = plainToInstance(UpdateUserDto, { phone: "+1234567890" });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with valid avatar url", async () => {
    const dto = plainToInstance(UpdateUserDto, {
      avatar: "https://example.com/avatar.jpg",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with valid status", async () => {
    const dto = plainToInstance(UpdateUserDto, { status: "online" });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass with multiple valid fields", async () => {
    const dto = plainToInstance(UpdateUserDto, {
      username: "newname",
      phone: "+1234567890",
      avatar: "https://example.com/avatar.jpg",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail when username is not a string", async () => {
    const dto = plainToInstance(UpdateUserDto, { username: 123 } as any);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
