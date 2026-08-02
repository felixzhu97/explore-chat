import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoggingInterceptor } from "@/core/interceptors/logging.interceptor";
import { ExecutionContext, CallHandler } from "@nestjs/common";
import { of } from "rxjs";

describe("LoggingInterceptor", () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  const createMockExecutionContext = (
    overrides: Partial<ExecutionContext & { request: any; response: any }> = {},
  ): ExecutionContext => {
    const mockRequest = {
      method: "GET",
      url: "/api/users",
      ip: "127.0.0.1",
      ...overrides.request,
    };
    const mockResponse = {
      statusCode: 200,
      ...overrides.response,
    };

    return {
      switchToHttp: vi.fn(() => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      })),
      getType: () => "http",
      ...overrides,
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (result: any = null): CallHandler => {
    return {
      handle: () => of(result),
    };
  };

  describe("intercept", () => {
    it("should call next.handle() and return observable", async () => {
      const context = createMockExecutionContext();
      const next = createMockCallHandler({ data: "test" });

      const result = interceptor.intercept(context, next);

      const value = await new Promise((resolve) => {
        result.subscribe({
          next: (val) => resolve(val),
          error: () => {},
        });
      });

      expect(value).toEqual({ data: "test" });
    });

    it("should skip logging for graphql requests", () => {
      const context = createMockExecutionContext({ getType: () => "graphql" });
      const next = createMockCallHandler({ data: "test" });

      const result = interceptor.intercept(context, next);

      expect(result).toBeDefined();
    });

    it("should skip logging when request is not available", () => {
      const context = {
        switchToHttp: vi.fn(() => ({
          getRequest: () => null,
          getResponse: () => ({}),
        })),
        getType: () => "http",
      } as unknown as ExecutionContext;
      const next = createMockCallHandler({ data: "test" });

      const result = interceptor.intercept(context, next);

      expect(result).toBeDefined();
    });

    it("should skip logging when request is not an object", () => {
      const context = {
        switchToHttp: vi.fn(() => ({
          getRequest: () => "string-not-object",
          getResponse: () => ({}),
        })),
        getType: () => "http",
      } as unknown as ExecutionContext;
      const next = createMockCallHandler({ data: "test" });

      const result = interceptor.intercept(context, next);

      expect(result).toBeDefined();
    });

    it("should handle missing request properties gracefully", () => {
      const context = createMockExecutionContext({
        request: { method: undefined, url: undefined, ip: undefined },
      });
      const next = createMockCallHandler({ data: "test" });

      const result = interceptor.intercept(context, next);

      expect(result).toBeDefined();
    });

    it("should handle different HTTP methods", async () => {
      const postContext = createMockExecutionContext({
        request: { method: "POST", url: "/api/users", ip: "192.168.1.1" },
      });
      const next = createMockCallHandler({ created: true });

      const result = interceptor.intercept(postContext, next);

      const value = await new Promise((resolve) => {
        result.subscribe({
          next: (val) => resolve(val),
          error: () => {},
        });
      });

      expect(value).toEqual({ created: true });
    });
  });
});
