import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { SettingsService } from "@/modules/settings/settings.service";
import { UpdateSettingDto } from "@/modules/settings/dto/update-setting.dto";

@ApiTags("settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Permissions("settings:manage")
  mine(@CurrentUser() user: RequestUser) {
    return this.settingsService.getMySettings(user);
  }

  @Post()
  @Permissions("settings:manage")
  upsert(@Body() dto: UpdateSettingDto, @CurrentUser() user: RequestUser) {
    return this.settingsService.upsert(dto, user);
  }
}
