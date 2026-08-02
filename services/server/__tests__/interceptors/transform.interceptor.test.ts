import { describe, it, expect, vi, beforeEach } from "vitest";
import { of } from "rxjs";
import { TransformInterceptor } from "@/core/interceptors/transform.interceptor";

describe("TransformInterceptor", () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it("should skip transformation for graphql requests", async () => {
    const mockContext = {
      getType: vi.fn().mockReturnValue("graphql"),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of({ data: "test" })),
    } as any;

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockNext).subscribe((data) => {
        resolve(data);
      });
    });

    expect(result).toEqual({ data: "test" });
  });

  it("should wrap data in response object", async () => {
    const mockContext = {
      getType: vi.fn().mockReturnValue("http"),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of({ data: "test" })),
    } as any;

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockNext).subscribe((data) => {
        resolve(data);
      });
    });

    // The interceptor checks if data has 'success' property
    // and only adds timestamp, it does not add 'success: true'
    // because the data already has 'data' property, not 'success'
    expect(result).toHaveProperty("data");
    expect((result as any).timestamp).toBeDefined();
  });

  it("should add timestamp to response with success", async () => {
    const mockContext = {
      getType: vi.fn().mockReturnValue("http"),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of({ success: false, message: "error" })),
    } as any;

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockNext).subscribe((data) => {
        resolve(data);
      });
    });

    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("message", "error");
    expect((result as any).timestamp).toBeDefined();
  });

  it("should handle plain data without wrapper", async () => {
    const mockContext = {
      getType: vi.fn().mockReturnValue("http"),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of("plain string")),
    } as any;

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockNext).subscribe((data) => {
        resolve(data);
      });
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("data", "plain string");
    expect((result as any).timestamp).toBeDefined();
  });

  it("should handle null data", async () => {
    const mockContext = {
      getType: vi.fn().mockReturnValue("http"),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of(null)),
    } as any;

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockNext).subscribe((data) => {
        resolve(data);
      });
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("data", null);
  });

  it("should handle array data", async () => {
    const mockContext = {
      getType: vi.fn().mockReturnValue("http"),
    } as any;
    const mockNext = {
      handle: vi.fn().mockReturnValue(of([1, 2, 3])),
    } as any;

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockNext).subscribe((data) => {
        resolve(data);
      });
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("data");
  });
});
