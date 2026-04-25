import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { EnterpriseQueryDto } from "@/modules/enterprise/dto/enterprise-query.dto";
import { EnterpriseService } from "@/modules/enterprise/enterprise.service";

@ApiTags("enterprise")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("enterprise")
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @Get("contracts")
  @Permissions("enterprise:view")
  contracts(@Query() query: EnterpriseQueryDto) {
    return this.enterpriseService.contracts(query.organizationId);
  }

  @Get("analytics")
  @Permissions("enterprise:view")
  analytics(@Query() query: EnterpriseQueryDto) {
    return this.enterpriseService.analytics(query.organizationId);
  }

  @Get("supply-chain")
  @Permissions("enterprise:view")
  supplyChain(@Query() query: EnterpriseQueryDto) {
    return this.enterpriseService.supplyChain(query.organizationId);
  }

  @Get("compliance-report")
  @Permissions("enterprise:view")
  complianceReport(@Query() query: EnterpriseQueryDto) {
    return this.enterpriseService.complianceReport(query.organizationId);
  }

  @Get("investor-readiness")
  @Permissions("investor:view")
  investorReadiness(@Query() query: EnterpriseQueryDto) {
    return this.enterpriseService.investorReadiness(query.organizationId);
  }

  @Get("data-room-export")
  @Permissions("investor:view")
  dataRoomExport(@Query() query: EnterpriseQueryDto) {
    return this.enterpriseService.dataRoomExport(query.organizationId);
  }
}
