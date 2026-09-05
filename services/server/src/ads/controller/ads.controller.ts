import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { AdminGuard } from "@/admin/controller/admin.guard";
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
} from "@/ads/controller/ads-request";
import {
  clampPageSize,
  offsetFromPageToken,
  nextOffsetPageToken,
} from "@/core/aip/page-token";

@ApiTags("ads")
@Controller("ads")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("accounts")
  @ApiOperation({ summary: "List ad accounts" })
  async listAccounts(
    @Query("status") status?: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const where: Record<string, unknown> = {};
    if (status) where["status"] = status;
    const client = this.prisma as unknown as {
      adAccount?: {
        findMany: (args: unknown) => Promise<unknown[]>;
        count: (args: unknown) => Promise<number>;
      };
    };
    if (!client.adAccount) {
      return { accounts: [] as unknown[] };
    }
    const [items, total] = await Promise.all([
      client.adAccount.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: pageSize,
      }),
      client.adAccount.count({ where }),
    ]);
    const hasMore = offset + items.length < total;
    return {
      accounts: items,
      total_size: total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Post("accounts")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create ad account" })
  async createAccount(@Body() body: CreateAdAccountDto) {
    return (this.prisma as any).adAccount.create({
      data: {
        name: body.name,
        timezone: body.timezone ?? "UTC",
        currency: body.currency ?? "USD",
        status: body.status ?? "ACTIVE",
        dailyBudgetCents: body.dailyBudgetCents ?? null,
        totalBudgetCents: body.totalBudgetCents ?? null,
      },
    });
  }

  @Patch("accounts/:id")
  @ApiOperation({ summary: "Update ad account" })
  async updateAccount(
    @Param("id") id: string,
    @Body() body: UpdateAdAccountDto,
  ) {
    return (this.prisma as any).adAccount.update({
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
  }

  @Get("campaigns")
  @ApiOperation({ summary: "List ad campaigns" })
  async listCampaigns(
    @Query("accountId") accountId?: string,
    @Query("status") status?: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
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
      return { campaigns: [] as unknown[] };
    }
    const [items, total] = await Promise.all([
      client.adCampaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: pageSize,
      }),
      client.adCampaign.count({ where }),
    ]);
    const hasMore = offset + items.length < total;
    return {
      campaigns: items,
      total_size: total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Post("campaigns")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create ad campaign" })
  async createCampaign(@Body() body: CreateAdCampaignDto) {
    return (this.prisma as any).adCampaign.create({
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
  }

  @Patch("campaigns/:id")
  @ApiOperation({ summary: "Update ad campaign" })
  async updateCampaign(
    @Param("id") id: string,
    @Body() body: UpdateAdCampaignDto,
  ) {
    return (this.prisma as any).adCampaign.update({
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
  }

  @Get("groups")
  @ApiOperation({ summary: "List ad groups" })
  async listGroups(
    @Query("campaignId") campaignId?: string,
    @Query("placement") placement?: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const where: Record<string, unknown> = {};
    if (campaignId) where["campaignId"] = campaignId;
    if (placement) where["placement"] = placement;
    const [items, total] = await Promise.all([
      (this.prisma as any).adGroup.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: pageSize,
      }),
      (this.prisma as any).adGroup.count({ where }),
    ]);
    const hasMore = offset + items.length < total;
    return {
      groups: items,
      total_size: total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Post("groups")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create ad group" })
  async createGroup(@Body() body: CreateAdGroupDto) {
    return (this.prisma as any).adGroup.create({
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
  }

  @Patch("groups/:id")
  @ApiOperation({ summary: "Update ad group" })
  async updateGroup(@Param("id") id: string, @Body() body: UpdateAdGroupDto) {
    return (this.prisma as any).adGroup.update({
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
  }

  @Get("creatives")
  @ApiOperation({ summary: "List ad creatives" })
  async listCreatives(
    @Query("campaignId") campaignId?: string,
    @Query("groupId") groupId?: string,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    const offset = offsetFromPageToken(pageToken, pageSize);
    const where: Record<string, unknown> = {};
    if (campaignId) where["campaignId"] = campaignId;
    if (groupId) where["groupId"] = groupId;
    const [items, total] = await Promise.all([
      (this.prisma as any).adCreative.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: pageSize,
      }),
      (this.prisma as any).adCreative.count({ where }),
    ]);
    const hasMore = offset + items.length < total;
    return {
      creatives: items,
      total_size: total,
      next_page_token: nextOffsetPageToken(offset, pageSize, hasMore),
    };
  }

  @Post("creatives")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create ad creative" })
  async createCreative(@Body() body: CreateAdCreativeDto) {
    return (this.prisma as any).adCreative.create({
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
  }

  @Patch("creatives/:id")
  @ApiOperation({ summary: "Update ad creative" })
  async updateCreative(
    @Param("id") id: string,
    @Body() body: UpdateAdCreativeDto,
  ) {
    return (this.prisma as any).adCreative.update({
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
  }
}
