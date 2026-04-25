import { IsOptional, IsString } from "class-validator";

export class ApprovePresetDto {
  @IsOptional()
  @IsString()
  approvedById?: string;
}
