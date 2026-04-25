import { IsOptional, IsString } from "class-validator";

export class LookupScanDto {
  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  scanType?: string;

  @IsOptional()
  @IsString()
  locationText?: string;
}
