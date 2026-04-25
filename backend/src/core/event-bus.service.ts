import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

export type CircularFinderEvent =
  | "product_created"
  | "supplier_verified"
  | "passport_generated"
  | "ai_task_requested"
  | "contract_generated"
  | "compliance_violation_detected";

@Injectable()
export class EventBusService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit<T>(event: CircularFinderEvent, payload: T) {
    this.eventEmitter.emit(event, payload);
  }

  async emitAsync<T>(event: CircularFinderEvent, payload: T) {
    await this.eventEmitter.emitAsync(event, payload);
  }
}
