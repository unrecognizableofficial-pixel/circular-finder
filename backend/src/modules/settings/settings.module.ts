import { Module } from "@nestjs/common";
import { SettingsController } from "@/modules/settings/settings.controller";
import { SettingsService } from "@/modules/settings/settings.service";

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService]
})
export class SettingsModule {}
