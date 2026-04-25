import { IsInt, IsObject, IsOptional, IsString, Max, Min } from "class-validator";

export class RequestAgentTaskDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsString()
  domain!: string;

  @IsString()
  taskType!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;
}
