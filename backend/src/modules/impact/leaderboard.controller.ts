import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { ImpactService } from "@/modules/impact/impact.service";

@ApiTags("leaderboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly impactService: ImpactService) {}

  @Get()
  @Permissions("impact:view")
  list() {
    return this.impactService.leaderboard();
  }
}
