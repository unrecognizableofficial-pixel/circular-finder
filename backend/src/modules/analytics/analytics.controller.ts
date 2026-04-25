import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { AnalyticsService } from "@/modules/analytics/analytics.service";
import { CreateAnalyticsEventDto } from "@/modules/analytics/dto/create-analytics-event.dto";

@ApiTags("analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("overview")
  @Permissions("analytics:view")
  overview() {
    return this.analyticsService.overview();
  }

  @Get("user-activity")
  @Permissions("analytics:view")
  userActivity() {
    return this.analyticsService.userActivity();
  }

  @Get("compliance")
  @Permissions("analytics:view")
  compliance() {
    return this.analyticsService.complianceTrends();
  }

  @Post("track")
  @Permissions("analytics:view")
  track(@CurrentUser() user: RequestUser, @Body() dto: CreateAnalyticsEventDto) {
    return this.analyticsService.track(user, dto);
  }
}
