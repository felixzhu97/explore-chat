import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidationExceptionFilter } from "@/core/filters/validation-exception.filter";
import { BadRequestException } from "@nestjs/common";

describe("ValidationExceptionFilter", () => {
  let filter: ValidationExceptionFilter;

  beforeEach(() => {
    filter = new ValidationExceptionFilter();
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

    const exception = new BadRequestException("Validation error");

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: "VALIDATION_ERROR",
      }),
    );
  });

  it("should handle object message", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const exception = new BadRequestException({
      message: "Field is required",
    });

    filter.catch(exception, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Field is required",
        code: "VALIDATION_ERROR",
      }),
    );
  });

  it("should handle array message", () => {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const host = createMockHost(mockResponse);

    const exception = new BadRequestException(["First error", "Second error"]);

    filter.catch(exception, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "First error, Second error",
        code: "VALIDATION_ERROR",
      }),
    );
  });

  it("should rethrow for graphql requests", () => {
    const host = {
      getType: vi.fn().mockReturnValue("graphql"),
    } as any;

    const exception = new BadRequestException("GraphQL validation error");

    expect(() => filter.catch(exception, host)).toThrow();
  });
});
