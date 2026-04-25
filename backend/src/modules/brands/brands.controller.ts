import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { BrandsService } from "@/modules/brands/brands.service";
import { CreateBrandPresetDto } from "@/modules/brands/dto/create-brand-preset.dto";

@ApiTags("brands")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @Permissions("brands:manage")
  listBrands() {
    return this.brandsService.listBrands();
  }

  @Get(":id")
  @Permissions("brands:manage")
  getBrand(@Param("id") id: string) {
    return this.brandsService.getBrand(id);
  }

  @Get(":id/sub-brands")
  @Permissions("brands:manage")
  subBrands(@Param("id") id: string) {
    return this.brandsService.subBrands(id);
  }

  @Post("presets")
  @Permissions("brands:manage")
  createPreset(@Body() dto: CreateBrandPresetDto) {
    return this.brandsService.createPreset(dto);
  }
}
