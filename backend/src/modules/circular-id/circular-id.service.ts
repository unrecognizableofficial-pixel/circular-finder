import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateCircularIdDto } from "@/modules/circular-id/dto/create-circular-id.dto";
import { TransferOwnershipDto } from "@/modules/circular-id/dto/transfer-ownership.dto";

@Injectable()
export class CircularIdService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCircularIdDto) {
    return this.prisma.circularId.create({
      data: {
        code: `CF-${Date.now().toString().slice(-6)}`,
        productId: dto.productId,
        inventoryId: dto.inventoryId,
        origin: dto.origin,
        materials: { composition: dto.materials },
        fitGuidance: dto.fitGuidance,
        repairGuide: dto.repairGuide,
        authenticityStatus: "Verified",
        ownershipStatus: "Brand-owned",
        careInstructions: dto.careInstructions,
        sustainabilityScore: dto.sustainabilityScore,
        lifecycleState: "active",
        passportData: {
          tagline: "Know how it’s made. Know how it fits. Know your impact."
        }
      }
    });
  }

  async getByCode(code: string) {
    const record = await this.prisma.circularId.findUnique({
      where: { code },
      include: {
        product: {
          include: {
            brand: true,
            circularIds: true
          }
        },
        inventory: true,
        ownershipHistory: true,
        scanHistory: true
      }
    });
    if (!record) {
      throw new NotFoundException("Circular ID not found.");
    }
    return record;
  }

  transfer(code: string, dto: TransferOwnershipDto) {
    return this.prisma.$transaction(async (tx) => {
      const circularId = await tx.circularId.findUnique({
        where: { code },
        select: { id: true }
      });

      if (!circularId) {
        throw new NotFoundException("Circular ID not found.");
      }

      const transfer = await tx.ownershipHistory.create({
        data: {
          circularIdId: circularId.id,
          fromUserId: dto.fromUserId,
          toUserId: dto.toUserId,
          salePrice: dto.salePrice,
          notes: dto.notes
        }
      });

      await tx.circularId.update({
        where: { code },
        data: {
          ownershipStatus: dto.toUserId ? `Transferred to user ${dto.toUserId}` : "Ownership transferred",
          lifecycleState: "resale"
        }
      });

      return transfer;
    });
  }

  updateLifecycle(code: string, lifecycleState: string) {
    return this.prisma.circularId.update({
      where: { code },
      data: { lifecycleState }
    });
  }
}
