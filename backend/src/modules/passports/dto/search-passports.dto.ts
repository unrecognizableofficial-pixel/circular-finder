import { IsOptional, IsString } from "class-validator";

export class SearchPassportsDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  productId?: string;
}
