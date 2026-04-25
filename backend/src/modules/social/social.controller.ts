import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { CreateCommentDto } from "@/modules/social/dto/create-comment.dto";
import { CreatePostDto } from "@/modules/social/dto/create-post.dto";
import { SocialService } from "@/modules/social/social.service";

@ApiTags("feed")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("feed")
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  @Permissions("feed:publish")
  createPost(@CurrentUser() user: RequestUser, @Body() dto: CreatePostDto) {
    return this.socialService.createPost(user, dto);
  }

  @Delete(":postId")
  @Permissions("feed:publish")
  deletePost(@Param("postId") postId: string, @CurrentUser() user: RequestUser) {
    return this.socialService.deletePost(postId, user);
  }

  @Post(":postId/like")
  @Permissions("feed:read")
  like(@Param("postId") postId: string, @CurrentUser() user: RequestUser) {
    return this.socialService.like(postId, user);
  }

  @Post(":postId/comment")
  @Permissions("feed:read")
  comment(@Param("postId") postId: string, @CurrentUser() user: RequestUser, @Body() dto: CreateCommentDto) {
    return this.socialService.comment(postId, user, dto);
  }

  @Post(":postId/share")
  @Permissions("feed:read")
  share(@Param("postId") postId: string, @CurrentUser() user: RequestUser) {
    return this.socialService.share(postId, user);
  }

  @Post(":postId/save")
  @Permissions("feed:read")
  save(@Param("postId") postId: string, @CurrentUser() user: RequestUser) {
    return this.socialService.save(postId, user);
  }

  @Get("following")
  @Permissions("feed:read")
  following(@CurrentUser() user: RequestUser) {
    return this.socialService.personalizedFeed(user);
  }

  @Get("trending")
  @Permissions("feed:read")
  trending() {
    return this.socialService.trendingFeed();
  }

  @Get("suggested")
  @Permissions("feed:read")
  suggested() {
    return this.socialService.suggestedFeed();
  }

  @Get("suggested-follows")
  @Permissions("feed:read")
  suggestedFollows() {
    return this.socialService.suggestedFollows();
  }
}
