import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { UpdateUserStatusDto } from "@/modules/users/dto/update-user-status.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers() {
    return this.prisma.user.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        role: true,
        profile: true
      }
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        profile: true
      }
    });
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return user;
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    await this.getUserById(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        status: dto.status
      }
    });
  }
}
