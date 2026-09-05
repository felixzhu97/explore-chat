import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/database.module";
import { AdminController } from "./controller/admin.controller";
import { AdminService } from "@/admin/service/admin.service";
import { UsersModule } from "@/users/users.module";
import { AnalyticsModule } from "@/analytics/analytics.module";
import { VisionModule } from "@/ai/vision.module";

@Module({
  imports: [DatabaseModule, UsersModule, AnalyticsModule, VisionModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
