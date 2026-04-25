import { Injectable } from "@nestjs/common";
import { Prisma, SettingScope } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { UpdateSettingDto } from "@/modules/settings/dto/update-setting.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  getMySettings(user: RequestUser) {
    return this.prisma.setting.findMany({
      where: {
        OR: [
          { scope: SettingScope.PLATFORM },
          { scope: SettingScope.USER, scopeId: user.sub }
        ]
      },
      orderBy: { createdAt: "asc" }
    });
  }

  upsert(dto: UpdateSettingDto, user?: RequestUser) {
    const scopeId = dto.scope === SettingScope.USER ? dto.scopeId ?? user?.sub ?? "" : dto.scopeId ?? "";

    return this.prisma.setting.upsert({
      where: {
        scope_scopeId_key: {
          scope: dto.scope,
          scopeId,
          key: dto.key
        }
      },
      update: {
        value: dto.value as Prisma.InputJsonValue
      },
      create: {
        scope: dto.scope,
        scopeId,
        key: dto.key,
        value: dto.value as Prisma.InputJsonValue
      }
    });
  }
}
