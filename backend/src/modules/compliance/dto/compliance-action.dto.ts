import { IsEnum, IsOptional, IsString } from "class-validator";
import { ComplianceActionType } from "@prisma/client";

export class ComplianceActionDto {
  @IsEnum(ComplianceActionType)
  action!: ComplianceActionType;

  @IsOptional()
  @IsString()
  reason?: string;
}
