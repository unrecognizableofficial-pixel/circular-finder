import { Injectable } from "@nestjs/common";
import { BaseAgent, type AgentTaskContext } from "@/ai-agents/base-agent";

@Injectable()
export class FinanceAgent extends BaseAgent {
  readonly agentName = "finance_agent";
  readonly domain = "finance";

  async run(task: AgentTaskContext) {
    const monthlyRevenue = Number(task.payload.monthlyRevenue ?? 125000);
    const pipelineGrowth = Number(task.payload.pipelineGrowth ?? 0.18);
    return this.result(
      "Scale enterprise expansion",
      {
        revenueModel: {
          monthlyRevenue,
          nextQuarterProjection: Math.round(monthlyRevenue * (1 + pipelineGrowth) * 3),
          grossMarginTarget: 0.74
        }
      },
      0.83,
      17
    );
  }
}
