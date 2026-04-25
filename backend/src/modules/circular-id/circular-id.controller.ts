import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { CircularIdService } from "@/modules/circular-id/circular-id.service";
import { CreateCircularIdDto } from "@/modules/circular-id/dto/create-circular-id.dto";
import { TransferOwnershipDto } from "@/modules/circular-id/dto/transfer-ownership.dto";

@ApiTags("circular-id")
@ApiBearerAuth()
@Controller("circular-id")
export class CircularIdController {
  constructor(private readonly circularIdService: CircularIdService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("circular-id:generate")
  create(@Body() dto: CreateCircularIdDto) {
    return this.circularIdService.create(dto);
  }

  @Get(":code")
  getByCode(@Param("code") code: string) {
    return this.circularIdService.getByCode(code);
  }

  @Post(":code/transfer")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("circular-id:transfer")
  transfer(@Param("code") code: string, @Body() dto: TransferOwnershipDto) {
    return this.circularIdService.transfer(code, dto);
  }

  @Post(":code/lifecycle/:state")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("circular-id:transfer")
  lifecycle(@Param("code") code: string, @Param("state") state: string) {
    return this.circularIdService.updateLifecycle(code, state);
  }
}
