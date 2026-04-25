import { Injectable } from "@nestjs/common";

@Injectable()
export class CcpaEngineService {
  assess(input: { noSellPolicy: boolean; disclosureReady: boolean; deleteReady: boolean }) {
    const score = [input.noSellPolicy, input.disclosureReady, input.deleteReady].filter(Boolean).length * 33;
    return {
      framework: "CCPA",
      readinessScore: Math.min(100, score),
      controls: input
    };
  }
}
