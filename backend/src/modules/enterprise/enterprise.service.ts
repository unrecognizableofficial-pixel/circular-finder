import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { LegalAgentService } from "@/services/legal-agent.service";
import { FinanceAgentService } from "@/services/finance-agent.service";
import { ProductAgentService } from "@/services/product-agent.service";
import { SupplyChainAgentService } from "@/services/supply-chain-agent.service";
import { InvestorService } from "@/services/investor.service";
import { GdprEngineService } from "@/compliance/gdpr-engine.service";
import { CcpaEngineService } from "@/compliance/ccpa-engine.service";
import { AgeVerificationService } from "@/compliance/age-verification.service";
import { StripeIntegrationService } from "@/integrations/stripe.service";
import { SupabaseIntegrationService } from "@/integrations/supabase.service";

@Injectable()
export class EnterpriseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly legalAgentService: LegalAgentService,
    private readonly financeAgentService: FinanceAgentService,
    private readonly productAgentService: ProductAgentService,
    private readonly supplyChainAgentService: SupplyChainAgentService,
    private readonly investorService: InvestorService,
    private readonly gdprEngine: GdprEngineService,
    private readonly ccpaEngine: CcpaEngineService,
    private readonly ageVerification: AgeVerificationService,
    private readonly stripeIntegration: StripeIntegrationService,
    private readonly supabaseIntegration: SupabaseIntegrationService
  ) {}

  async contracts(organizationId?: string) {
    return this.legalAgentService.generateContractBrief(organizationId);
  }

  async analytics(organizationId?: string) {
    const [organization, passports, scores, tasks] = await Promise.all([
      this.resolveOrganization(organizationId),
      this.prisma.digitalProductPassport.count({
        where: { organizationId: organizationId ?? undefined }
      }),
      this.prisma.sustainabilityScore.findMany({
        where: { organizationId: organizationId ?? undefined },
        take: 50
      }),
      this.prisma.agentTask.findMany({
        where: { organizationId: organizationId ?? undefined },
        orderBy: { updatedAt: "desc" },
        take: 20
      })
    ]);

    const averageImpactScore =
      scores.length === 0 ? 0 : Math.round(scores.reduce((total: number, entry) => total + entry.normalizedScore, 0) / scores.length);

    return {
      organization,
      passports,
      averageImpactScore,
      recentTasks: tasks
    };
  }

  async supplyChain(organizationId?: string) {
    return this.supplyChainAgentService.supplyChainSnapshot(organizationId);
  }

  async complianceReport(organizationId?: string) {
    const [organization, openDocuments, complianceEvents, supplierRisk] = await Promise.all([
      this.resolveOrganization(organizationId),
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

    const gdpr = this.gdprEngine.assess({
      hasDpa: openDocuments < 3,
      hasDeletionWorkflow: true,
      dataMinimized: true
    });
    const ccpa = this.ccpaEngine.assess({
      noSellPolicy: true,
      disclosureReady: true,
      deleteReady: true
    });

    return {
      organization,
      complianceEvents,
      supplierRiskAverage:
        supplierRisk.length === 0 ? 0 : Math.round(supplierRisk.reduce((total: number, entry) => total + entry.riskScore, 0) / supplierRisk.length),
      gdpr,
      ccpa,
      agePolicy: this.ageVerification.verify(18)
    };
  }

  async investorReadiness(organizationId?: string) {
    const [organization, readiness, finance, product, stripe, supabase] = await Promise.all([
      this.resolveOrganization(organizationId),
      this.investorService.readiness(organizationId),
      this.financeAgentService.buildRevenueModel(organizationId),
      this.productAgentService.passportCoverage(organizationId),
      Promise.resolve(this.stripeIntegration.billingSnapshot("enterprise")),
      Promise.resolve(this.supabaseIntegration.runtime())
    ]);

    return {
      organization,
      readiness,
      finance,
      product,
      billing: stripe,
      dataPlatform: supabase
    };
  }

  async dataRoomExport(organizationId?: string) {
    const readiness = await this.investorService.readiness(organizationId);
    return {
      exportName: `data-room-${organizationId ?? "platform"}.json`,
      createdAt: new Date().toISOString(),
      payload: readiness
    };
  }

  private resolveOrganization(organizationId?: string) {
    if (organizationId) {
      return this.prisma.organization.findUnique({
        where: { id: organizationId }
      });
    }

    return this.prisma.organization.findFirst({
      orderBy: { createdAt: "asc" }
    });
  }
}
