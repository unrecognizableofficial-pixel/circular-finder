import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "@/common/guards/optional-jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { LookupScanDto } from "@/modules/scanner/dto/lookup-scan.dto";
import { UploadScanDto } from "@/modules/scanner/dto/upload-scan.dto";
import { ScannerService } from "@/modules/scanner/scanner.service";

type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

@ApiTags("scanner")
@ApiBearerAuth()
@Controller("scanner")
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post("lookup")
  @UseGuards(OptionalJwtAuthGuard)
  lookup(@Body() dto: LookupScanDto, @CurrentUser() user?: RequestUser) {
    return this.scannerService.lookup(dto, user);
  }

  @Post("upload")
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  upload(@UploadedFile() file: UploadedImageFile | undefined, @Body() dto: UploadScanDto, @CurrentUser() user?: RequestUser) {
    return this.scannerService.upload(file, dto, user);
  }

  @Get("history")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("scanner:lookup")
  history() {
    return this.scannerService.history();
  }
}
