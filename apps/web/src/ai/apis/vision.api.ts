import type { ApiClient } from "@/auth/api-client";

export interface SuggestTagsResponse {
  labels: string[];
}

export class VisionApi {
  constructor(private readonly apiClient: ApiClient) {}

  async suggestTags(file: File): Promise<SuggestTagsResponse> {
    const formData = new FormData();
    formData.append("file", file, file.name || "image");
    const res = await this.apiClient.upload<
      SuggestTagsResponse | { data?: { labels?: string[] } }
    >("/vision/suggest-tags", formData);
    const raw = res as { data?: { labels?: string[] }; labels?: string[] };
    const labels = Array.isArray(raw?.data?.labels)
      ? raw.data.labels
      : Array.isArray(raw?.labels)
        ? raw.labels
        : [];
    return { labels };
  }
}
