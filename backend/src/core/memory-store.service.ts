import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { toInputJsonValue } from "@/common/utils/json.util";

@Injectable()
export class MemoryStoreService {
  constructor(private readonly prisma: PrismaService) {}

  async remember(organizationId: string | null | undefined, namespace: string, key: string, value: unknown, tags: string[] = []) {
    const jsonValue = toInputJsonValue(value);
    const jsonTags = toInputJsonValue(tags);

    if (!organizationId) {
      const existing = await this.prisma.agentMemory.findFirst({
        where: {
          organizationId: null,
          namespace,
          key
        }
      });

      if (existing) {
        return this.prisma.agentMemory.update({
          where: { id: existing.id },
          data: {
            value: jsonValue,
            tags: jsonTags
          }
        });
      }

      return this.prisma.agentMemory.create({
        data: {
          organizationId: null,
          namespace,
          key,
          value: jsonValue,
          tags: jsonTags
        }
      });
    }

    return this.prisma.agentMemory.upsert({
      where: {
        organizationId_namespace_key: {
          organizationId,
          namespace,
          key
        }
      },
      update: {
        value: jsonValue,
        tags: jsonTags
      },
      create: {
        organizationId,
        namespace,
        key,
        value: jsonValue,
        tags: jsonTags
      }
    });
  }

  async recall(organizationId: string | null | undefined, namespace: string) {
    return this.prisma.agentMemory.findMany({
      where: {
        organizationId: organizationId ?? null,
        namespace
      },
      orderBy: { updatedAt: "desc" }
    });
  }
}
