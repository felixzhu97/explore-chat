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
    await this.consumeTextSse(res, onChunk);
  }

  async postExploreChatStream(
    messages: AiChatMessage[],
    onChunk: (text: string) => void,
    opts?: { model?: string; provider?: string; sessionId?: string }
  ): Promise<void> {
    const res = await this.apiClient.postStream("/ai/explore/chat/stream", {
      messages,
      ...(opts?.model != null && { model: opts.model }),
      ...(opts?.provider != null && { provider: opts.provider }),
      ...(opts?.sessionId != null && { sessionId: opts.sessionId }),
    });
    await this.consumeTextSse(res, onChunk);
  }

  private async consumeTextSse(res: Response, onChunk: (text: string) => void): Promise<void> {
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
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6)) as { text?: string; error?: string };
            if (typeof payload.error === "string") throw new Error(payload.error);
            if (typeof payload.text === "string") onChunk(payload.text);
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
