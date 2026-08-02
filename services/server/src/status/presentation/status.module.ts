import { Module } from "@nestjs/common";
import { StatusController } from "./status.controller";
import { StatusService } from "@/status/application/status.service";
import { DatabaseModule } from "@/core/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}
