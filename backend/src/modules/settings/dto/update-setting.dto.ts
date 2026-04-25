import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { SettingScope } from "@prisma/client";

export class UpdateSettingDto {
  @IsEnum(SettingScope)
  scope!: SettingScope;

  @IsOptional()
  @IsString()
  scopeId?: string;

  @IsString()
  key!: string;

  @IsObject()
  value!: Record<string, unknown>;
}
