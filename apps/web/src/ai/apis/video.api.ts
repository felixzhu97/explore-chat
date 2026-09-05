import type { ApiClient } from "@/auth/api-client";

export interface VideoGenerateResponse {
  jobId: string;
}

export interface VideoResultResponse {
  status: "pending" | "succeeded" | "failed";
  videoUrl?: string;
  error?: string;
}

export class VideoApi {
  constructor(private apiClient: ApiClient) {}

  async generate(
    prompt: string,
    imageUrl?: string,
  ): Promise<VideoGenerateResponse> {
    return this.apiClient.post<VideoGenerateResponse>("/video/generate", {
      prompt,
      ...(imageUrl != null && { imageUrl }),
    });
  }

  async getResult(jobId: string): Promise<VideoResultResponse> {
    return this.apiClient.get<VideoResultResponse>(`/video/generate/${jobId}`);
  }
}
