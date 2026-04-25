import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { SocialService } from "@/modules/social/social.service";

@ApiTags("follows")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("follows")
export class FollowsController {
  constructor(private readonly socialService: SocialService) {}

  @Get("me")
  @Permissions("feed:read")
  relationships(@CurrentUser() user: RequestUser) {
    return this.socialService.relationships(user);
  }

  @Get("suggested")
  @Permissions("feed:read")
  suggested() {
    return this.socialService.suggestedFollows();
  }

  @Post(":userId")
  @Permissions("feed:read")
  follow(@Param("userId") userId: string, @CurrentUser() user: RequestUser) {
    return this.socialService.follow(userId, user);
  }

  @Delete(":userId")
  @Permissions("feed:read")
  unfollow(@Param("userId") userId: string, @CurrentUser() user: RequestUser) {
    return this.socialService.unfollow(userId, user);
  }
}
