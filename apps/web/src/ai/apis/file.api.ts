import type { ApiClient } from "@/auth/api-client";
import type { ApiResponse } from "@/auth/api-response.model";

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
