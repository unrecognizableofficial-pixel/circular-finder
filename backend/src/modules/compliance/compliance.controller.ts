import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { ComplianceActionDto } from "@/modules/compliance/dto/compliance-action.dto";
import { ComplianceService } from "@/modules/compliance/compliance.service";

@ApiTags("compliance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("compliance")
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get("dashboard")
  @Permissions("compliance:review")
  dashboard() {
    return this.complianceService.dashboard();
  }

  @Get("policy-center")
  @Permissions("compliance:review")
  policyCenter() {
    return this.complianceService.policyCenter();
  }

  @Get("training-modules")
  @Permissions("compliance:review")
  trainingModules() {
    return this.complianceService.trainingModules();
  }

  @Get("audit-log")
  @Permissions("compliance:review")
  auditLog() {
    return this.complianceService.auditLog();
  }

  @Get("training-assignments/me")
  @Permissions("feed:read")
  myAssignments(@CurrentUser() user: RequestUser) {
    return this.complianceService.myAssignments(user.sub);
  }

  @Post("demo/off-brand-incident")
  @Permissions("compliance:review")
  triggerDemoIncident() {
    return this.complianceService.triggerDemoIncident();
  }

  @Post("events/:eventId/action")
  @Permissions("compliance:freeze")
  enforce(@Param("eventId") eventId: string, @Body() dto: ComplianceActionDto, @CurrentUser() user: RequestUser) {
    return this.complianceService.enforce(eventId, dto, user);
  }

  @Post("training-assignments/:assignmentId/complete")
  @Permissions("feed:read")
  completeTraining(@Param("assignmentId") assignmentId: string, @CurrentUser() user: RequestUser) {
    return this.complianceService.completeTrainingAssignment(assignmentId, user);
  }
}
