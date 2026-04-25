import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Queue } from "bullmq";
import { PrismaService } from "@/prisma/prisma.service";
import { NOTIFICATIONS_QUEUE } from "@/common/queues/queue.constants";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { CreateNotificationDto } from "@/modules/notifications/dto/create-notification.dto";
import { NotificationsGateway } from "@/modules/notifications/gateways/notifications.gateway";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue
  ) {}

  listMine(user: RequestUser) {
    return this.prisma.notification.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        payload: dto.payload as Prisma.InputJsonValue | undefined
      }
    });

    await this.queue.add("deliver", notification);
    this.notificationsGateway.notifyUser(dto.userId, notification);
    return notification;
  }
}
