import { Module } from "@nestjs/common";
import { ComplianceController } from "@/modules/compliance/compliance.controller";
import { ComplianceService } from "@/modules/compliance/compliance.service";

@Module({
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService]
})
export class ComplianceModule {}
