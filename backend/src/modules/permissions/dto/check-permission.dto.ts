import { IsString } from "class-validator";

export class CheckPermissionDto {
  @IsString()
  roleKey!: string;

  @IsString()
  action!: string;

  @IsString()
  resource!: string;
}
