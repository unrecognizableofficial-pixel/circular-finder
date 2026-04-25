import { Module } from "@nestjs/common";
import { ChallengesController } from "@/modules/impact/challenges.controller";
import { ImpactController } from "@/modules/impact/impact.controller";
import { ImpactGateway } from "@/modules/impact/gateways/impact.gateway";
import { LeaderboardController } from "@/modules/impact/leaderboard.controller";
import { ImpactService } from "@/modules/impact/impact.service";

@Module({
  controllers: [ImpactController, LeaderboardController, ChallengesController],
  providers: [ImpactService, ImpactGateway],
  exports: [ImpactService]
})
export class ImpactModule {}
