import { IsNumber, IsOptional, IsString } from "class-validator";

export class TransferOwnershipDto {
  @IsOptional()
  @IsString()
  fromUserId?: string;

  @IsOptional()
  @IsString()
  toUserId?: string;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
