import { Injectable, NotFoundException } from "@nestjs/common";
import { ImpactPointType } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { AwardImpactDto } from "@/modules/impact/dto/award-impact.dto";
import { ImpactGateway } from "@/modules/impact/gateways/impact.gateway";

@Injectable()
export class ImpactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly impactGateway: ImpactGateway
  ) {}

  async summary(userId: string) {
    const [profile, points, challenges] = await Promise.all([
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.impactPoint.aggregate({
        where: { userId },
        _sum: { points: true }
      }),
      this.prisma.challengeProgress.findMany({
        where: { userId },
        include: { challenge: true }
      })
    ]);

    return {
      profile,
      totalPoints: points._sum.points ?? 0,
      challenges
    };
  }

  leaderboard() {
    return this.prisma.leaderboard.findMany({
      include: {
        entries: {
          include: { user: { include: { profile: true } } },
          orderBy: { rank: "asc" }
        }
      }
    });
  }

  challenges(userId: string) {
    return this.prisma.challengeProgress.findMany({
      where: { userId },
      include: { challenge: true }
    });
  }

  async completeChallenge(userId: string, challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      throw new NotFoundException("Challenge not found.");
    }

    const existingProgress = await this.prisma.challengeProgress.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId
        }
      }
    });

    if (existingProgress?.completedAt) {
      return {
        progress: existingProgress,
        reward: null,
        alreadyCompleted: true
      };
    }

    const [progress, reward] = await this.prisma.$transaction(async (tx) => {
      const updatedProgress = await tx.challengeProgress.upsert({
        where: {
          challengeId_userId: {
            challengeId,
            userId
          }
        },
        update: {
          progress: challenge.targetCount,
          completedAt: new Date()
        },
        create: {
          challengeId,
          userId,
          progress: challenge.targetCount,
          completedAt: new Date()
        }
      });

      const rewardEntry = await tx.impactPoint.create({
        data: {
          userId,
          type: ImpactPointType.CHALLENGE_COMPLETION,
          points: challenge.pointsReward,
          reason: `Completed ${challenge.title}`,
          sourceId: challenge.id,
          metadata: {
            badgeName: challenge.badgeName,
            category: challenge.category
          }
        }
      });

      await tx.profile.update({
        where: { userId },
        data: {
          impactPoints: { increment: challenge.pointsReward }
        }
      });

      return [updatedProgress, rewardEntry] as const;
    });

    this.impactGateway.emitPointsUpdate(userId, {
      reward,
      challengeId,
      pointsAwarded: challenge.pointsReward
    });

    return {
      progress,
      reward,
      alreadyCompleted: false
    };
  }

  async award(dto: AwardImpactDto) {
    const entry = await this.prisma.impactPoint.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        points: dto.points,
        reason: dto.reason,
        sourceId: dto.sourceId
      }
    });

    await this.prisma.profile.update({
      where: { userId: dto.userId },
      data: {
        impactPoints: { increment: dto.points }
      }
    });

    this.impactGateway.emitPointsUpdate(dto.userId, entry);
    return entry;
  }
}
