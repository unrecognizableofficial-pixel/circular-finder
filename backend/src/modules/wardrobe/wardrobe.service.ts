import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import {
  buildOutfits,
  buildWardrobeInsights,
  buildWardrobeItemPresentation,
  toFrontendId
} from "@/common/presenters/platform.presenter";
import { AddWardrobeItemDto } from "@/modules/wardrobe/dto/add-wardrobe-item.dto";
import { LogWardrobeEventDto } from "@/modules/wardrobe/dto/log-wardrobe-event.dto";

@Injectable()
export class WardrobeService {
  constructor(private readonly prisma: PrismaService) {}

  async listWardrobe(user: RequestUser) {
    const items = await this.loadWardrobeItems(user.sub);
    const presented = items.map(buildWardrobeItemPresentation);

    return {
      items: presented,
      insights: buildWardrobeInsights(presented),
      outfits: buildOutfits(presented)
    };
  }

  async listOutfits(user: RequestUser) {
    const items = await this.loadWardrobeItems(user.sub);
    return {
      items: buildOutfits(items.map(buildWardrobeItemPresentation))
    };
  }

  async addItem(user: RequestUser, dto: AddWardrobeItemDto) {
    const circularId = await this.prisma.circularId.findFirst({
      where: {
        OR: [{ code: dto.passport_id }, { id: dto.passport_id }]
      }
    });

    if (!circularId) {
      throw new NotFoundException("Passport not found.");
    }

    const existing = await this.prisma.wardrobeItemRecord.findUnique({
      where: {
        userId_circularIdId: {
          userId: user.sub,
          circularIdId: circularId.id
        }
      }
    });

    const itemId = existing
      ? existing.id
      : (
          await this.prisma.wardrobeItemRecord.create({
            data: {
              userId: user.sub,
              circularIdId: circularId.id,
              nickname: dto.nickname?.trim() || "Saved wardrobe piece",
              condition: dto.condition ?? "excellent",
              purchasePrice: dto.purchase_price,
              acquiredOn: new Date(),
              notes: "Added from the Circular Finder scanner flow."
            }
          })
        ).id;

    const item = await this.getWardrobeItem(user.sub, itemId);

    return {
      message: existing ? "This passport is already in your wardrobe." : "Added to your live wardrobe.",
      item: buildWardrobeItemPresentation(item)
    };
  }

  async logEvent(user: RequestUser, itemId: string, dto: LogWardrobeEventDto) {
    const item = await this.findWardrobeItemByFrontendId(user.sub, itemId);

    await this.prisma.wardrobeEventRecord.create({
      data: {
        itemId: item.id,
        eventType: dto.event_type,
        note: dto.note ?? `Logged from the Circular Finder ${dto.event_type} flow.`
      }
    });

    await this.prisma.wardrobeItemRecord.update({
      where: { id: item.id },
      data: {
        wearCount: dto.event_type === "wear" ? { increment: 1 } : undefined,
        repairCount: dto.event_type === "repair" ? { increment: 1 } : undefined,
        lastWornAt: dto.event_type === "wear" ? new Date() : undefined,
        status: dto.event_type === "list" ? "listed" : undefined
      }
    });

    const refreshed = await this.getWardrobeItem(user.sub, item.id);

    return {
      message: `Logged ${dto.event_type} against the live wardrobe timeline.`,
      item: buildWardrobeItemPresentation(refreshed)
    };
  }

  private async loadWardrobeItems(userId: string) {
    return this.prisma.wardrobeItemRecord.findMany({
      where: { userId },
      include: {
        circularId: {
          include: {
            product: {
              include: {
                brand: true
              }
            }
          }
        },
        events: true
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
    });
  }

  private async getWardrobeItem(userId: string, itemId: string) {
    const item = await this.prisma.wardrobeItemRecord.findFirst({
      where: {
        id: itemId,
        userId
      },
      include: {
        circularId: {
          include: {
            product: {
              include: {
                brand: true
              }
            }
          }
        },
        events: true
      }
    });

    if (!item) {
      throw new NotFoundException("Wardrobe item not found.");
    }

    return item;
  }

  private async findWardrobeItemByFrontendId(userId: string, itemId: string) {
    const parsedNumericId = Number(itemId);
    const items = await this.loadWardrobeItems(userId);
    const match = items.find((item) => item.id === itemId || (!Number.isNaN(parsedNumericId) && toFrontendId(item.id) === parsedNumericId));

    if (!match) {
      throw new NotFoundException("Wardrobe item not found.");
    }

    return match;
  }
}
