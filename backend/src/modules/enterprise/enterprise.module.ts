import { Module } from "@nestjs/common";
import { EnterpriseController } from "@/modules/enterprise/enterprise.controller";
import { EnterpriseService } from "@/modules/enterprise/enterprise.service";
import { AiAgentsModule } from "@/modules/ai-agents/ai-agents.module";
import { PassportsModule } from "@/modules/passports/passports.module";
import { GdprEngineService } from "@/compliance/gdpr-engine.service";
import { CcpaEngineService } from "@/compliance/ccpa-engine.service";
import { AgeVerificationService } from "@/compliance/age-verification.service";
import { StripeIntegrationService } from "@/integrations/stripe.service";
import { SupabaseIntegrationService } from "@/integrations/supabase.service";

@Module({
  imports: [AiAgentsModule, PassportsModule],
  controllers: [EnterpriseController],
  providers: [
    EnterpriseService,
    GdprEngineService,
    CcpaEngineService,
    AgeVerificationService,
    StripeIntegrationService,
    SupabaseIntegrationService
  ],
  exports: [EnterpriseService]
})
export class EnterpriseModule {}
