import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpExceptionFilter } from "@/core/filters/http-exception.filter";
import { HttpException, HttpStatus } from "@nestjs/common";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  const createMockHost = (responseMock: any = {}) => ({
    getType: vi.fn().mockReturnValue("http"),
    switchToHttp: vi.fn().mockReturnValue({
      getResponse: vi.fn().mockReturnValue({
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        ...responseMock,
      }),
    }),
  });

  it("should handle string message", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Test error",
      }),
    );
  });

  it("should handle object message", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const exception = new HttpException(
      { message: "Object error", code: "TEST" },
      HttpStatus.NOT_FOUND,
    );

    filter.catch(exception, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Object error",
      }),
    );
  });

  it("should rethrow for graphql requests", () => {
    const host = {
      getType: vi.fn().mockReturnValue("graphql"),
    } as any;

    const exception = new HttpException(
      "GraphQL error",
      HttpStatus.BAD_REQUEST,
    );

    expect(() => filter.catch(exception, host)).toThrow();
  });

  it("should handle array message", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const exception = new HttpException(
      { message: ["Error 1", "Error 2"] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Error 1, Error 2",
      }),
    );
  });
});
