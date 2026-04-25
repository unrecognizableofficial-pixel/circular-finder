import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAnalyticsEventDto {
  @IsString()
  eventName!: string;

  @IsString()
  resourceType!: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsNumber()
  metricValue?: number;
}
