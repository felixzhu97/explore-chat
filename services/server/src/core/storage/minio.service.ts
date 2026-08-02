import { Injectable } from "@nestjs/common";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ConfigService } from "@/core/config/config.service";

export interface StoredMediaFile {
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class MinioService {
  async uploadFile(
    file: Express.Multer.File,
    folder = "posts",
  ): Promise<StoredMediaFile> {
    const config = ConfigService.loadConfig();
    const uploadRoot = path.resolve(
      process.cwd(),
      config.storage.local.uploadDir,
    );
    const ext = path.extname(file.originalname || "");
    const safeExt = ext.slice(0, 10);
    const key = `${folder}/${uuidv4()}${safeExt}`;
    const fullPath = path.join(uploadRoot, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file.buffer);
    const publicBaseUrl = config.storage.minio.publicBaseUrl.replace(/\/$/, "");
    const normalizedKey = key.split(path.sep).join("/");
    return {
      key: normalizedKey,
      url: `${publicBaseUrl}/${normalizedKey}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
