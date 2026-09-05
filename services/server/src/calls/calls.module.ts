import { Module } from "@nestjs/common";
import { CallsController } from "./controller/calls.controller";
import { CallsService } from "@/calls/service/calls.service";
import { DatabaseModule } from "@/core/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [CallsService],
})
export class CallsModule {}
