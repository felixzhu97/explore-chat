import { Injectable } from "@nestjs/common";
import { ConfigService } from "@/core/config/config.service";

export interface ModerateResult {
  safe: boolean;
  categories: { label: string; score: number }[];
}

@Injectable()
export class VisionClientService {
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor() {
    this.config = ConfigService.loadConfig();
  }

  async predictFromUrl(imageUrl: string): Promise<string[]> {
    if (!this.config.vision.enabled || !this.config.vision.serviceUrl) {
      return [];
    }
    const url = `${this.config.vision.serviceUrl}/predict`;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.vision.timeoutMs,
    );
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        return [];
      }
      const data = (await res.json()) as { labels?: string[] };
      return Array.isArray(data.labels) ? data.labels : [];
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }

  async predictFromBuffer(
    imageBuffer: Buffer,
    mimeType = "image/jpeg",
  ): Promise<string[]> {
    if (
      !this.config.vision.enabled ||
      !this.config.vision.serviceUrl ||
      !imageBuffer?.length
    ) {
      return [];
    }
    const endpoint = `${this.config.vision.serviceUrl}/predict`;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.vision.timeoutMs,
    );
    try {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([imageBuffer], { type: mimeType }),
        "image.jpg",
      );
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        return [];
      }
      const data = (await res.json()) as { labels?: string[] };
      return Array.isArray(data.labels) ? data.labels : [];
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }

  async moderateFromUrl(imageUrl: string): Promise<ModerateResult> {
    if (
      !this.config.vision.enabled ||
      !this.config.vision.serviceUrl ||
      !this.config.vision.moderationEnabled
    ) {
      return { safe: true, categories: [] };
    }
    const url = `${this.config.vision.serviceUrl}/moderate`;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.vision.timeoutMs,
    );
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok)
        return { safe: false, categories: [{ label: "error", score: 0 }] };
      const data = (await res.json()) as {
        safe?: boolean;
        categories?: { label: string; score: number }[];
      };
      const safe = data.safe !== false;
      const categories = Array.isArray(data.categories) ? data.categories : [];
      return { safe, categories };
    } catch {
      clearTimeout(timeout);
      return { safe: false, categories: [{ label: "error", score: 0 }] };
    }
  }

  async moderateFromBuffer(
    imageBuffer: Buffer,
    mimeType = "image/jpeg",
  ): Promise<ModerateResult> {
    if (
      !this.config.vision.enabled ||
      !this.config.vision.serviceUrl ||
      !this.config.vision.moderationEnabled ||
      !imageBuffer?.length
    ) {
      return { safe: true, categories: [] };
    }
    const endpoint = `${this.config.vision.serviceUrl}/moderate`;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.vision.timeoutMs,
    );
    try {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([imageBuffer], { type: mimeType }),
        "image.jpg",
      );
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok)
        return { safe: false, categories: [{ label: "error", score: 0 }] };
      const data = (await res.json()) as {
        safe?: boolean;
        categories?: { label: string; score: number }[];
      };
      const safe = data.safe !== false;
      const categories = Array.isArray(data.categories) ? data.categories : [];
      return { safe, categories };
    } catch {
      clearTimeout(timeout);
      return { safe: false, categories: [{ label: "error", score: 0 }] };
    }
  }

  async moderateVideoFromUrl(videoUrl: string): Promise<ModerateResult> {
    if (
      !this.config.vision.enabled ||
      !this.config.vision.serviceUrl ||
      !this.config.vision.moderationEnabled
    ) {
      return { safe: true, categories: [] };
    }
    const endpoint = `${this.config.vision.serviceUrl}/moderate-video`;
    const controller = new AbortController();
    const timeoutMs = this.config.vision.timeoutMs * 3;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok)
        return { safe: false, categories: [{ label: "error", score: 0 }] };
      const data = (await res.json()) as {
        safe?: boolean;
        categories?: { label: string; score: number }[];
      };
      const safe = data.safe !== false;
      const categories = Array.isArray(data.categories) ? data.categories : [];
      return { safe, categories };
    } catch {
      clearTimeout(timeout);
      return { safe: false, categories: [{ label: "error", score: 0 }] };
    }
  }
}
