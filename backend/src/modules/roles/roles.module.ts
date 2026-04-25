import { Module } from "@nestjs/common";
import { RolesController } from "@/modules/roles/roles.controller";
import { RolesService } from "@/modules/roles/roles.service";

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService]
})
export class RolesModule {}
