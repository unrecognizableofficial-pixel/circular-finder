import { Module } from "@nestjs/common";
import { MarketplaceController } from "@/modules/marketplace/marketplace.controller";
import { MarketplaceService } from "@/modules/marketplace/marketplace.service";

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService]
})
export class MarketplaceModule {}
