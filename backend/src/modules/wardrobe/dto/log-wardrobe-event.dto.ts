import { IsOptional, IsString } from "class-validator";

export class LogWardrobeEventDto {
  @IsString()
  event_type!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
