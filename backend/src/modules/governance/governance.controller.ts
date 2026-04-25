import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { ApprovePresetDto } from "@/modules/governance/dto/approve-preset.dto";
import { GovernanceService } from "@/modules/governance/governance.service";

@ApiTags("governance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("governance")
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get("presets")
  @Permissions("brands:manage")
  presets() {
    return this.governanceService.presets();
  }

  @Get("policies")
  @Permissions("brands:manage")
  policies() {
    return this.governanceService.policyHierarchy();
  }

  @Get("audit-trail")
  @Permissions("brands:manage")
  auditTrail() {
    return this.governanceService.auditTrail();
  }

  @Post("presets/:id/approve")
  @Permissions("brands:manage")
  approve(@Param("id") id: string, @Body() dto: ApprovePresetDto) {
    return this.governanceService.approvePreset(id, dto);
  }

  @Post("sub-brands/:id/revert")
  @Permissions("governance:reset")
  revert(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.governanceService.revertSubBrandTheme(id, user);
  }

  @Post("master-reset")
  @Permissions("governance:reset")
  masterReset(@CurrentUser() user: RequestUser) {
    return this.governanceService.masterReset(user);
  }
}
