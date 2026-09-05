import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { AdminGuard } from "@/admin/presentation/admin.guard";
import { PrismaService } from "@/core/database/prisma.service";
import {
  CreateAdAccountDto,
  UpdateAdAccountDto,
  CreateAdCampaignDto,
  UpdateAdCampaignDto,
  CreateAdGroupDto,
  UpdateAdGroupDto,
  CreateAdCreativeDto,
  UpdateAdCreativeDto,
} from "@/ads/application/ads.dto";

@ApiTags("Ads")
@Controller("ads")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("accounts")
  @ApiOperation({ summary: "列表广告账户" })
  async listAccounts(
    @Query("status") status?: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const where: Record<string, unknown> = {};
    if (status) where["status"] = status;
    const client = this.prisma as unknown as {
      adAccount?: {
        findMany: (args: unknown) => Promise<unknown[]>;
        count: (args: unknown) => Promise<number>;
      };
    };
    if (!client.adAccount) {
      return {
        success: true,
        data: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          hasMore: false,
        },
      };
    }
    const [items, total] = await Promise.all([
      client.adAccount.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      client.adAccount.count({ where }),
    ]);
    return {
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: pageNum * limitNum < total,
      },
    };
  }

  @Post("accounts")
  @ApiOperation({ summary: "创建广告账户" })
  async createAccount(@Body() body: CreateAdAccountDto) {
    const data = await (this.prisma as any).adAccount.create({
      data: {
        name: body.name,
        timezone: body.timezone ?? "UTC",
        currency: body.currency ?? "USD",
        status: body.status ?? "ACTIVE",
        dailyBudgetCents: body.dailyBudgetCents ?? null,
        totalBudgetCents: body.totalBudgetCents ?? null,
      },
    });
    return { success: true, data };
  }

  @Patch("accounts/:id")
  @ApiOperation({ summary: "更新广告账户" })
  async updateAccount(
    @Param("id") id: string,
    @Body() body: UpdateAdAccountDto,
  ) {
    const data = await (this.prisma as any).adAccount.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.timezone !== undefined && { timezone: body.timezone }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.dailyBudgetCents !== undefined && {
          dailyBudgetCents: body.dailyBudgetCents,
        }),
        ...(body.totalBudgetCents !== undefined && {
          totalBudgetCents: body.totalBudgetCents,
        }),
      },
    });
    return { success: true, data };
  }

  @Get("campaigns")
  @ApiOperation({ summary: "列表广告活动" })
  async listCampaigns(
    @Query("accountId") accountId?: string,
    @Query("status") status?: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const where: Record<string, unknown> = {};
    if (accountId) where["accountId"] = accountId;
    if (status) where["status"] = status;
    const client = this.prisma as unknown as {
      adCampaign?: {
        findMany: (args: unknown) => Promise<unknown[]>;
        count: (args: unknown) => Promise<number>;
      };
    };
    if (!client.adCampaign) {
      return {
        success: true,
        data: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          hasMore: false,
        },
      };
    }
    const [items, total] = await Promise.all([
      client.adCampaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      client.adCampaign.count({ where }),
    ]);
    return {
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: pageNum * limitNum < total,
      },
    };
  }

  @Post("campaigns")
  @ApiOperation({ summary: "创建广告活动" })
  async createCampaign(@Body() body: CreateAdCampaignDto) {
    const data = await (this.prisma as any).adCampaign.create({
      data: {
        accountId: body.accountId,
        name: body.name,
        objective: body.objective ?? "IMPRESSIONS",
        status: body.status ?? "ACTIVE",
        dailyBudgetCents: body.dailyBudgetCents ?? null,
        totalBudgetCents: body.totalBudgetCents ?? null,
        startAt: body.startAt ? new Date(body.startAt) : null,
        endAt: body.endAt ? new Date(body.endAt) : null,
      },
    });
    return { success: true, data };
  }

  @Patch("campaigns/:id")
  @ApiOperation({ summary: "更新广告活动" })
  async updateCampaign(
    @Param("id") id: string,
    @Body() body: UpdateAdCampaignDto,
  ) {
    const data = await (this.prisma as any).adCampaign.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.objective !== undefined && { objective: body.objective }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.dailyBudgetCents !== undefined && {
          dailyBudgetCents: body.dailyBudgetCents,
        }),
        ...(body.totalBudgetCents !== undefined && {
          totalBudgetCents: body.totalBudgetCents,
        }),
        ...(body.startAt !== undefined && {
          startAt: body.startAt ? new Date(body.startAt) : null,
        }),
        ...(body.endAt !== undefined && {
          endAt: body.endAt ? new Date(body.endAt) : null,
        }),
      },
    });
    return { success: true, data };
  }

  @Get("groups")
  @ApiOperation({ summary: "列表广告组" })
  async listGroups(
    @Query("campaignId") campaignId?: string,
    @Query("placement") placement?: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const where: Record<string, unknown> = {};
    if (campaignId) where["campaignId"] = campaignId;
    if (placement) where["placement"] = placement;
    const [items, total] = await Promise.all([
      (this.prisma as any).adGroup.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      (this.prisma as any).adGroup.count({ where }),
    ]);
    return {
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: pageNum * limitNum < total,
      },
    };
  }

  @Post("groups")
  @ApiOperation({ summary: "创建广告组" })
  async createGroup(@Body() body: CreateAdGroupDto) {
    const data = await (this.prisma as any).adGroup.create({
      data: {
        campaignId: body.campaignId,
        name: body.name,
        bidCents: body.bidCents,
        billingEvent: body.billingEvent,
        placement: body.placement,
        status: body.status ?? "ACTIVE",
        targeting: body.targeting ?? null,
        maxImpressionsPerUser: body.maxImpressionsPerUser ?? null,
        maxImpressionsPerUserPerDay: body.maxImpressionsPerUserPerDay ?? null,
      },
    });
    return { success: true, data };
  }

  @Patch("groups/:id")
  @ApiOperation({ summary: "更新广告组" })
  async updateGroup(@Param("id") id: string, @Body() body: UpdateAdGroupDto) {
    const data = await (this.prisma as any).adGroup.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.bidCents !== undefined && { bidCents: body.bidCents }),
        ...(body.billingEvent !== undefined && {
          billingEvent: body.billingEvent,
        }),
        ...(body.placement !== undefined && { placement: body.placement }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.targeting !== undefined && { targeting: body.targeting }),
        ...(body.maxImpressionsPerUser !== undefined && {
          maxImpressionsPerUser: body.maxImpressionsPerUser,
        }),
        ...(body.maxImpressionsPerUserPerDay !== undefined && {
          maxImpressionsPerUserPerDay: body.maxImpressionsPerUserPerDay,
        }),
      },
    });
    return { success: true, data };
  }

  @Get("creatives")
  @ApiOperation({ summary: "列表广告创意" })
  async listCreatives(
    @Query("campaignId") campaignId?: string,
    @Query("groupId") groupId?: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const where: Record<string, unknown> = {};
    if (campaignId) where["campaignId"] = campaignId;
    if (groupId) where["groupId"] = groupId;
    const [items, total] = await Promise.all([
      (this.prisma as any).adCreative.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      (this.prisma as any).adCreative.count({ where }),
    ]);
    return {
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: pageNum * limitNum < total,
      },
    };
  }

  @Post("creatives")
  @ApiOperation({ summary: "创建广告创意" })
  async createCreative(@Body() body: CreateAdCreativeDto) {
    const data = await (this.prisma as any).adCreative.create({
      data: {
        campaignId: body.campaignId,
        groupId: body.groupId ?? null,
        type: body.type,
        title: body.title ?? null,
        body: body.body ?? null,
        mediaUrl: body.mediaUrl ?? null,
        thumbnailUrl: body.thumbnailUrl ?? null,
        landingUrl: body.landingUrl ?? null,
        language: body.language ?? null,
      },
    });
    return { success: true, data };
  }

  @Patch("creatives/:id")
  @ApiOperation({ summary: "更新广告创意" })
  async updateCreative(
    @Param("id") id: string,
    @Body() body: UpdateAdCreativeDto,
  ) {
    const data = await (this.prisma as any).adCreative.update({
      where: { id },
      data: {
        ...(body.groupId !== undefined && { groupId: body.groupId }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.body !== undefined && { body: body.body }),
        ...(body.mediaUrl !== undefined && { mediaUrl: body.mediaUrl }),
        ...(body.thumbnailUrl !== undefined && {
          thumbnailUrl: body.thumbnailUrl,
        }),
        ...(body.landingUrl !== undefined && { landingUrl: body.landingUrl }),
        ...(body.language !== undefined && { language: body.language }),
      },
    });
    return { success: true, data };
  }
}
