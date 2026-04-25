import { createHmac, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WebhookVerifierService {
  constructor(private readonly configService: ConfigService) {}

  verify(payload: string, signature: string | undefined) {
    if (!signature) {
      return false;
    }

    const secret = this.configService.get<string>("integrations.webhookSecret") ?? "circular-finder-webhook-secret";
    const digest = createHmac("sha256", secret).update(payload).digest("hex");
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }
}
