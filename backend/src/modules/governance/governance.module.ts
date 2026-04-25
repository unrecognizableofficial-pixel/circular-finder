import { Module } from "@nestjs/common";
import { GovernanceController } from "@/modules/governance/governance.controller";
import { GovernanceService } from "@/modules/governance/governance.service";

@Module({
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService]
})
export class GovernanceModule {}
