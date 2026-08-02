import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/core/database/prisma.service";

export interface AdPacingContext {
  accountId: string;
  campaignId: string;
  groupId: string;
  now?: Date;
}

@Injectable()
export class AdPacingService {
  constructor(private readonly prisma: PrismaService) {}

  async canDeliver(context: AdPacingContext): Promise<boolean> {
    const now = context.now ?? new Date();
    const startOfDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
      ),
    );
    const spentToday = await (this.prisma as any).adSpend.aggregate({
      _sum: {
        costCents: true,
      },
      where: {
        campaignId: context.campaignId,
        createdAt: {
          gte: startOfDay,
          lte: now,
        },
      },
    });
    const campaign = await (this.prisma as any).adCampaign.findUnique({
      where: {
        id: context.campaignId,
      },
      select: {
        dailyBudgetCents: true,
        totalBudgetCents: true,
      },
    });
    const dailyBudget = campaign?.dailyBudgetCents ?? null;
    const totalBudget = campaign?.totalBudgetCents ?? null;
    const spent = spentToday._sum.costCents ?? 0;
    if (dailyBudget != null && spent >= dailyBudget) {
      return false;
    }
    if (totalBudget != null) {
      const totalSpent = await (this.prisma as any).adSpend.aggregate({
        _sum: {
          costCents: true,
        },
        where: {
          campaignId: context.campaignId,
        },
      });
      const total = totalSpent._sum.costCents ?? 0;
      if (total >= totalBudget) {
        return false;
      }
    }
    return true;
  }
}
