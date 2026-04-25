import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { LegalAgent } from "@/ai-agents/legal-agent";

@Injectable()
export class LegalAgentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly legalAgent: LegalAgent
  ) {}

  async generateContractBrief(organizationId?: string) {
    const documents = await this.prisma.legalDocument.findMany({
      where: { organizationId: organizationId ?? undefined },
      orderBy: { updatedAt: "desc" },
      take: 10
    });

    const agent = await this.legalAgent.run({
      organizationId,
      taskType: "legal.contract_brief",
      payload: {
        documentCount: documents.length,
        documentTypes: documents.map((entry: { documentType: string }) => entry.documentType)
      }
    });

    return {
      documents,
      agent
    };
  }
}
