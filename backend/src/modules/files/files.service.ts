import { Injectable } from "@nestjs/common";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateSignedUploadDto } from "@/modules/files/dto/create-signed-upload.dto";
import { S3StorageProvider } from "@/modules/files/providers/s3-storage.provider";

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3StorageProvider: S3StorageProvider
  ) {}

  async createSignedUpload(user: RequestUser, dto: CreateSignedUploadDto) {
    const signed = await this.s3StorageProvider.createSignedUpload(dto.fileName, dto.mimeType);

    const asset = await this.prisma.mediaAsset.create({
      data: {
        ownerId: user.sub,
        brandId: dto.brandId,
        subBrandId: dto.subBrandId,
        type: dto.type,
        bucket: signed.bucket,
        objectKey: signed.objectKey,
        url: signed.publicUrl,
        mimeType: dto.mimeType,
        bytes: 0
      }
    });

    return { ...signed, assetId: asset.id };
  }
}
