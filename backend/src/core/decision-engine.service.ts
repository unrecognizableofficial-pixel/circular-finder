import { Injectable } from "@nestjs/common";

type AgentDecision = {
  agentName: string;
  confidence?: number;
  riskScore?: number;
  recommendation?: string;
  output?: Record<string, unknown>;
};

@Injectable()
export class DecisionEngineService {
  resolve(decisions: AgentDecision[]) {
    const ranked = [...decisions].sort((left, right) => {
      const rightScore = (right.confidence ?? 0.5) * 100 - (right.riskScore ?? 0);
      const leftScore = (left.confidence ?? 0.5) * 100 - (left.riskScore ?? 0);
      return rightScore - leftScore;
    });

    const winner = ranked[0];
    return {
      winner: winner?.agentName ?? "system",
      recommendation: winner?.recommendation ?? "Monitor",
      conflictDetected: ranked.length > 1 && (ranked[0]?.recommendation ?? "") !== (ranked[1]?.recommendation ?? ""),
      mergedOutput: ranked.map((entry) => ({
        agent: entry.agentName,
        confidence: entry.confidence ?? 0.5,
        riskScore: entry.riskScore ?? 0,
        output: entry.output ?? {}
      }))
    };
  }
}
