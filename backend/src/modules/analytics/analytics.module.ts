import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ANALYTICS_QUEUE } from "@/common/queues/queue.constants";
import { AnalyticsController } from "@/modules/analytics/analytics.controller";
import { AnalyticsProcessor } from "@/modules/analytics/processors/analytics.processor";
import { AnalyticsService } from "@/modules/analytics/analytics.service";

@Module({
  imports: [BullModule.registerQueue({ name: ANALYTICS_QUEUE })],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsProcessor],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
