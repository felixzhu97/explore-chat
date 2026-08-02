import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationService } from "@/notifications/application/notification.service";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
