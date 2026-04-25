import { IsOptional, IsString } from "class-validator";

export class EnterpriseQueryDto {
  @IsOptional()
  @IsString()
  organizationId?: string;
}
