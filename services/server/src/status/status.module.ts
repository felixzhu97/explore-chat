import { Module } from "@nestjs/common";
import { StatusController } from "./controller/status.controller";
import { StatusService } from "@/status/service/status.service";
import { DatabaseModule } from "@/core/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}
