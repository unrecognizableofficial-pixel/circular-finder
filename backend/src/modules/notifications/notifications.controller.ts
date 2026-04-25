import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { CreateNotificationDto } from "@/modules/notifications/dto/create-notification.dto";
import { NotificationsService } from "@/modules/notifications/notifications.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Permissions("feed:read")
  listMine(@CurrentUser() user: RequestUser) {
    return this.notificationsService.listMine(user);
  }

  @Post()
  @Permissions("notifications:send")
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }
}
