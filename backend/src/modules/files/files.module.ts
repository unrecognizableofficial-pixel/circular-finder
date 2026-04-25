import { Module } from "@nestjs/common";
import { FilesController } from "@/modules/files/files.controller";
import { FilesService } from "@/modules/files/files.service";
import { S3StorageProvider } from "@/modules/files/providers/s3-storage.provider";

@Module({
  controllers: [FilesController],
  providers: [FilesService, S3StorageProvider],
  exports: [FilesService]
})
export class FilesModule {}
