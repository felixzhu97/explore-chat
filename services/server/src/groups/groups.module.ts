import { Module } from "@nestjs/common";
import { GroupsController } from "./controller/groups.controller";
import { GroupsService } from "@/groups/service/groups.service";
import { DatabaseModule } from "@/core/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
