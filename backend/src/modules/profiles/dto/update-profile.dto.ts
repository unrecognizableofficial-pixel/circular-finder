import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  nearbyEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stylePreferences?: string[];
}
