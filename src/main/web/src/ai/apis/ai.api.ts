import type { ApiClient } from "@/auth/api-client";

export interface AiChatMessage {
  role: string;
  content: string;
}

export interface AiChatResponse {
  content: string;
}

export interface ExploreAgentSummary {
  type: string;
  name: string;
  description?: string;
  healthy?: boolean;
  tools?: string[];
}

export interface ExploreAgentInvokeResponse {
  type: string;
  message: string;
  reply: string;
}

export class AiApi {
  constructor(private apiClient: ApiClient) {}

  async postChat(
    messages: AiChatMessage[],
    model?: string,
  ): Promise<AiChatResponse> {
    return this.apiClient.post<AiChatResponse>("/ai/chat", {
      messages,
      ...(model != null && { model }),
    });
  }

  /** Lists Explore AI Gallery agents via Chat BFF. */
  async listExploreAgents(lang?: string): Promise<ExploreAgentSummary[]> {
    const query = lang != null && lang !== "" ? `?lang=${encodeURIComponent(lang)}` : "";
    return this.apiClient.get<ExploreAgentSummary[]>(`/ai/explore/agents${query}`);
  }

  /** Invokes one Explore AI Gallery agent via Chat BFF. */
  async invokeExploreAgent(
    agentType: string,
    message: string,
    lang?: string,
  ): Promise<ExploreAgentInvokeResponse> {
    const query = lang != null && lang !== "" ? `?lang=${encodeURIComponent(lang)}` : "";
    return this.apiClient.post<ExploreAgentInvokeResponse>(
      `/ai/explore/agents/${encodeURIComponent(agentType)}/invoke${query}`,
      { message },
    );
  }

  async postChatStream(
    messages: AiChatMessage[],
    onChunk: (text: string) => void,
    model?: string,
  ): Promise<void>;
  async postChatStream(
    messages: AiChatMessage[],
    onChunk: (text: string) => void,
    opts?: { model?: string; provider?: string; sessionId?: string },
  ): Promise<void>;
  async postChatStream(
    messages: AiChatMessage[],
    onChunk: (text: string) => void,
    modelOrOpts?: string | { model?: string; provider?: string; sessionId?: string },
  ): Promise<void> {
    if (typeof modelOrOpts === "object" && modelOrOpts !== null) {
      const res = await this.apiClient.postStream("/ai/explore/chat/stream", {
        messages,
        ...(modelOrOpts.model != null && { model: modelOrOpts.model }),
        ...(modelOrOpts.provider != null && { provider: modelOrOpts.provider }),
        ...(modelOrOpts.sessionId != null && {
          sessionId: modelOrOpts.sessionId,
        }),
      });
      await this.consumeTextSse(res, onChunk);
      return;
    }

    const res = await this.apiClient.postStream("/ai/chat/stream", {
      messages,
      ...(modelOrOpts != null && { model: modelOrOpts }),
    });
    await this.consumeTextSse(res, onChunk);
  }

  private async consumeTextSse(
    res: Response,
    onChunk: (text: string) => void,
  ): Promise<void> {
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
            const payload = JSON.parse(line.slice(6)) as {
              text?: string;
              error?: string;
            };
            if (typeof payload.error === "string")
              throw new Error(payload.error);
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
