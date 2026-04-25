import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { FinanceAgent } from "@/ai-agents/finance-agent";

@Injectable()
export class FinanceAgentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financeAgent: FinanceAgent
  ) {}

  async buildRevenueModel(organizationId?: string) {
    const reports = await this.prisma.investorReport.findMany({
      where: { organizationId: organizationId ?? undefined },
      orderBy: { updatedAt: "desc" },
      take: 3
    });

    return this.financeAgent.run({
      organizationId,
      taskType: "finance.revenue_model",
      payload: {
        monthlyRevenue: reports[0]?.metrics && typeof reports[0].metrics === "object" ? Number((reports[0].metrics as Record<string, unknown>).arr ?? 180000) / 12 : 180000,
        pipelineGrowth: 0.16
      }
    });
  }
}
