import { Injectable, NotFoundException } from "@nestjs/common";
import { AccountStatus, ComplianceActionType, ComplianceSeverity, ImpactPointType, NotificationType } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { ComplianceActionDto } from "@/modules/compliance/dto/compliance-action.dto";

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [events, subBrands, modules, auditLogs] = await Promise.all([
      this.prisma.complianceEvent.findMany({
        include: { subBrand: true, user: true },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      this.prisma.subBrand.findMany({
        orderBy: [{ riskScore: "desc" }, { complianceScore: "asc" }],
        take: 25
      }),
      this.prisma.trainingModule.findMany({
        where: { active: true }
      }),
      this.prisma.auditLog.findMany({
        where: {
          entityType: { in: ["compliance_event", "training_assignment", "sub_brand", "user_access"] }
        },
        orderBy: { createdAt: "desc" },
        take: 20
      })
    ]);

    return {
      events,
      subBrands,
      trainingModules: modules,
      auditLogs,
      healthStates: {
        green: "Safe",
        yellow: "Warning",
        orange: "Risk",
        red: "Critical"
      }
    };
  }

  async triggerDemoIncident() {
    const scenario = await this.prisma.subBrand.findFirst({
      orderBy: { riskScore: "desc" },
      include: { manager: true, brand: true, posts: { take: 1, orderBy: { createdAt: "desc" } } }
    });

    if (!scenario?.manager) {
      throw new NotFoundException("No sub-brand scenario available.");
    }

    const manager = scenario.manager;

    return this.prisma.$transaction(async (tx) => {
      await tx.subBrand.update({
        where: { id: scenario.id },
        data: {
          complianceScore: { decrement: 18 },
          riskScore: { increment: 22 }
        }
      });

      const event = await tx.complianceEvent.create({
        data: {
          userId: manager.id,
          brandId: scenario.brandId,
          subBrandId: scenario.id,
          postId: scenario.posts[0]?.id,
          type: "OFF_BRAND_CONTENT",
          severity: ComplianceSeverity.HIGH,
          action: ComplianceActionType.WARNING,
          scoreDelta: -18,
          riskScore: 74,
          policyRef: "MBP-101",
          reason: "Wrong logo, unauthorized colors, and unapproved template detected.",
          suggestedFix: "Complete the brand recovery training and resubmit approved assets."
        }
      });

      await tx.notification.create({
        data: {
          userId: manager.id,
          type: NotificationType.COMPLIANCE,
          title: "Policy warning issued",
          body: "Your latest post triggered the Circular Finder demo policy engine.",
          payload: {
            policyRef: "MBP-101",
            eventId: event.id
          }
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: manager.id,
          entityType: "compliance_event",
          entityId: event.id,
          action: "off_brand_content_detected",
          reason: "Demo investor flow: off-brand post detected automatically."
        }
      });

      return event;
    });
  }

  async enforce(eventId: string, dto: ComplianceActionDto, actor?: RequestUser) {
    const event = await this.prisma.complianceEvent.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException("Compliance event not found.");
    }

    const nextStatus =
      dto.action === ComplianceActionType.FREEZE
        ? AccountStatus.FROZEN
        : dto.action === ComplianceActionType.PERMANENT_REMOVAL
          ? AccountStatus.REMOVED
          : dto.action === ComplianceActionType.SUSPENSION
          ? AccountStatus.SUSPENDED
          : dto.action === ComplianceActionType.RESTORE
            ? AccountStatus.ACTIVE
            : undefined;

    return this.prisma.$transaction(async (tx) => {
      if (event.userId && nextStatus) {
        await tx.user.update({
          where: { id: event.userId },
          data: {
            status: nextStatus,
            suspendedUntil:
              dto.action === ComplianceActionType.SUSPENSION ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) : null
          }
        });
      }

      if (event.subBrandId) {
        await tx.subBrand.update({
          where: { id: event.subBrandId },
          data: {
            status: nextStatus ?? undefined,
            complianceScore: dto.action === ComplianceActionType.RESTORE ? { increment: 12 } : { decrement: 12 },
            riskScore: dto.action === ComplianceActionType.RESTORE ? { decrement: 18 } : { increment: 14 },
            frozenUntil:
              dto.action === ComplianceActionType.FREEZE ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) : null,
            suspendedUntil:
              dto.action === ComplianceActionType.SUSPENSION ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) : null
          }
        });
      }

      const enforcementEvent = await tx.complianceEvent.create({
        data: {
          userId: event.userId,
          brandId: event.brandId,
          subBrandId: event.subBrandId,
          postId: event.postId,
          orderId: event.orderId,
          resolvedById: actor?.sub,
          type: "ENFORCEMENT_ACTION",
          severity: dto.action === ComplianceActionType.RESTORE ? ComplianceSeverity.MEDIUM : ComplianceSeverity.CRITICAL,
          action: dto.action,
          scoreDelta: dto.action === ComplianceActionType.RESTORE ? 10 : -12,
          riskScore: dto.action === ComplianceActionType.RESTORE ? 38 : 86,
          policyRef: event.policyRef,
          reason: dto.reason ?? event.reason,
          suggestedFix: event.suggestedFix
        }
      });

      let trainingAssignment = null;
      if (event.userId && (dto.action === ComplianceActionType.FREEZE || dto.action === ComplianceActionType.TRAINING_REQUIRED)) {
        const trainingModule = await tx.trainingModule.findFirst({
          where: { active: true },
          orderBy: { createdAt: "asc" }
        });

        if (trainingModule) {
          trainingAssignment = await tx.trainingAssignment.create({
            data: {
              moduleId: trainingModule.id,
              userId: event.userId,
              complianceEventId: enforcementEvent.id
            },
            include: { module: true }
          });
        }
      }

      if (event.userId) {
        await tx.notification.create({
          data: {
            userId: event.userId,
            type: NotificationType.COMPLIANCE,
            title: dto.action === ComplianceActionType.RESTORE ? "Access restored" : "Compliance action applied",
            body:
              dto.action === ComplianceActionType.RESTORE
                ? "Your Circular Finder access has been restored after review."
                : `Action ${dto.action} was applied under ${event.policyRef}.`,
            payload: {
              policyRef: event.policyRef,
              eventId: enforcementEvent.id,
              suggestedFix: event.suggestedFix,
              trainingAssignmentId: trainingAssignment?.id
            }
          }
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: actor?.sub ?? null,
          entityType: "compliance_event",
          entityId: enforcementEvent.id,
          action: dto.action.toLowerCase(),
          reason: dto.reason ?? event.reason,
          metadata: {
            sourceEventId: event.id,
            policyRef: event.policyRef,
            trainingAssignmentId: trainingAssignment?.id
          }
        }
      });

      return {
        event: enforcementEvent,
        trainingAssignment
      };
    });
  }

  trainingModules() {
    return this.prisma.trainingModule.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { createdAt: "asc" }]
    });
  }

  myAssignments(userId: string) {
    return this.prisma.trainingAssignment.findMany({
      where: { userId },
      include: {
        module: true,
        complianceEvent: true
      },
      orderBy: { assignedAt: "desc" }
    });
  }

  auditLog() {
    return this.prisma.auditLog.findMany({
      where: {
        entityType: { in: ["compliance_event", "training_assignment", "sub_brand", "user_access"] }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  policyCenter() {
    return {
      hierarchy: [
        { level: 1, key: "MASTER_BRAND_POLICY", description: "Highest authority for Circular Finder identity and enforcement." },
        { level: 2, key: "PLATFORM_POLICY", description: "System-wide trust, commerce, safety, and data rules." },
        { level: 3, key: "SUB_BRAND_POLICY", description: "Sub-brand-specific rules that cannot override master rules." },
        { level: 4, key: "USER_PERMISSION_POLICY", description: "Role-based limits for creators, vendors, and members." }
      ],
      automaticEnforcement: [
        "Detect policy violations in posts and products",
        "Reduce compliance score and increase risk score",
        "Trigger alerts, notifications, and audit logs",
        "Recommend corrective actions and training"
      ]
    };
  }

  async completeTrainingAssignment(assignmentId: string, user: RequestUser) {
    const assignment = await this.prisma.trainingAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        module: true,
        complianceEvent: true
      }
    });

    if (!assignment || assignment.userId !== user.sub) {
      throw new NotFoundException("Training assignment not found.");
    }

    if (assignment.completedAt) {
      return {
        assignment,
        certification: null,
        reward: null,
        alreadyCompleted: true
      };
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedAssignment = await tx.trainingAssignment.update({
        where: { id: assignmentId },
        data: {
          progress: 100,
          passed: true,
          acknowledgedAt: assignment.acknowledgedAt ?? new Date(),
          completedAt: new Date()
        },
        include: {
          module: true,
          complianceEvent: true
        }
      });

      const certification = await tx.certification.create({
        data: {
          moduleId: assignment.moduleId,
          userId: user.sub,
          certificateCode: `CF-CERT-${Date.now().toString().slice(-8)}`
        }
      });

      const reward = await tx.impactPoint.create({
        data: {
          userId: user.sub,
          type: ImpactPointType.TRAINING_COMPLETION,
          points: 125,
          reason: `Completed ${assignment.module.title}`,
          sourceId: assignment.id
        }
      });

      await tx.profile.update({
        where: { userId: user.sub },
        data: {
          impactPoints: { increment: 125 }
        }
      });

      await tx.notification.create({
        data: {
          userId: user.sub,
          type: NotificationType.COMPLIANCE,
          title: "Compliance training completed",
          body: "Your training module is complete and ready for admin review.",
          payload: {
            assignmentId,
            certificationId: certification.id
          }
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: user.sub,
          entityType: "training_assignment",
          entityId: assignmentId,
          action: "completed",
          reason: `Completed training module ${assignment.module.key}`,
          metadata: {
            certificationId: certification.id
          }
        }
      });

      return {
        assignment: updatedAssignment,
        certification,
        reward
      };
    });
  }
}
