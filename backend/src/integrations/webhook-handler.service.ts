import { Injectable, UnauthorizedException } from "@nestjs/common";
import { EventBusService, type CircularFinderEvent } from "@/core/event-bus.service";
import { WebhookVerifierService } from "@/security/webhook-verifier.service";

@Injectable()
export class WebhookHandlerService {
  constructor(
    private readonly verifier: WebhookVerifierService,
    private readonly eventBus: EventBusService
  ) {}

  ingest(event: CircularFinderEvent, payload: string, signature?: string) {
    if (!this.verifier.verify(payload, signature)) {
      throw new UnauthorizedException("Invalid webhook signature.");
    }

    const parsed = JSON.parse(payload) as Record<string, unknown>;
    this.eventBus.emit(event, parsed);
    return {
      accepted: true,
      event
    };
  }
}
