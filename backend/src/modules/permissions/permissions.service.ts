import { Injectable } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { parseRoleKey } from "@/common/utils/role-key.util";
import { CheckPermissionDto } from "@/modules/permissions/dto/check-permission.dto";

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }]
    });
  }

  async can(dto: CheckPermissionDto) {
    const parsedRoleKey = parseRoleKey(dto.roleKey);
    if (!parsedRoleKey) {
      return { allowed: false, reason: "Unknown role." };
    }

    if (parsedRoleKey === RoleKey.MASTER_BRAND_ADMIN) {
      return { allowed: true, reason: "Master Brand Admin override." };
    }

    const role = await this.prisma.role.findUnique({
      where: { key: parsedRoleKey },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    const permissionKey = `${dto.resource}:${dto.action}`;
    const allowed = role?.permissions.some((entry) => entry.permission.key === permissionKey) ?? false;
    return { allowed, permissionKey };
  }
}
