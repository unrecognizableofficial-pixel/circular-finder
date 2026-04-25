import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { ImpactService } from "@/modules/impact/impact.service";

@ApiTags("challenges")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("challenges")
export class ChallengesController {
  constructor(private readonly impactService: ImpactService) {}

  @Get()
  @Permissions("impact:view")
  list(@CurrentUser() user: RequestUser) {
    return this.impactService.challenges(user.sub);
  }

  @Post(":challengeId/complete")
  @Permissions("impact:view")
  complete(@Param("challengeId") challengeId: string, @CurrentUser() user: RequestUser) {
    return this.impactService.completeChallenge(user.sub, challengeId);
  }
}
