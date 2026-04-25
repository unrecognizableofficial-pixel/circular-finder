import { Module } from "@nestjs/common";
import { PassportsController } from "@/modules/passports/passports.controller";
import { PassportsService } from "@/modules/passports/passports.service";
import { EventBusService } from "@/core/event-bus.service";
import { RiskEngineService } from "@/core/risk-engine.service";

@Module({
  controllers: [PassportsController],
  providers: [PassportsService, EventBusService, RiskEngineService],
  exports: [PassportsService]
})
export class PassportsModule {}
