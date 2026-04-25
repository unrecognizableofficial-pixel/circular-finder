import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { NOTIFICATIONS_QUEUE } from "@/common/queues/queue.constants";
import { NotificationsController } from "@/modules/notifications/notifications.controller";
import { NotificationsGateway } from "@/modules/notifications/gateways/notifications.gateway";
import { NotificationsProcessor } from "@/modules/notifications/processors/notifications.processor";
import { NotificationsService } from "@/modules/notifications/notifications.service";

@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE })],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, NotificationsProcessor],
  exports: [NotificationsService, NotificationsGateway]
})
export class NotificationsModule {}
