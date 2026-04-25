import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { PrismaService } from "@/prisma/prisma.service";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { ANALYTICS_QUEUE } from "@/common/queues/queue.constants";
import { CreateAnalyticsEventDto } from "@/modules/analytics/dto/create-analytics-event.dto";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(ANALYTICS_QUEUE) private readonly queue: Queue
  ) {}

  async overview() {
    const [users, posts, orders, complianceEvents] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
      this.prisma.order.count(),
      this.prisma.complianceEvent.count()
    ]);

    return { users, posts, orders, complianceEvents };
  }

  userActivity() {
    return this.prisma.analyticsEvent.groupBy({
      by: ["roleKey"],
      _count: true
    });
  }

  complianceTrends() {
    return this.prisma.complianceEvent.groupBy({
      by: ["action"],
      _count: true,
      _avg: { riskScore: true }
    });
  }

  async track(user: RequestUser, dto: CreateAnalyticsEventDto) {
    const event = await this.prisma.analyticsEvent.create({
      data: {
        actorId: user.sub,
        roleKey: user.role,
        eventName: dto.eventName,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        metricValue: dto.metricValue
      }
    });

    await this.queue.add("analytics-event", event);
    return event;
  }
}
