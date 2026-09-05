import { Controller, Post, Body, UseGuards, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { AiService } from "@/ai/application/ai.service";
import type { Response } from "express";

@ApiTags("AI")
@Controller("ai")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("chat")
  @ApiOperation({ summary: "AI 对话" })
  async chat(
    @Body()
    body: {
      messages: { role: string; content: string }[];
      model?: string;
    },
  ) {
    const result = await this.aiService.chat({
      messages: body.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      ...(body.model != null && { model: body.model }),
    });
    return { success: true, data: result };
  }

  @Post("chat/stream")
  @ApiOperation({ summary: "AI 对话流式" })
  async chatStream(
    @Body()
    body: { messages: { role: string; content: string }[]; model?: string },
    @Res({ passthrough: false }) res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const stream = this.aiService.chatStream({
      messages: body.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      ...(body.model != null && { model: body.model }),
    });
    try {
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        if (typeof (res as any).flush === "function") (res as any).flush();
      }
    } finally {
      res.end();
    }
  }
}
