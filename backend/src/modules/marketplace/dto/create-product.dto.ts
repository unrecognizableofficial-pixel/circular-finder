import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  brandId!: string;

  @IsOptional()
  @IsString()
  subBrandId?: string;

  @IsString()
  name!: string;

  @IsString()
  sku!: string;

  @IsString()
  category!: string;

  @IsString()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  materials!: string[];

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  carbonScore!: number;

  @IsNumber()
  repairabilityScore!: number;

  @IsNumber()
  sustainabilityScore!: number;

  @IsNumber()
  reuseValue!: number;

  @IsString()
  fitGuidance!: string;

  @IsString()
  careInstructions!: string;

  @IsString()
  origin!: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
