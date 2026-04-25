import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { UpdateUserStatusDto } from "@/modules/users/dto/update-user-status.dto";
import { UsersService } from "@/modules/users/users.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions("users:read")
  listUsers() {
    return this.usersService.listUsers();
  }

  @Get(":id")
  @Permissions("users:read")
  getUser(@Param("id") id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(":id/status")
  @Permissions("users:update")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto);
  }
}
