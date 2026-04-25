import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { CreateSignedUploadDto } from "@/modules/files/dto/create-signed-upload.dto";
import { FilesService } from "@/modules/files/files.service";

@ApiTags("files")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("signed-upload")
  @Permissions("files:upload")
  createSignedUpload(@CurrentUser() user: RequestUser, @Body() dto: CreateSignedUploadDto) {
    return this.filesService.createSignedUpload(user, dto);
  }
}
