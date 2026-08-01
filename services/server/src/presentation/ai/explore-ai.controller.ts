import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { ExploreAiClientService } from "@/application/services/explore-ai-client.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

const CHAT_RATE_LIMIT_MAX = 20;
const CHAT_RATE_LIMIT_WINDOW_MS = 60_000;
const chatRateLimitByUser = new Map<string, number[]>();

function checkChatRateLimit(userId: string): boolean {
  const now = Date.now();
  const recent = (chatRateLimitByUser.get(userId) ?? []).filter(
    (ts) => now - ts < CHAT_RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= CHAT_RATE_LIMIT_MAX) {
    chatRateLimitByUser.set(userId, recent);
    return false;
  }
  recent.push(now);
  chatRateLimitByUser.set(userId, recent);
  return true;
}

function writeNormalizedSseLine(line: string, res: Response): void {
  // explore-ai may emit `data:{...}` (no space) or `data: {...}`
  if (!line.startsWith("data:")) return;
  const payload = line.slice(5).trimStart().trimEnd();
  if (!payload) return;

  if (payload === "[DONE]") {
    res.write("data: [DONE]\n\n");
    return;
  }

  try {
    const parsed = JSON.parse(payload) as {
      type?: string;
      token?: string;
      error?: string;
    };

    if (parsed.type === "message" && typeof parsed.token === "string") {
      res.write(`data: ${JSON.stringify({ text: parsed.token })}\n\n`);
    } else if (typeof parsed.error === "string") {
      res.write(`data: ${JSON.stringify({ error: parsed.error })}\n\n`);
    }
  } catch {
    res.write(`data: ${payload}\n\n`);
  }
}

async function pipeNormalizedSse(upstream: globalThis.Response, res: Response): Promise<void> {
  const reader = upstream.body?.getReader();
  if (!reader) {
    res.end();
    return;
  }

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
        writeNormalizedSseLine(line.replace(/\r$/, ""), res);
      }

      if (typeof (res as Response & { flush?: () => void }).flush === "function") {
        (res as Response & { flush?: () => void }).flush!();
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      writeNormalizedSseLine(buffer.replace(/\r$/, ""), res);
    }
  } finally {
    reader.releaseLock();
    res.end();
  }
}

@ApiTags("AI")
@Controller("ai/explore")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExploreAiController {
  constructor(private readonly exploreAiClient: ExploreAiClientService) {}

  @Post("chat/stream")
  @ApiOperation({ summary: "Explore AI 流式对话（BFF 代理）" })
  async chatStream(
    @CurrentUser() user: { id: string },
    @Body()
    body: {
      messages: { role: string; content: string }[];
      provider?: string;
      model?: string;
      sessionId?: string;
      toolsEnabled?: boolean;
    },
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    if (!checkChatRateLimit(user.id)) {
      throw new HttpException(
        "Too many chat requests. Please try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const upstream = await this.exploreAiClient.streamChat(user.id, {
      messages: body.messages,
      ...(body.provider != null && { provider: body.provider }),
      ...(body.model != null && { model: body.model }),
      ...(body.sessionId != null && { sessionId: body.sessionId }),
      ...(body.toolsEnabled != null && { toolsEnabled: body.toolsEnabled }),
    });

    await pipeNormalizedSse(upstream, res);
  }

  @Get("providers")
  @ApiOperation({ summary: "Explore AI 提供商列表" })
  async listProviders(@CurrentUser() user: { id: string }) {
    const data = await this.exploreAiClient.listProviders(user.id);
    return { success: true, data };
  }

  @Get("models")
  @ApiOperation({ summary: "Explore AI 模型列表" })
  async listModels(
    @CurrentUser() user: { id: string },
    @Query("provider") provider?: string,
  ) {
    const data = await this.exploreAiClient.listModels(user.id, provider);
    return { success: true, data };
  }

  @Post("sessions")
  @ApiOperation({ summary: "创建 Explore AI 会话" })
  async createSession(
    @CurrentUser() user: { id: string },
    @Body() body: { title?: string },
  ) {
    const data = await this.exploreAiClient.createSession(user.id, body);
    return { success: true, data };
  }

  @Get("sessions")
  @ApiOperation({ summary: "Explore AI 会话列表" })
  async listSessions(@CurrentUser() user: { id: string }) {
    const data = await this.exploreAiClient.listSessions(user.id);
    return { success: true, data };
  }

  @Get("sessions/:id")
  @ApiOperation({ summary: "Explore AI 会话详情" })
  async getSession(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
  ) {
    const data = await this.exploreAiClient.getSession(user.id, sessionId);
    return { success: true, data };
  }

  @Get("sessions/:id/messages")
  @ApiOperation({ summary: "Explore AI 会话消息" })
  async getMessages(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
  ) {
    const data = await this.exploreAiClient.getMessages(user.id, sessionId);
    return { success: true, data };
  }

  @Delete("sessions/:id")
  @ApiOperation({ summary: "删除 Explore AI 会话" })
  async deleteSession(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
  ) {
    await this.exploreAiClient.deleteSession(user.id, sessionId);
    return { success: true };
  }
}
