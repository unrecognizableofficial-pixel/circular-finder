import { Module } from "@nestjs/common";
import { WardrobeController } from "@/modules/wardrobe/wardrobe.controller";
import { WardrobeService } from "@/modules/wardrobe/wardrobe.service";

@Module({
  controllers: [WardrobeController],
  providers: [WardrobeService],
  exports: [WardrobeService]
})
export class WardrobeModule {}
