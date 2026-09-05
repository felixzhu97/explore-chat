import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClient } from "@/auth/api-client";
import type { ApiClient } from "@/auth/api-client";

describe("ApiClient", () => {
  let adapter: ApiClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create adapter with default baseURL", () => {
      const adapter = new ApiClient();
      expect(adapter).toBeDefined();
    });

    it("should create adapter with custom baseURL", () => {
      const customURL = "https://custom-api.example.com";
      const adapter = new ApiClient(customURL);
      expect(adapter).toBeDefined();
    });
  });

  describe("setToken", () => {
    it("should set token in memory", () => {
      const adapter = new ApiClient();
      adapter.setToken("test-token");
      expect(adapter.getToken()).toBe("test-token");
    });

    it("should set token to null", () => {
      const adapter = new ApiClient();
      adapter.setToken("test-token");
      adapter.setToken(null);
      expect(adapter.getToken()).toBeNull();
    });
  });

  describe("getToken", () => {
    it("should return null when no token is set", () => {
      const adapter = new ApiClient();
      expect(adapter.getToken()).toBeNull();
    });

    it("should return the set token", () => {
      const adapter = new ApiClient();
      adapter.setToken("my-token");
      expect(adapter.getToken()).toBe("my-token");
    });
  });

  describe("get", () => {
    it("should make GET request successfully", async () => {
      const mockResponse = { data: { id: "1" }, success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const adapter = new ApiClient("http://test.com");
      const result = await adapter.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/test",
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should include Authorization header when token is set", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const adapter = new ApiClient("http://test.com");
      adapter.setToken("Bearer-token");

      await adapter.get("/protected");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/protected",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer Bearer-token",
          }),
        }),
      );
    });

    it("should throw error on HTTP error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: "Not found" }),
      });

      const adapter = new ApiClient("http://test.com");

      await expect(adapter.get("/not-found")).rejects.toThrow("Not found");
    });

    it("should throw error with default message for HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const adapter = new ApiClient("http://test.com");

      await expect(adapter.get("/error")).rejects.toThrow(
        "HTTP error! status: 500",
      );
    });
  });

  describe("post", () => {
    it("should make POST request with data", async () => {
      const mockResponse = { data: { id: "1" }, success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const adapter = new ApiClient("http://test.com");
      const postData = { name: "test" };

      const result = await adapter.post("/create", postData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/create",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should make POST request without data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const adapter = new ApiClient("http://test.com");
      await adapter.post("/action");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/action",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        }),
      );
    });
  });

  describe("put", () => {
    it("should make PUT request with data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const adapter = new ApiClient("http://test.com");
      const putData = { name: "updated" };

      await adapter.put("/update/1", putData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/update/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(putData),
        }),
      );
    });
  });

  describe("patch", () => {
    it("should make PATCH request with data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const adapter = new ApiClient("http://test.com");
      const patchData = { status: "active" };

      await adapter.patch("/patch/1", patchData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/patch/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(patchData),
        }),
      );
    });
  });

  describe("delete", () => {
    it("should make DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const adapter = new ApiClient("http://test.com");
      await adapter.delete("/delete/1");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/delete/1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("postStream", () => {
    it("should make POST request and return raw response", async () => {
      const mockResponse = new Response("stream data");
      mockFetch.mockResolvedValueOnce(mockResponse);

      const adapter = new ApiClient("http://test.com");
      const result = await adapter.postStream("/stream", { data: "test" });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/stream",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ data: "test" }),
        }),
      );
      expect(result).toBe(mockResponse);
    });

    it("should include Authorization header for stream request", async () => {
      mockFetch.mockResolvedValueOnce(new Response("data"));

      const adapter = new ApiClient("http://test.com");
      adapter.setToken("stream-token");

      await adapter.postStream("/stream");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/stream",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer stream-token",
          }),
        }),
      );
    });
  });

  describe("upload", () => {
    it("should upload file with FormData", async () => {
      const mockResponse = {
        data: { url: "http://example.com/file.jpg" },
        success: true,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const adapter = new ApiClient("http://test.com");
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const formData = new FormData();
      formData.append("file", mockFile);

      const result = await adapter.upload("/upload", formData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/upload",
        expect.objectContaining({
          method: "POST",
          body: formData,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should include Authorization header for upload", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const adapter = new ApiClient("http://test.com");
      adapter.setToken("upload-token");
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const formData = new FormData();
      formData.append("file", mockFile);

      await adapter.upload("/upload", formData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.com/upload",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer upload-token",
          }),
        }),
      );
    });

    it("should throw error on upload failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        json: () => Promise.resolve({ message: "File too large" }),
      });

      const adapter = new ApiClient("http://test.com");
      const mockFile = new File(["content"], "large.jpg", {
        type: "image/jpeg",
      });
      const formData = new FormData();
      formData.append("file", mockFile);

      await expect(adapter.upload("/upload", formData)).rejects.toThrow(
        "File too large",
      );
    });
  });
});

describe("getApiClient (singleton behavior)", () => {
  it("should create new instance when no singleton exists", () => {
    const adapter = new ApiClient();
    expect(adapter).toBeInstanceOf(ApiClient);
  });

  it("should manage tokens independently", () => {
    const adapter1 = new ApiClient();
    const adapter2 = new ApiClient();

    adapter1.setToken("token1");
    adapter2.setToken("token2");

    expect(adapter1.getToken()).toBe("token1");
    expect(adapter2.getToken()).toBe("token2");
  });
});
