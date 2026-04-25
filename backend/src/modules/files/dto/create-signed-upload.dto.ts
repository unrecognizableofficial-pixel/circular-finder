import { IsEnum, IsOptional, IsString } from "class-validator";
import { MediaAssetType } from "@prisma/client";

export class CreateSignedUploadDto {
  @IsEnum(MediaAssetType)
  type!: MediaAssetType;

  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  subBrandId?: string;
}
