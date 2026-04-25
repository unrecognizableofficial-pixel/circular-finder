import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { SupplyChainAgent } from "@/ai-agents/supply-chain-agent";

@Injectable()
export class SupplyChainAgentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supplyChainAgent: SupplyChainAgent
  ) {}

  async supplyChainSnapshot(organizationId?: string) {
    const [suppliers, manufacturers] = await Promise.all([
      this.prisma.supplierRecord.findMany({
        where: { organizationId: organizationId ?? undefined },
        orderBy: [{ riskScore: "desc" }, { sustainabilityScore: "asc" }],
        take: 20
      }),
      this.prisma.manufacturer.findMany({
        where: { organizationId: organizationId ?? undefined },
        orderBy: { complianceScore: "asc" },
        take: 10
      })
    ]);

    const agent = await this.supplyChainAgent.run({
      organizationId,
      taskType: "supply-chain.snapshot",
      payload: {
        supplierCount: suppliers.length,
        manufacturerCount: manufacturers.length
      }
    });

    return {
      suppliers,
      manufacturers,
      agent
    };
  }
}
