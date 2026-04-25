import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { ImpactPointType } from "@prisma/client";

export class AwardImpactDto {
  @IsString()
  userId!: string;

  @IsEnum(ImpactPointType)
  type!: ImpactPointType;

  @IsInt()
  points!: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  sourceId?: string;
}
