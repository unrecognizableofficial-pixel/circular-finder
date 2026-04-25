import { Body, Controller, Get, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { UpdateProfileDto } from "@/modules/profiles/dto/update-profile.dto";
import { ProfilesService } from "@/modules/profiles/profiles.service";

@ApiTags("profiles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("profiles")
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get("me")
  @Permissions("profiles:manage")
  getCurrent(@CurrentUser() user: RequestUser) {
    return this.profilesService.getCurrent(user.sub);
  }

  @Patch("me")
  @Permissions("profiles:manage")
  updateCurrent(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateCurrent(user.sub, dto);
  }

  @Get("search")
  @Permissions("feed:read")
  search(@Query("q") query?: string) {
    return this.profilesService.search(query);
  }

  @Get("suggestions")
  @Permissions("feed:read")
  suggestions() {
    return this.profilesService.suggestions();
  }
}
