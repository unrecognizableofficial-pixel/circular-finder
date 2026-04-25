import { IsBooleanString, IsOptional, IsString } from "class-validator";

export class SearchProductsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsBooleanString()
  verified?: string;
}
