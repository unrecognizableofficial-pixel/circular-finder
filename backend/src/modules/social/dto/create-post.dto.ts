import { IsOptional, IsString } from "class-validator";

export class CreatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  caption!: string;

  @IsOptional()
  @IsString()
  autoCaption?: string;

  @IsOptional()
  @IsString()
  cta?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  subBrandId?: string;

  @IsOptional()
  @IsString()
  mediaAssetId?: string;

  @IsOptional()
  @IsString()
  circularIdId?: string;
}
