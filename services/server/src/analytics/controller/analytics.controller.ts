import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { AnalyticsService } from "@/analytics/service/analytics.service";
import { IngestAnalyticsEventsRequest } from "@/analytics/controller/analytics-request";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("events")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Ingest analytics events" })
  async ingestEvents(
    @Body() dto: IngestAnalyticsEventsRequest,
    @CurrentUser() user: { id: string },
  ) {
    await this.analyticsService.ingest(dto.events, user.id);
    return { success: true };
  }
}
