import type { ApiClient } from "@/auth/api-client";

export interface SuggestTagsResponse {
  labels: string[];
}

export class VisionApi {
  constructor(private readonly apiClient: ApiClient) {}

  async suggestTags(file: File): Promise<SuggestTagsResponse> {
    const formData = new FormData();
    formData.append("file", file, file.name || "image");
    const res = await this.apiClient.upload<SuggestTagsResponse>(
      "/vision/suggest-tags",
      formData,
    );
    const labels = Array.isArray(res?.labels) ? res.labels : [];
    return { labels };
  }
}
