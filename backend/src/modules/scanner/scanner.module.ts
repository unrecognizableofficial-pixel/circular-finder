import { Module } from "@nestjs/common";
import { OptionalJwtAuthGuard } from "@/common/guards/optional-jwt-auth.guard";
import { ScannerController } from "@/modules/scanner/scanner.controller";
import { ScannerService } from "@/modules/scanner/scanner.service";
import { VisionMatchingService } from "@/modules/scanner/vision-matching.service";

@Module({
  controllers: [ScannerController],
  providers: [ScannerService, VisionMatchingService, OptionalJwtAuthGuard],
  exports: [ScannerService, VisionMatchingService]
})
export class ScannerModule {}
