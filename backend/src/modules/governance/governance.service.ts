import { Injectable } from "@nestjs/common";
import { SettingScope } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { ApprovePresetDto } from "@/modules/governance/dto/approve-preset.dto";

@Injectable()
export class GovernanceService {
  constructor(private readonly prisma: PrismaService) {}

  presets() {
    return this.prisma.brandPreset.findMany({
      include: { brand: true, subBrand: true },
      orderBy: { updatedAt: "desc" }
    });
  }

  async approvePreset(id: string, dto: ApprovePresetDto) {
    return this.prisma.$transaction(async (tx) => {
      const preset = await tx.brandPreset.update({
        where: { id },
        data: {
          approvedAt: new Date(),
          approvedById: dto.approvedById
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: dto.approvedById ?? null,
          entityType: "brand_preset",
          entityId: id,
          action: "approved",
          reason: "Preset approved for demo-wide brand styling."
        }
      });

      return preset;
    });
  }

  async revertSubBrandTheme(subBrandId: string, actor?: RequestUser) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.brandPreset.updateMany({
        where: { subBrandId },
        data: {
          approvedAt: null
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.sub ?? null,
          entityType: "sub_brand_theme",
          entityId: subBrandId,
          action: "reverted",
          reason: "Sub-brand theme reverted to approved master styling."
        }
      });

      return result;
    });
  }

  policyHierarchy() {
    return {
      precedence: [
        "Master Brand Policy",
        "Platform Policy",
        "Sub-Brand Policy",
        "User Permissions Policy"
      ],
      overrideRule: "Master Brand Policy overrides all conflicting lower-level policies.",
      actions: [
        "Warning",
        "Content suppression",
        "Temporary freeze",
        "Mandatory training",
        "Suspension",
        "Permanent removal"
      ]
    };
  }

  auditTrail() {
    return this.prisma.auditLog.findMany({
      where: {
        entityType: { in: ["brand_preset", "sub_brand_theme", "platform_theme", "policy"] }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  async masterReset(actor?: RequestUser) {
    await this.prisma.$transaction(async (tx) => {
      await tx.brandPreset.updateMany({
        data: { approvedAt: null }
      });
      await tx.setting.deleteMany({
        where: { scope: SettingScope.SUB_BRAND }
      });
      await tx.auditLog.create({
        data: {
          actorId: actor?.sub ?? null,
          entityType: "platform_theme",
          entityId: "global",
          action: "master_reset",
          reason: "All sub-brand overrides reset to Circular Finder defaults."
        }
      });
    });

    return { success: true };
  }
}
