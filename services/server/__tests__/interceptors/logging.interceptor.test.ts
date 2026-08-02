import { describe, it, expect, vi, beforeEach } from "vitest";
import { of } from "rxjs";
import { LoggingInterceptor } from "@/core/interceptors/logging.interceptor";

describe("LoggingInterceptor", () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it("should skip logging for graphql requests", () => {
    const mockContext = {
      getType: vi.fn().mockReturnValue("graphql"),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of({ data: "test" })),
    } as any;

    interceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalled();
  });

  it("should skip logging for non-object request", () => {
    const mockContext = {
      getType: vi.fn().mockReturnValue("http"),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(null),
      }),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of({ data: "test" })),
    } as any;

    interceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalled();
  });

  it("should log successful request", () => {
    const mockResponse = { statusCode: 200 };
    const mockContext = {
      getType: vi.fn().mockReturnValue("http"),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          method: "GET",
          url: "/test",
          ip: "127.0.0.1",
        }),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of({ data: "test" })),
    } as any;

    const result = interceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalled();
  });

  it("should handle request with missing properties", () => {
    const mockContext = {
      getType: vi.fn().mockReturnValue("http"),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({}),
        getResponse: vi.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of({ data: "test" })),
    } as any;

    const result = interceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalled();
  });
});
