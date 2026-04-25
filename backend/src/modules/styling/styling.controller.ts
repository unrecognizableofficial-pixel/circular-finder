import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { StylingService } from "@/modules/styling/styling.service";

@ApiTags("styling")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("styling")
export class StylingController {
  constructor(private readonly stylingService: StylingService) {}

  @Get("outfits")
  @Permissions("profiles:manage")
  outfits(@CurrentUser() user: RequestUser) {
    return this.stylingService.outfits(user);
  }
}
