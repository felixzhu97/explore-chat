import { BadRequestException, Injectable } from "@nestjs/common";
import { MinioService } from "@/core/storage/minio.service";
import { ConfigService } from "@/core/config/config.service";

export interface UploadMediaResult {
  key: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
}

@Injectable()
export class MediaService {
  constructor(private readonly minioService: MinioService) {}

  private resolveMimeType(file: Express.Multer.File): string {
    const raw = (file.mimetype || "").toLowerCase();
    if (raw && raw !== "application/octet-stream") {
      return raw;
    }
    const name = (file.originalname || "").toLowerCase();
    if (name.endsWith(".heic")) return "image/heic";
    if (name.endsWith(".heif")) return "image/heif";
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
    if (name.endsWith(".png")) return "image/png";
    if (name.endsWith(".gif")) return "image/gif";
    if (name.endsWith(".webp")) return "image/webp";
    if (name.endsWith(".mov")) return "video/quicktime";
    if (name.endsWith(".mp4")) return "video/mp4";
    if (name.endsWith(".webm")) return "video/webm";
    return raw;
  }

  async uploadMedia(
    file: Express.Multer.File,
    folder = "posts",
  ): Promise<UploadMediaResult> {
    const config = ConfigService.loadConfig();
    const resolvedMimeType = this.resolveMimeType(file);
    if (!config.storage.local.allowedMimeTypes.includes(resolvedMimeType)) {
      throw new BadRequestException("Unsupported file type");
    }
    if (file.size > config.storage.local.maxFileSize) {
      throw new BadRequestException("File size exceeds limit");
    }
    file.mimetype = resolvedMimeType;
    const stored = await this.minioService.uploadFile(file, folder);
    return {
      key: stored.key,
      url: stored.url,
      mimeType: stored.mimeType,
      size: stored.size,
      width: null,
      height: null,
      duration: null,
    };
  }
}
