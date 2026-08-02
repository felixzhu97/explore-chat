import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileApi } from "@/ai/apis/file.api";
import type { ApiClient } from "@/core/api-client";
import type { ApiResponse } from "@/core/api-response.model";

describe("FileApi", () => {
  let adapter: FileApi;
  let mockApiClient: ApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      upload: vi.fn(),
      postStream: vi.fn(),
      setToken: vi.fn(),
      getToken: vi.fn(),
    } as unknown as ApiClient;
    adapter = new FileApi(mockApiClient);
  });

  describe("uploadFile", () => {
    it("should upload avatar file", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { url: "http://example.com/avatar.jpg" },
      };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["avatar"], "avatar.jpg", {
        type: "image/jpeg",
      });
      const result = await adapter.uploadFile(mockFile, "avatar");

      expect(mockApiClient.upload).toHaveBeenCalledWith(
        "/media/upload",
        expect.any(FormData),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should upload message file", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { url: "http://example.com/file.pdf" },
      };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["content"], "document.pdf", {
        type: "application/pdf",
      });
      const result = await adapter.uploadFile(mockFile, "message");

      expect(mockApiClient.upload).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should upload status file", async () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { url: "http://example.com/status.jpg" },
      };
      (mockApiClient.upload as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const mockFile = new File(["status"], "status.jpg", {
        type: "image/jpeg",
      });
      const result = await adapter.uploadFile(mockFile, "status");

      expect(mockApiClient.upload).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteFile", () => {
    it("should delete a file by ID", async () => {
      const mockResponse: ApiResponse = { success: true };
      (mockApiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.deleteFile("file-123");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/files/file-123");
      expect(result).toEqual(mockResponse);
    });

    it("should return error response for non-existent file", async () => {
      const mockResponse: ApiResponse = {
        success: false,
        error: "File not found",
      };
      (mockApiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await adapter.deleteFile("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("File not found");
    });
  });
});
