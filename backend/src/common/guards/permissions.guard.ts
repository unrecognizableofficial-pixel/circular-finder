import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleKey } from "@prisma/client";
import { PERMISSIONS_KEY } from "@/common/decorators/permissions.decorator";
import type { RequestUser } from "@/common/interfaces/request-user.interface";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;
    if (!user) {
      return false;
    }

    if (user.role === RoleKey.MASTER_BRAND_ADMIN) {
      return true;
    }

    return requiredPermissions.every((permission) => user.permissions.includes(permission));
  }
}
