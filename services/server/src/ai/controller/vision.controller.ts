import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { VisionClientService } from "@/ai/service/vision-client.service";
import { ConfigService } from "@/core/config/config.service";

@ApiTags("Vision")
@Controller("vision")
export class VisionController {
  constructor(private readonly visionClient: VisionClientService) {}

  @Post("suggest-tags")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Suggest tags from image" })
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        imageUrl: { type: "string" },
      },
    },
  })
  async suggestTags(
    @Body("imageUrl") imageUrl?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const config = ConfigService.loadConfig();
    if (!config.vision.enabled || !config.vision.serviceUrl) {
      return { labels: [] };
    }
    if (file?.buffer) {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([file.buffer], { type: file.mimetype }),
        file.originalname || "image",
      );
      const url = `${config.vision.serviceUrl}/predict`;
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        config.vision.timeoutMs,
      );
      try {
        const res = await fetch(url, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) return { labels: [] };
        const data = (await res.json()) as { labels?: string[] };
        return { labels: Array.isArray(data.labels) ? data.labels : [] };
      } catch {
        clearTimeout(timeout);
        return { labels: [] };
      }
    }
    if (imageUrl) {
      const labels = await this.visionClient.predictFromUrl(imageUrl);
      return { labels };
    }
    return { labels: [] };
  }
}
