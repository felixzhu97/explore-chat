import { IApiClient } from "../../../domain/interfaces/adapters/api-client.interface";
import type { ApiResponse } from "@/domain/dto/api-response.dto";

export interface AiChatMessage {
  role: string;
  content: string;
}

export interface AiChatResponse {
  content: string;
}

export class AiApiAdapter {
  constructor(private apiClient: IApiClient) {}

  async postChat(
    messages: AiChatMessage[],
    model?: string
  ): Promise<ApiResponse<AiChatResponse>> {
    return this.apiClient.post<AiChatResponse>("/ai/chat", {
      messages,
      ...(model != null && { model }),
    });
  }

  async postChatStream(
    messages: AiChatMessage[],
    onChunk: (text: string) => void,
    model?: string
  ): Promise<void> {
    const res = await this.apiClient.postStream("/ai/chat/stream", {
      messages,
      ...(model != null && { model }),
    });
    if (!res.ok) throw new Error(`Stream error: ${res.status}`);
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No body");
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.slice(6)) as { text?: string };
              if (typeof payload.text === "string") onChunk(payload.text);
            } catch {
              //
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
