import { createHttpClientFromAxios } from "@/core/api-client";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

describe("axios-http.adapter", () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;
  });

  describe("createHttpClientFromAxios", () => {
    it("should create HttpClient from axios instance", () => {
      const client = createHttpClientFromAxios(mockAxiosInstance);

      expect(client).toBeDefined();
      expect(typeof client.get).toBe("function");
      expect(typeof client.post).toBe("function");
      expect(typeof client.put).toBe("function");
      expect(typeof client.delete).toBe("function");
    });

    describe("get method", () => {
      it("should call axios get with url", async () => {
        const mockResponse = { data: { success: true, data: [] } };
        (mockAxiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

        const client = createHttpClientFromAxios(mockAxiosInstance);
        const result = await client.get("/test");

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/test", undefined);
        expect(result).toEqual({ data: mockResponse.data });
      });

      it("should pass config to axios get", async () => {
        const mockResponse = { data: { success: true, data: [] } };
        (mockAxiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);
        const config = { params: { page: 1 } };

        const client = createHttpClientFromAxios(mockAxiosInstance);
        await client.get("/test", config);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/test", config);
      });

      it("should return correct data structure", async () => {
        const responseData = { items: ["a", "b", "c"] };
        const mockResponse = { data: responseData };
        (mockAxiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

        const client = createHttpClientFromAxios(mockAxiosInstance);
        const result = await client.get("/items");

        expect(result).toEqual({ data: responseData });
      });
    });

    describe("post method", () => {
      it("should call axios post with url and body", async () => {
        const mockResponse = { data: { success: true, data: { id: "123" } } };
        (mockAxiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

        const client = createHttpClientFromAxios(mockAxiosInstance);
        const body = { name: "test" };
        const result = await client.post("/test", body);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/test",
          body,
          undefined,
        );
        expect(result).toEqual({ data: mockResponse.data });
      });

      it("should pass config to axios post", async () => {
        const mockResponse = { data: { success: true } };
        (mockAxiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);
        const body = { name: "test" };
        const config = { headers: { "Content-Type": "application/json" } };

        const client = createHttpClientFromAxios(mockAxiosInstance);
        await client.post("/test", body, config);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/test",
          body,
          config,
        );
      });
    });

    describe("put method", () => {
      it("should call axios put with url and body", async () => {
        const mockResponse = {
          data: { success: true, data: { updated: true } },
        };
        (mockAxiosInstance.put as jest.Mock).mockResolvedValue(mockResponse);

        const client = createHttpClientFromAxios(mockAxiosInstance);
        const body = { name: "updated" };
        const result = await client.put("/test/123", body);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith(
          "/test/123",
          body,
          undefined,
        );
        expect(result).toEqual({ data: mockResponse.data });
      });

      it("should pass config to axios put", async () => {
        const mockResponse = { data: { success: true } };
        (mockAxiosInstance.put as jest.Mock).mockResolvedValue(mockResponse);

        const client = createHttpClientFromAxios(mockAxiosInstance);
        await client.put("/test/123", {}, { headers: {} });

        expect(mockAxiosInstance.put).toHaveBeenCalledWith(
          "/test/123",
          {},
          { headers: {} },
        );
      });
    });

    describe("delete method", () => {
      it("should call axios delete with url", async () => {
        const mockResponse = {
          data: { success: true, data: { deleted: true } },
        };
        (mockAxiosInstance.delete as jest.Mock).mockResolvedValue(mockResponse);

        const client = createHttpClientFromAxios(mockAxiosInstance);
        const result = await client.delete("/test/123");

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
          "/test/123",
          undefined,
        );
        expect(result).toEqual({ data: mockResponse.data });
      });

      it("should pass config to axios delete", async () => {
        const mockResponse = { data: { success: true } };
        (mockAxiosInstance.delete as jest.Mock).mockResolvedValue(mockResponse);
        const config = { data: { reason: "test" } };

        const client = createHttpClientFromAxios(mockAxiosInstance);
        await client.delete("/test/123", config);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
          "/test/123",
          config,
        );
      });
    });

    describe("error handling", () => {
      it("should propagate errors from axios", async () => {
        const error = new Error("Network error");
        (mockAxiosInstance.get as jest.Mock).mockRejectedValue(error);

        const client = createHttpClientFromAxios(mockAxiosInstance);

        await expect(client.get("/test")).rejects.toThrow("Network error");
      });

      it("should handle axios response errors", async () => {
        const error = {
          response: { status: 404, data: { message: "Not found" } },
        };
        (mockAxiosInstance.post as jest.Mock).mockRejectedValue(error);

        const client = createHttpClientFromAxios(mockAxiosInstance);

        await expect(client.post("/test", {})).rejects.toEqual(error);
      });
    });
  });
});
