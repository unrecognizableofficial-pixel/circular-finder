export type AgentTaskContext = {
  organizationId?: string;
  taskType: string;
  payload: Record<string, unknown>;
};

export type AgentExecutionResult = {
  agentName: string;
  domain: string;
  confidence: number;
  recommendation: string;
  structuredOutput: Record<string, unknown>;
  riskScore: number;
};

export abstract class BaseAgent {
  abstract readonly agentName: string;
  abstract readonly domain: string;

  supports(taskType: string) {
    return taskType.startsWith(this.domain) || taskType.includes(this.domain);
  }

  protected result(recommendation: string, structuredOutput: Record<string, unknown>, confidence: number, riskScore: number): AgentExecutionResult {
    return {
      agentName: this.agentName,
      domain: this.domain,
      confidence,
      recommendation,
      structuredOutput,
      riskScore
    };
  }

  abstract run(task: AgentTaskContext): Promise<AgentExecutionResult>;
}
