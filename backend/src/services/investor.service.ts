import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { RiskEngineService } from "@/core/risk-engine.service";

@Injectable()
export class InvestorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly riskEngine: RiskEngineService
  ) {}

  async readiness(organizationId?: string) {
    const [report, legalDocs, complianceEvents, suppliers] = await Promise.all([
      this.prisma.investorReport.findFirst({
        where: { organizationId: organizationId ?? undefined },
        orderBy: { updatedAt: "desc" }
      }),
      this.prisma.legalDocument.count({
        where: {
          organizationId: organizationId ?? undefined,
          status: {
            not: "APPROVED"
          }
        }
      }),
      this.prisma.complianceEvent.count(),
      this.prisma.supplierRecord.findMany({
        where: { organizationId: organizationId ?? undefined },
        select: { riskScore: true }
      })
    ]);

    const supplierRiskAverage =
      suppliers.length === 0 ? 18 : Math.round(suppliers.reduce((total: number, entry) => total + entry.riskScore, 0) / suppliers.length);

    return {
      report,
      legalReadinessScore: report?.legalReadinessScore ?? this.riskEngine.computeLegalReadiness(complianceEvents, legalDocs),
      complianceReadinessScore: report?.complianceReadinessScore ?? this.riskEngine.computeComplianceReadiness(88, supplierRiskAverage),
      dataRoomExport: report?.dataRoomExport ?? {
        ready: true,
        generatedAt: new Date().toISOString()
      }
    };
  }
}
