import { IsObject, IsOptional, IsString } from "class-validator";

export class CreateBrandPresetDto {
  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  subBrandId?: string;

  @IsString()
  name!: string;

  @IsString()
  colorFamily!: string;

  @IsString()
  typography!: string;

  @IsObject()
  darkModePreview!: Record<string, unknown>;

  @IsObject()
  lightModePreview!: Record<string, unknown>;
}
