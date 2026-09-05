import { Injectable } from "@nestjs/common";
import { ConfigService } from "@/core/config/config.service";

export interface RankRequest {
  userId: string;
  candidateIds: string[];
  limit?: number;
  region?: string;
  language?: string;
  experimentId?: string;
  variantId?: string;
}

export interface RankedItem {
  id: string;
  score: number;
}

export interface RankResponse {
  items: RankedItem[];
}

@Injectable()
export class RecommendationService {
  private readonly baseUrl: string;

  constructor() {
    const cfg = ConfigService.loadConfig().recommendation;
    this.baseUrl = cfg.apiBaseUrl.replace(/\/$/, "");
  }

  async rankFeed(input: RankRequest): Promise<RankResponse> {
    const url = `${this.baseUrl}/v1/feed/rank`;
    return this.postRank(url, input);
  }

  async rankExplore(input: RankRequest): Promise<RankResponse> {
    const url = `${this.baseUrl}/v1/explore/rank`;
    return this.postRank(url, input);
  }

  async rankReels(input: RankRequest): Promise<RankResponse> {
    const url = `${this.baseUrl}/v1/reels/rank`;
    return this.postRank(url, input);
  }

  private async postRank(
    url: string,
    input: RankRequest,
  ): Promise<RankResponse> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        console.error(
          "Recommendation request failed",
          response.status,
          response.statusText,
        );
        return { items: [] };
      }
      const data = (await response.json()) as RankResponse;
      if (!data.items) {
        return { items: [] };
      }
      return data;
    } catch (error) {
      console.error("Recommendation request error", error);
      return { items: [] };
    }
  }
}
