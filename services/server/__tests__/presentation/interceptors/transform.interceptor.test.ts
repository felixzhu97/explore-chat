import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  TransformInterceptor,
  Response,
} from "@/core/interceptors/transform.interceptor";
import { ExecutionContext, CallHandler } from "@nestjs/common";
import { of } from "rxjs";

describe("TransformInterceptor", () => {
  let interceptor: TransformInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  const createMockExecutionContext = (type = "http"): ExecutionContext => {
    return {
      switchToHttp: vi.fn(() => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      })),
      getType: () => type,
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (result: any): CallHandler => {
    return {
      handle: () => of(result),
    };
  };

  const subscribeToObservable = async <T>(observable: any): Promise<T> => {
    return new Promise((resolve) => {
      observable.subscribe({
        next: (val: T) => resolve(val),
        error: () => {},
      });
    });
  };

  describe("intercept", () => {
    it("should wrap response with success structure for plain data", async () => {
      const context = createMockExecutionContext();
      const next = createMockCallHandler({ id: 1, name: "Test" });

      const result = interceptor.intercept(context, next);
      const value = await subscribeToObservable<Response<any>>(result);

      expect(value).toHaveProperty("success", true);
      expect(value).toHaveProperty("data");
      expect(value).toHaveProperty("timestamp");
      expect(value.data).toEqual({ id: 1, name: "Test" });
    });

    it("should skip transformation for graphql requests", async () => {
      const context = createMockExecutionContext("graphql");
      const next = createMockCallHandler({ posts: [] });

      const result = interceptor.intercept(context, next);
      const value = await subscribeToObservable(result);

      expect(value).toEqual({ posts: [] });
    });

    it("should preserve existing success structure and add timestamp", async () => {
      const context = createMockExecutionContext();
      const next = createMockCallHandler({
        success: true,
        message: "Custom message",
      });

      const result = interceptor.intercept(context, next);
      const value = await subscribeToObservable<Response<any>>(result);

      expect(value).toHaveProperty("success", true);
      expect(value).toHaveProperty("message", "Custom message");
      expect(value).toHaveProperty("timestamp");
    });

    it("should handle array response", async () => {
      const context = createMockExecutionContext();
      const next = createMockCallHandler([1, 2, 3]);

      const result = interceptor.intercept(context, next);
      const value = await subscribeToObservable<Response<any>>(result);

      expect(value.data).toEqual([1, 2, 3]);
      expect(value.success).toBe(true);
    });

    it("should handle null response", async () => {
      const context = createMockExecutionContext();
      const next = createMockCallHandler(null);

      const result = interceptor.intercept(context, next);
      const value = await subscribeToObservable<Response<any>>(result);

      expect(value).toHaveProperty("success", true);
      expect(value.data).toBeNull();
    });

    it("should handle string response", async () => {
      const context = createMockExecutionContext();
      const next = createMockCallHandler("Simple string");

      const result = interceptor.intercept(context, next);
      const value = await subscribeToObservable<Response<any>>(result);

      expect(value.data).toBe("Simple string");
    });

    it("should handle number response", async () => {
      const context = createMockExecutionContext();
      const next = createMockCallHandler(42);

      const result = interceptor.intercept(context, next);
      const value = await subscribeToObservable<Response<any>>(result);

      expect(value.data).toBe(42);
    });

    it("should add ISO timestamp to response", async () => {
      const context = createMockExecutionContext();
      const next = createMockCallHandler({ data: true });

      const result = interceptor.intercept(context, next);
      const value = await subscribeToObservable<Response<any>>(result);

      expect(value.timestamp).toBeDefined();
      expect(new Date(value.timestamp).toISOString()).toBe(value.timestamp);
    });
  });

  describe("Response interface", () => {
    it("should export correct Response interface", () => {
      const response: Response<string> = {
        success: true,
        data: "test",
        timestamp: new Date().toISOString(),
      };

      expect(response.success).toBe(true);
      expect(response.data).toBe("test");
      expect(response.timestamp).toBeDefined();
    });
  });
});
