import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SupabaseIntegrationService {
  constructor(private readonly configService: ConfigService) {}

  runtime() {
    return {
      configured: Boolean(this.configService.get<string>("integrations.supabaseUrl")),
      url: this.configService.get<string>("integrations.supabaseUrl") ?? ""
    };
  }
}
