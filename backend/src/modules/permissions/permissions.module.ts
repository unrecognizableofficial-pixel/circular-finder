import { Module } from "@nestjs/common";
import { PermissionsController } from "@/modules/permissions/permissions.controller";
import { PermissionsService } from "@/modules/permissions/permissions.service";

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService]
})
export class PermissionsModule {}
