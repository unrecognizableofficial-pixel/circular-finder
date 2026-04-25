import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class AuditLoggerService {
  constructor(private readonly prisma: PrismaService) {}

  log(actorId: string | null | undefined, entityType: string, entityId: string, action: string, reason?: string, metadata?: Prisma.InputJsonValue) {
    return this.prisma.auditLog.create({
      data: {
        actorId: actorId ?? null,
        entityType,
        entityId,
        action,
        reason,
        metadata
      }
    });
  }
}
