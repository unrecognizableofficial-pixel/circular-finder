import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { UpdateProfileDto } from "@/modules/profiles/dto/update-profile.dto";

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: { include: { role: true } } }
    });

    if (!profile) {
      throw new NotFoundException("Profile not found.");
    }
    return profile;
  }

  updateCurrent(userId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        location: dto.location,
        nearbyEnabled: dto.nearbyEnabled,
        stylePreferences: dto.stylePreferences ? { tags: dto.stylePreferences } : undefined
      }
    });
  }

  search(query?: string) {
    return this.prisma.profile.findMany({
      where: query
        ? {
            OR: [
              { displayName: { contains: query, mode: "insensitive" } },
              { handle: { contains: query, mode: "insensitive" } },
              { location: { contains: query, mode: "insensitive" } }
            ]
          }
        : undefined,
      take: 20,
      orderBy: [{ verified: "desc" }, { reputationScore: "desc" }]
    });
  }

  suggestions() {
    return this.prisma.profile.findMany({
      where: { verified: true },
      take: 12,
      orderBy: [{ reputationScore: "desc" }, { followersCount: "desc" }]
    });
  }
}
