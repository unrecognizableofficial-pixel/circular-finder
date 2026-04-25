import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StripeIntegrationService {
  constructor(private readonly configService: ConfigService) {}

  runtime() {
    return {
      configured: Boolean(this.configService.get<string>("integrations.stripeSecretKey")),
      publishableConfigured: Boolean(this.configService.get<string>("integrations.stripePublishableKey"))
    };
  }

  billingSnapshot(plan: string) {
    return {
      plan,
      meter: "enterprise-usage",
      integration: this.runtime()
    };
  }
}
