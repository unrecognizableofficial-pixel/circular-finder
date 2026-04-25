import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { AddWardrobeItemDto } from "@/modules/wardrobe/dto/add-wardrobe-item.dto";
import { LogWardrobeEventDto } from "@/modules/wardrobe/dto/log-wardrobe-event.dto";
import { WardrobeService } from "@/modules/wardrobe/wardrobe.service";

@ApiTags("wardrobe")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("wardrobe")
export class WardrobeController {
  constructor(private readonly wardrobeService: WardrobeService) {}

  @Get()
  @Permissions("profiles:manage")
  list(@CurrentUser() user: RequestUser) {
    return this.wardrobeService.listWardrobe(user);
  }

  @Post("items")
  @Permissions("profiles:manage")
  addItem(@CurrentUser() user: RequestUser, @Body() dto: AddWardrobeItemDto) {
    return this.wardrobeService.addItem(user, dto);
  }

  @Post("items/:id/events")
  @Permissions("profiles:manage")
  logEvent(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: LogWardrobeEventDto) {
    return this.wardrobeService.logEvent(user, id, dto);
  }
}
