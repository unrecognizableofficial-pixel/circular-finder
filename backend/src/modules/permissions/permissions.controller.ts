import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { CheckPermissionDto } from "@/modules/permissions/dto/check-permission.dto";
import { PermissionsService } from "@/modules/permissions/permissions.service";

@ApiTags("permissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permissions("users:read")
  listPermissions() {
    return this.permissionsService.listPermissions();
  }

  @Post("check")
  @Permissions("users:read")
  can(@Body() dto: CheckPermissionDto) {
    return this.permissionsService.can(dto);
  }
}
