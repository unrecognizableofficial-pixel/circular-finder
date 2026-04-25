import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { SearchPassportsDto } from "@/modules/passports/dto/search-passports.dto";
import { PassportsService } from "@/modules/passports/passports.service";

@ApiTags("passports")
@ApiBearerAuth()
@Controller("passports")
export class PassportsController {
  constructor(private readonly passportsService: PassportsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("passports:read")
  list(@Query() query: SearchPassportsDto) {
    return this.passportsService.list(query);
  }

  @Get(":code")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("passports:read")
  getOne(@Param("code") code: string) {
    return this.passportsService.getOne(code);
  }

  @Post("product/:productId/ensure")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("passports:manage")
  ensure(@Param("productId") productId: string) {
    return this.passportsService.ensureForProduct(productId);
  }
}
