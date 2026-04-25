import { Module } from "@nestjs/common";
import { WardrobeModule } from "@/modules/wardrobe/wardrobe.module";
import { StylingController } from "@/modules/styling/styling.controller";
import { StylingService } from "@/modules/styling/styling.service";

@Module({
  imports: [WardrobeModule],
  controllers: [StylingController],
  providers: [StylingService]
})
export class StylingModule {}
