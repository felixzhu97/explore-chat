import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { createHash, randomUUID } from "crypto";
import get from "lodash/get";
import { ConfigService } from "@/core/config/config.service";

export interface ExploreAiChatMessage {
  role: string;
  content: string;
}

export interface ExploreAiStreamChatBody {
  messages: ExploreAiChatMessage[];
  provider?: string;
  model?: string;
  sessionId?: string;
  toolsEnabled?: boolean;
}

export interface ExploreAiCreateSessionBody {
  title?: string;
}

/** Map whatsfeed userId to a stable UUID for explore-ai X-Client-Id. */
export function userIdToClientId(userId: string): string {
  const hash = createHash("sha256").update(userId).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join("-");
}

@Injectable()
export class ExploreAiClientService {
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor() {
    this.config = ConfigService.loadConfig();
  }

  buildHeaders(userId: string): Record<string, string> {
    this.assertAvailable();
    return {
      "X-Service-Key": this.config.exploreAi.serviceKey,
      "X-Client-Id": userIdToClientId(userId),
      "X-Request-Id": randomUUID(),
      // explore-ai CsrfProtectionFilter requires this on state-changing /api/* calls
      "X-Requested-With": "XMLHttpRequest",
    };
  }

  assertAvailable(): void {
    const { enabled, serviceKey } = this.config.exploreAi;
    if (!enabled || !serviceKey) {
      throw new ServiceUnavailableException(
        "Explore AI is not configured. Set EXPLORE_AI_ENABLED=true and EXPLORE_AI_SERVICE_KEY.",
      );
    }
  }

  async streamChat(
    userId: string,
    body: ExploreAiStreamChatBody,
  ): Promise<Response> {
    this.assertAvailable();
    const url = `${this.config.exploreAi.baseUrl}/api/text/chat/stream`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...this.buildHeaders(userId),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new ServiceUnavailableException(
        `Explore AI stream failed (${res.status})${detail ? `: ${detail}` : ""}`,
      );
    }
    return res;
  }

  async listProviders(userId: string): Promise<unknown> {
    return this.requestJson(userId, "/api/text/providers", { method: "GET" });
  }

  async listModels(userId: string, provider?: string): Promise<unknown> {
    const query = provider ? `?provider=${encodeURIComponent(provider)}` : "";
    return this.requestJson(userId, `/api/text/models${query}`, {
      method: "GET",
    });
  }

  async createSession(
    userId: string,
    body: ExploreAiCreateSessionBody,
  ): Promise<unknown> {
    return this.requestJson(userId, "/api/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async listSessions(userId: string): Promise<unknown> {
    return this.requestJson(userId, "/api/sessions", { method: "GET" });
  }

  async getSession(userId: string, sessionId: string): Promise<unknown> {
    return this.requestJson(
      userId,
      `/api/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: "GET",
      },
    );
  }

  async getMessages(userId: string, sessionId: string): Promise<unknown> {
    return this.requestJson(
      userId,
      `/api/sessions/${encodeURIComponent(sessionId)}/messages`,
      {
        method: "GET",
      },
    );
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    await this.requestJson(
      userId,
      `/api/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: "DELETE",
      },
    );
  }

  private async requestJson(
    userId: string,
    path: string,
    init: RequestInit,
  ): Promise<unknown> {
    this.assertAvailable();
    const url = `${this.config.exploreAi.baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.exploreAi.timeoutMs,
    );
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...this.buildHeaders(userId),
          ...(init.headers as Record<string, string> | undefined),
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new ServiceUnavailableException(
          `Explore AI request failed (${res.status})${detail ? `: ${detail}` : ""}`,
        );
      }
      if (res.status === 204) {
        return undefined;
      }
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        return undefined;
      }
      return await res.json();
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      const message = get(error, "message", "Explore AI request failed");
      throw new ServiceUnavailableException(String(message));
    }
  }
}
