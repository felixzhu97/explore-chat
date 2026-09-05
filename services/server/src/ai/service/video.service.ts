import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { createClient } from "@/lib/video-generation";
import { ConfigService } from "@/core/config/config.service";

export interface VideoGenerateInput {
  prompt: string;
  imageUrl?: string;
}

export interface VideoGenerateResult {
  jobId: string;
}

export interface VideoJobStatusResult {
  status: "pending" | "succeeded" | "failed";
  videoUrl?: string;
  error?: string;
}

@Injectable()
export class VideoService {
  private videoClient: ReturnType<typeof createClient> | null = null;

  private getClient() {
    if (this.videoClient) return this.videoClient;
    const cfg = ConfigService.loadConfig().video;
    if (cfg.videoApiBaseUrl) {
      this.videoClient = createClient({ videoApiBaseUrl: cfg.videoApiBaseUrl });
      return this.videoClient;
    }
    if (cfg.replicateApiToken) {
      this.videoClient = createClient({
        replicateApiToken: cfg.replicateApiToken,
      });
      return this.videoClient;
    }
    throw new BadRequestException("Video generation not configured");
  }

  async generate(input: VideoGenerateInput): Promise<VideoGenerateResult> {
    const client = this.getClient();
    try {
      return await client.generate({
        prompt: input.prompt,
        ...(input.imageUrl != null && { imageUrl: input.imageUrl }),
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
          "视频生成服务未启动，请先运行: cd apps/video-gen && pip install -r requirements.txt && python app.py",
          HttpStatus.BAD_GATEWAY,
        );
      }
      throw new HttpException(msg || "视频生成失败", HttpStatus.BAD_GATEWAY);
    }
  }

  async getResult(jobId: string): Promise<VideoJobStatusResult> {
    const client = this.getClient();
    try {
      return await client.getResult(jobId);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";
      if (msg.includes("fetch failed")) {
        throw new HttpException("视频生成服务未就绪", HttpStatus.BAD_GATEWAY);
      }
      throw new HttpException(msg || "查询失败", HttpStatus.BAD_GATEWAY);
    }
  }
}
