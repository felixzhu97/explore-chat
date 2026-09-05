import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { createClient } from "@/lib/image-generation";
import { ConfigService } from "@/core/config/config.service";
import { AiService } from "./ai.service";

const PROMPT_REFINE_SYSTEM = `Output only the refined image prompt in English. No explanation. Keep it concise and suitable for image generation.`;

export interface ImageGenerateInput {
  prompt: string;
  negativePrompt?: string;
}

export interface ImageGenerateResult {
  jobId: string;
}

export interface ImageJobStatusResult {
  status: "pending" | "succeeded" | "failed";
  imageUrl?: string;
  error?: string;
}

@Injectable()
export class ImageService {
  private imageClient: ReturnType<typeof createClient> | null = null;

  constructor(private readonly aiService: AiService) {}

  private async refinePrompt(text: string): Promise<string> {
    try {
      const res = await this.aiService.chat({
        messages: [
          { role: "system", content: PROMPT_REFINE_SYSTEM },
          { role: "user", content: text },
        ],
      });
      const out = res.content?.trim();
      return out && out.length > 0 ? out : text;
    } catch {
      return text;
    }
  }

  private getClient() {
    if (this.imageClient) return this.imageClient;
    const cfg = ConfigService.loadConfig().image;
    if (cfg.imageApiBaseUrl) {
      this.imageClient = createClient({ imageApiBaseUrl: cfg.imageApiBaseUrl });
      return this.imageClient;
    }
    if (cfg.replicateApiToken) {
      this.imageClient = createClient({
        replicateApiToken: cfg.replicateApiToken,
      });
      return this.imageClient;
    }
    throw new BadRequestException(
      "图片生成未配置。请在 services/server/.env 中设置 REPLICATE_API_TOKEN 或 IMAGE_GENERATION_API_URL",
    );
  }

  async generate(input: ImageGenerateInput): Promise<ImageGenerateResult> {
    const prompt = await this.refinePrompt(input.prompt);
    const negativePrompt =
      input.negativePrompt != null && input.negativePrompt.trim() !== ""
        ? await this.refinePrompt(input.negativePrompt)
        : undefined;
    const client = this.getClient();
    try {
      return await client.generate({
        prompt,
        ...(negativePrompt != null && { negativePrompt }),
      });
    } catch (err: unknown) {
      const msg =
        (err as { message?: string; cause?: { code?: string } })?.message ?? "";
      const code = (err as { cause?: { code?: string } })?.cause?.code;
      if (msg.includes("Insufficient credit")) {
        throw new HttpException(
          "Replicate 余额不足",
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      if (msg.includes("fetch failed") || code === "ECONNREFUSED") {
        throw new HttpException(
          "图片生成服务未启动或未配置 IMAGE_GENERATION_API_URL / REPLICATE_API_TOKEN",
          HttpStatus.BAD_GATEWAY,
        );
      }
      throw new HttpException(msg || "图片生成失败", HttpStatus.BAD_GATEWAY);
    }
  }

  async getResult(jobId: string): Promise<ImageJobStatusResult> {
    const client = this.getClient();
    try {
      return await client.getResult(jobId);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";
      if (msg.includes("fetch failed")) {
        throw new HttpException("图片生成服务未就绪", HttpStatus.BAD_GATEWAY);
      }
      throw new HttpException(msg || "查询失败", HttpStatus.BAD_GATEWAY);
    }
  }
}
