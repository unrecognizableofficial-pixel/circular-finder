import { Module } from "@nestjs/common";
import { FollowsController } from "@/modules/social/follows.controller";
import { SocialController } from "@/modules/social/social.controller";
import { SocialService } from "@/modules/social/social.service";

@Module({
  controllers: [SocialController, FollowsController],
  providers: [SocialService],
  exports: [SocialService]
})
export class SocialModule {}
