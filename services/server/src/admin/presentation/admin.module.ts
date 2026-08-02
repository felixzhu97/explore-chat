import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/core/database/database.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "@/admin/application/admin.service";
import { UsersModule } from "@/users/presentation/users.module";
import { AnalyticsModule } from "@/analytics/presentation/analytics.module";
import { VisionModule } from "@/ai/presentation/vision.module";

@Module({
  imports: [DatabaseModule, UsersModule, AnalyticsModule, VisionModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
