import type { ApiClient } from "@/auth/api-client";
import type { ApiResponse } from "@/auth/api-client";

export interface ImageGenerateResponse {
  jobId: string;
}

export interface ImageResultResponse {
  status: "pending" | "succeeded" | "failed";
  imageUrl?: string;
  error?: string;
}

export class ImageApi {
  constructor(private apiClient: ApiClient) {}

  async generate(
    prompt: string,
    negativePrompt?: string,
  ): Promise<ApiResponse<ImageGenerateResponse>> {
    return this.apiClient.post<ImageGenerateResponse>("/image/generate", {
      prompt,
      ...(negativePrompt != null && { negativePrompt }),
    });
  }

  async getResult(jobId: string): Promise<ApiResponse<ImageResultResponse>> {
    return this.apiClient.get<ImageResultResponse>(`/image/generate/${jobId}`);
  }
}
