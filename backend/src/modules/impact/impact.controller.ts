import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { AwardImpactDto } from "@/modules/impact/dto/award-impact.dto";
import { ImpactService } from "@/modules/impact/impact.service";

@ApiTags("impact", "leaderboard", "challenges")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("impact")
export class ImpactController {
  constructor(private readonly impactService: ImpactService) {}

  @Get("summary")
  @Permissions("impact:view")
  summary(@CurrentUser() user: RequestUser) {
    return this.impactService.summary(user.sub);
  }

  @Get("leaderboard")
  @Permissions("impact:view")
  leaderboard() {
    return this.impactService.leaderboard();
  }

  @Get("challenges")
  @Permissions("impact:view")
  challenges(@CurrentUser() user: RequestUser) {
    return this.impactService.challenges(user.sub);
  }

  @Post("award")
  @Permissions("impact:manage")
  award(@Body() dto: AwardImpactDto) {
    return this.impactService.award(dto);
  }
}
