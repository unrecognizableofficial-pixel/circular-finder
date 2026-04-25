import { IsBoolean, IsOptional, IsString } from "class-validator";

export class SearchSuppliersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  supplier_type?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  certification?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  labor_standard?: string;

  @IsOptional()
  @IsString()
  demographic?: string;

  @IsOptional()
  @IsBoolean()
  verified_only?: boolean;
}
