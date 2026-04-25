import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class CreateCircularIdDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  inventoryId?: string;

  @IsString()
  origin!: string;

  @IsArray()
  @IsString({ each: true })
  materials!: string[];

  @IsString()
  fitGuidance!: string;

  @IsString()
  repairGuide!: string;

  @IsString()
  careInstructions!: string;

  @IsInt()
  sustainabilityScore!: number;
}
