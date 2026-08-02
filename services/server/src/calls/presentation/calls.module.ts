import { Module } from "@nestjs/common";
import { CallsController } from "./calls.controller";
import { CallsService } from "@/calls/application/calls.service";
import { DatabaseModule } from "@/core/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [CallsService],
})
export class CallsModule {}
