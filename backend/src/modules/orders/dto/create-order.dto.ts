import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateOrderDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  inventoryId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  shippingLine1!: string;

  @IsString()
  shippingCity!: string;

  @IsString()
  shippingCountry!: string;
}
