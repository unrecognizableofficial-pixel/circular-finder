import { Injectable } from "@nestjs/common";

export type ImpactInputs = {
  materialsScore: number;
  emissionsScore: number;
  transportScore: number;
  recyclabilityScore: number;
  durabilityScore: number;
};

@Injectable()
export class RiskEngineService {
  computeImpactScore(input: ImpactInputs) {
    const normalizedScore = Math.round(
      input.materialsScore * 0.24 +
        input.emissionsScore * 0.2 +
        input.transportScore * 0.14 +
        input.recyclabilityScore * 0.2 +
        input.durabilityScore * 0.22
    );

    const transparencyConfidence = Math.round((input.materialsScore + input.durabilityScore + input.recyclabilityScore) / 3);

    return {
      normalizedScore: Math.max(0, Math.min(100, normalizedScore)),
      transparencyConfidence,
      categoryBreakdown: input
    };
  }

  computeLegalReadiness(complianceEvents: number, openDocuments: number) {
    return Math.max(40, 96 - complianceEvents * 6 - openDocuments * 4);
  }

  computeComplianceReadiness(complianceScore: number, supplierRiskAverage: number) {
    return Math.max(35, Math.round(complianceScore * 0.68 + (100 - supplierRiskAverage) * 0.32));
  }

  computeAgentRisk(baseRisk: number, unresolvedIssues: number, escalationCount: number) {
    return Math.max(0, Math.min(100, Math.round(baseRisk + unresolvedIssues * 6 + escalationCount * 8)));
  }
}
