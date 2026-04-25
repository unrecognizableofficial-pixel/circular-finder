import { Injectable } from "@nestjs/common";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { AgentOrchestratorService } from "@/services/agent-orchestrator.service";
import { RequestAgentTaskDto } from "@/modules/ai-agents/dto/request-agent-task.dto";

@Injectable()
export class AiAgentsService {
  constructor(private readonly orchestrator: AgentOrchestratorService) {}

  catalog() {
    return this.orchestrator.listAgents();
  }

  tasks(organizationId?: string) {
    return this.orchestrator.listTasks(organizationId);
  }

  logs(organizationId?: string) {
    return this.orchestrator.listLogs(organizationId);
  }

  requestTask(actor: RequestUser | undefined, dto: RequestAgentTaskDto) {
    return this.orchestrator.requestTask(actor, dto);
  }
}
