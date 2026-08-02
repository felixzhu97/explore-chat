import { describe, it, expect, vi, beforeEach } from "vitest";
import { AllExceptionsFilter } from "@/core/filters/all-exceptions.filter";
import { HttpStatus, HttpException } from "@nestjs/common";

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  const createMockHost = (responseMock: any = {}, requestMock: any = {}) => ({
    getType: vi.fn().mockReturnValue("http"),
    switchToHttp: vi.fn().mockReturnValue({
      getResponse: vi.fn().mockReturnValue({
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        ...responseMock,
      }),
      getRequest: vi.fn().mockReturnValue({
        url: "/test",
        method: "GET",
        ip: "127.0.0.1",
        ...requestMock,
      }),
    }),
  });

  it("should rethrow for graphql requests", () => {
    const host = {
      getType: vi.fn().mockReturnValue("graphql"),
    } as any;

    expect(() => filter.catch(new Error("test"), host)).toThrow("test");
  });

  it("should handle HttpException", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    filter.catch(new HttpException("Test error", HttpStatus.BAD_REQUEST), host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it("should handle generic Error", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    filter.catch(new Error("generic error"), host);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it("should handle PrismaClientKnownRequestError P2002", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const prismaError = {
      name: "PrismaClientKnownRequestError",
      code: "P2002",
    };
    filter.catch(prismaError as any, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "DUPLICATE_ENTRY",
      }),
    );
  });

  it("should handle PrismaClientKnownRequestError P2025", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const prismaError = {
      name: "PrismaClientKnownRequestError",
      code: "P2025",
    };
    filter.catch(prismaError as any, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "RECORD_NOT_FOUND",
      }),
    );
  });

  it("should handle PrismaClientKnownRequestError P2003", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const prismaError = {
      name: "PrismaClientKnownRequestError",
      code: "P2003",
    };
    filter.catch(prismaError as any, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "FOREIGN_KEY_CONSTRAINT",
      }),
    );
  });

  it("should handle JsonWebTokenError", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const jwtError = { name: "JsonWebTokenError", message: "invalid token" };
    filter.catch(jwtError as any, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "INVALID_TOKEN",
      }),
    );
  });

  it("should handle TokenExpiredError", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const expiredError = { name: "TokenExpiredError", message: "jwt expired" };
    filter.catch(expiredError as any, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "TOKEN_EXPIRED",
      }),
    );
  });
});
