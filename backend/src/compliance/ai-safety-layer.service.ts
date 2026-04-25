import { Injectable } from "@nestjs/common";

@Injectable()
export class AiSafetyLayerService {
  evaluate(prompt: string, payload: Record<string, unknown> = {}) {
    const normalized = `${prompt} ${JSON.stringify(payload)}`.toLowerCase();
    const flags = [
      normalized.includes("ignore previous"),
      normalized.includes("override policy"),
      normalized.includes("disable safety")
    ].filter(Boolean).length;

    return {
      safe: flags === 0,
      flags,
      recommendation: flags === 0 ? "allow" : "escalate"
    };
  }
}
