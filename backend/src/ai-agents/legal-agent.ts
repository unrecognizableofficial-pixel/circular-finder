import { Injectable } from "@nestjs/common";
import { BaseAgent, type AgentTaskContext } from "@/ai-agents/base-agent";
import { OpenAiIntegrationService } from "@/integrations/openai.service";

@Injectable()
export class LegalAgent extends BaseAgent {
  readonly agentName = "legal_agent";
  readonly domain = "legal";

  constructor(private readonly openAi: OpenAiIntegrationService) {
    super();
  }

  async run(task: AgentTaskContext) {
    const summary = await this.openAi.summarizeDomainTask({
      domain: this.domain,
      taskType: task.taskType,
      payload: task.payload
    });

    return this.result(
      "Approve with policy review",
      {
        summary,
        nextSteps: ["review DPA clauses", "confirm IP ownership language", "log governance version"]
      },
      0.86,
      19
    );
  }
}
