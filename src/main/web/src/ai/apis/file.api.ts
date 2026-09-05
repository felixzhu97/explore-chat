import type { ApiClient } from "@/auth/api-client";

export class FileApi {
  constructor(private apiClient: ApiClient) {}

  async uploadFile(
    file: File,
    type: "avatar" | "message" | "status",
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", type === "avatar" ? "avatars" : type);
    return this.apiClient.upload("/media/upload", formData);
  }

  async deleteFile(fileId: string): Promise<void> {
    return this.apiClient.delete(`/files/${fileId}`);
  }
}
