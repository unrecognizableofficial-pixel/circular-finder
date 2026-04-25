import { IsOptional, IsString } from "class-validator";

export class UploadScanDto {
  @IsOptional()
  @IsString()
  hints?: string;

  @IsOptional()
  @IsString()
  brand_hint?: string;
}
