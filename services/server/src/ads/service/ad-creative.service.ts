import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";

@Injectable()
export class AdCreativeService {
  constructor(private readonly prisma: PrismaService) {}

  async getCreativeById(id: string) {
    return (this.prisma as any).adCreative.findUnique({
      where: { id },
    }) as Promise<{
      id: string;
      campaignId: string;
      groupId: string | null;
      type: string;
      title: string | null;
      body: string | null;
      mediaUrl: string | null;
      thumbnailUrl: string | null;
      landingUrl: string | null;
      language: string | null;
    } | null>;
  }
}
