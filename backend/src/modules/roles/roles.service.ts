import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { parseRoleKey } from "@/common/utils/role-key.util";
import { AssignPermissionsDto } from "@/modules/roles/dto/assign-permissions.dto";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  listRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async assignPermissions(roleKey: string, dto: AssignPermissionsDto) {
    const parsedRoleKey = parseRoleKey(roleKey);
    if (!parsedRoleKey) {
      throw new BadRequestException("Role key is invalid.");
    }

    const role = await this.prisma.role.findUnique({ where: { key: parsedRoleKey } });
    if (!role) {
      throw new NotFoundException("Role not found.");
    }

    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: dto.permissionKeys } }
    });

    await this.prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await this.prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id
      }))
    });

    return this.listRoles();
  }
}
