import type { ApiClient } from "@/core/api-client";
import type { ApiResponse } from "@/core/api-response.model";

export class FileApi {
  constructor(private apiClient: ApiClient) {}

  async uploadFile(
    file: File,
    type: "avatar" | "message" | "status",
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", type === "avatar" ? "avatars" : type);
    return this.apiClient.upload("/media/upload", formData);
  }

  async deleteFile(fileId: string): Promise<ApiResponse> {
    return this.apiClient.delete(`/files/${fileId}`);
  }
}
