import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { CreateProductDto } from "@/modules/marketplace/dto/create-product.dto";
import { SearchProductsDto } from "@/modules/marketplace/dto/search-products.dto";
import { MarketplaceService } from "@/modules/marketplace/marketplace.service";

@ApiTags("products")
@ApiBearerAuth()
@Controller("products")
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  listProducts(@Query() query: SearchProductsDto) {
    return this.marketplaceService.listProducts(query);
  }

  @Get(":id")
  getProduct(@Param("id") id: string) {
    return this.marketplaceService.getProduct(id);
  }

  @Get(":id/inventory")
  inventory(@Param("id") id: string) {
    return this.marketplaceService.inventory(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("marketplace:manage")
  createProduct(@Body() dto: CreateProductDto) {
    return this.marketplaceService.createProduct(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("marketplace:manage")
  updateProduct(@Param("id") id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.marketplaceService.updateProduct(id, dto);
  }
}
