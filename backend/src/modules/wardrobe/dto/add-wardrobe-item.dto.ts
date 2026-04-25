import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class AddWardrobeItemDto {
  @IsString()
  passport_id!: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchase_price?: number;
}
