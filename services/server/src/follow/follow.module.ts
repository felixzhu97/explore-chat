import { Module } from "@nestjs/common";
import { FollowController } from "./controller/follow.controller";
import { FollowService } from "@/follow/service/follow.service";

@Module({
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
