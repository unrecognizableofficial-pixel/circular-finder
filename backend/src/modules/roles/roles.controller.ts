import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { AssignPermissionsDto } from "@/modules/roles/dto/assign-permissions.dto";
import { RolesService } from "@/modules/roles/roles.service";

@ApiTags("roles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions("users:read")
  listRoles() {
    return this.rolesService.listRoles();
  }

  @Post(":roleKey/permissions")
  @Permissions("permissions:assign")
  assignPermissions(@Param("roleKey") roleKey: string, @Body() dto: AssignPermissionsDto) {
    return this.rolesService.assignPermissions(roleKey, dto);
  }
}
