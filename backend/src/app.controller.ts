import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "@/modules/auth/auth.service";
import { ComplianceService } from "@/modules/compliance/compliance.service";
import { GovernanceService } from "@/modules/governance/governance.service";
import { EnterpriseService } from "@/modules/enterprise/enterprise.service";
import { VisionMatchingService } from "@/modules/scanner/vision-matching.service";

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly visionMatchingService: VisionMatchingService,
    private readonly complianceService: ComplianceService,
    private readonly governanceService: GovernanceService,
    private readonly enterpriseService: EnterpriseService,
    private readonly authService: AuthService
  ) {}

  @Get()
  index() {
    const apiPrefix = this.configService.get<string>("app.apiPrefix");
    return {
      name: this.configService.get<string>("app.name"),
      tagline: this.configService.get<string>("app.tagline"),
      motto: this.configService.get<string>("app.motto"),
      status: "ok",
      apiPrefix: `/${apiPrefix}`,
      docsUrl: `/${apiPrefix}/docs`,
      healthUrl: `/${apiPrefix}/health`,
      scannerVision: this.visionMatchingService.getRuntimeInfo(),
      featuredEndpoints: [
        `/${apiPrefix}/passports`,
        `/${apiPrefix}/ai-agents`,
        `/${apiPrefix}/enterprise/contracts`,
        `/${apiPrefix}/enterprise/analytics`,
        `/${apiPrefix}/enterprise/supply-chain`,
        `/${apiPrefix}/enterprise/compliance-report`,
        `/${apiPrefix}/enterprise/investor-readiness`,
        `/${apiPrefix}/scanner/upload`,
        `/${apiPrefix}/scanner/lookup`,
        `/${apiPrefix}/suppliers/map`,
        `/${apiPrefix}/wardrobe`,
        `/${apiPrefix}/styling/outfits`,
        `/${apiPrefix}/products`,
        `/${apiPrefix}/circular-id/:code`
      ]
    };
  }

  @Get("health")
  health() {
    return {
      status: "ok",
      service: this.configService.get<string>("app.name"),
      timestamp: new Date().toISOString()
    };
  }

  @Get("trust-center")
  async trustCenter() {
    const [complianceReport, investorReadiness, policyCenter, governancePolicies] = await Promise.all([
      this.enterpriseService.complianceReport(),
      this.enterpriseService.investorReadiness(),
      Promise.resolve(this.complianceService.policyCenter()),
      Promise.resolve(this.governanceService.policyHierarchy())
    ]);

    return {
      app: {
        name: this.configService.get<string>("app.name"),
        tagline: this.configService.get<string>("app.tagline"),
        motto: this.configService.get<string>("app.motto"),
        copyright: this.configService.get<string>("app.copyright"),
        trademark: "Circular Finder™",
        contactEmail: "trust@circularfinder.demo"
      },
      privacyCenter: {
        gdpr: complianceReport.gdpr,
        ccpa: complianceReport.ccpa,
        agePolicy: complianceReport.agePolicy,
        dataRights: [
          "Review the privacy center before sharing marketplace or scanner data.",
          "Use account controls to manage notifications, permissions, and saved settings.",
          "Follow no-selling and deletion-ready rules in regions covered by platform privacy policy."
        ]
      },
      legalHub: {
        hierarchy: policyCenter.hierarchy,
        governance: governancePolicies,
        legalReadinessScore: investorReadiness.readiness.legalReadinessScore,
        complianceReadinessScore: investorReadiness.readiness.complianceReadinessScore
      },
      billing: {
        autoRenewDisclosure: "Paid plans renew automatically until canceled from billing controls or your enterprise agreement.",
        cancellationTerms: "Cancellation stops the next renewal cycle and keeps access through the current paid term.",
        refundPolicy: "Refund handling follows your contract terms, checkout disclosures, and marketplace order rules.",
        stripe: investorReadiness.billing
      },
      security: {
        jwtAuth: true,
        roleBasedAccess: true,
        rateLimiting: true,
        encryptedSensitiveFields: true,
        auditLogging: true,
        webhookVerification: true
      },
      aiTransparency: {
        scannerVision: this.visionMatchingService.getRuntimeInfo(),
        disclaimers: [
          "AI-assisted matching supports scanner and fit recommendations, but it should not replace manual review.",
          "Similarity, lighting, and image quality can change confidence outcomes.",
          "Report questionable output through the Legal Hub or Compliance workflow."
        ]
      },
      scanner: {
        cameraPermissionReason: "Camera access is requested only to scan garment labels, product tags, and Circular IDs.",
        imageUsageNotice: "Uploaded images are used to match known products, attach Digital Product Passports, and power demo trust signals.",
        metadataBaking: ["Timestamp", "User ID", "Circular ID", "Location (word form)"]
      },
      passport: {
        scoreMethodology: ["Materials", "Emissions estimates", "Transport distance", "Recyclability", "Durability rating"],
        transparencyDisclaimer:
          "Sustainability indicators are decision-support guidance. Review source records, repair guidance, and supplier disclosures before acting."
      },
      accountManagement: {
        passwordReset: true,
        emailVerification: true,
        oauthProviders: [this.authService.getOAuthBootstrap("google"), this.authService.getOAuthBootstrap("apple")]
      }
    };
  }
}
