import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { EventBusService } from "@/core/event-bus.service";
import { TaskQueueService } from "@/core/task-queue.service";
import { MemoryStoreService } from "@/core/memory-store.service";
import { DecisionEngineService } from "@/core/decision-engine.service";
import { RiskEngineService } from "@/core/risk-engine.service";
import { AuditLoggerService } from "@/security/audit-logger.service";
import { AiSafetyLayerService } from "@/compliance/ai-safety-layer.service";
import { LegalAgent } from "@/ai-agents/legal-agent";
import { FinanceAgent } from "@/ai-agents/finance-agent";
import { ProductAgent } from "@/ai-agents/product-agent";
import { GrowthAgent } from "@/ai-agents/growth-agent";
import { SupplyChainAgent } from "@/ai-agents/supply-chain-agent";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { toInputJsonValue } from "@/common/utils/json.util";

type OrchestratorTaskRequest = {
  organizationId?: string;
  domain: string;
  taskType: string;
  payload: Record<string, unknown>;
  priority?: number;
};

@Injectable()
export class AgentOrchestratorService {
  private readonly agents;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly taskQueue: TaskQueueService,
    private readonly memoryStore: MemoryStoreService,
    private readonly decisionEngine: DecisionEngineService,
    private readonly riskEngine: RiskEngineService,
    private readonly auditLogger: AuditLoggerService,
    private readonly aiSafetyLayer: AiSafetyLayerService,
    legalAgent: LegalAgent,
    financeAgent: FinanceAgent,
    productAgent: ProductAgent,
    growthAgent: GrowthAgent,
    supplyChainAgent: SupplyChainAgent
  ) {
    this.agents = [legalAgent, financeAgent, productAgent, growthAgent, supplyChainAgent];
  }

  listAgents() {
    return this.agents.map((agent) => ({
      agentName: agent.agentName,
      domain: agent.domain
    }));
  }

  async listTasks(organizationId?: string) {
    return this.prisma.agentTask.findMany({
      where: { organizationId: organizationId ?? undefined },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  async listLogs(organizationId?: string) {
    return this.prisma.aiAgentLog.findMany({
      where: { organizationId: organizationId ?? undefined },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  async requestTask(actor: RequestUser | undefined, request: OrchestratorTaskRequest) {
    const safety = this.aiSafetyLayer.evaluate(request.taskType, request.payload);
    if (!safety.safe) {
      throw new NotFoundException("AI task blocked by safety layer.");
    }

    const agent = this.agents.find((entry) => entry.domain === request.domain || entry.supports(request.taskType));
    if (!agent) {
      throw new NotFoundException(`No agent registered for domain ${request.domain}.`);
    }

    const task = await this.prisma.agentTask.create({
      data: {
        organizationId: request.organizationId ?? null,
        agentName: agent.agentName,
        domain: request.domain,
        taskType: request.taskType,
        priority: request.priority ?? 3,
        payload: toInputJsonValue(request.payload),
        status: "RUNNING",
        startedAt: new Date()
      }
    });

    await this.taskQueue.enqueue("ai-task", {
      taskId: task.id,
      agentName: agent.agentName,
      domain: request.domain,
      taskType: request.taskType
    });

    this.eventBus.emit("ai_task_requested", {
      taskId: task.id,
      agentName: agent.agentName,
      organizationId: request.organizationId ?? null
    });

    const result = await agent.run({
      organizationId: request.organizationId,
      taskType: request.taskType,
      payload: request.payload
    });

    const riskScore = this.riskEngine.computeAgentRisk(result.riskScore, 0, safety.flags);
    const decision = this.decisionEngine.resolve([result]);

    const [updatedTask, log] = await this.prisma.$transaction([
      this.prisma.agentTask.update({
        where: { id: task.id },
        data: {
          status: "COMPLETED",
          result: {
            ...result.structuredOutput,
            recommendation: result.recommendation
          },
          completedAt: new Date()
        }
      }),
      this.prisma.aiAgentLog.create({
        data: {
          organizationId: request.organizationId ?? null,
          agentName: result.agentName,
          domain: result.domain,
          taskType: request.taskType,
          status: "COMPLETED",
          input: toInputJsonValue(request.payload),
          output: toInputJsonValue(result.structuredOutput),
          decision: toInputJsonValue(decision),
          riskScore
        }
      })
    ]);

    await this.memoryStore.remember(request.organizationId, "agent_decisions", request.taskType, decision, [result.domain, result.agentName]);
    await this.auditLogger.log(actor?.sub, "agent_task", updatedTask.id, "executed", `${result.agentName} executed ${request.taskType}`, {
      organizationId: request.organizationId ?? null,
      logId: log.id
    });

    return {
      task: updatedTask,
      log,
      decision
    };
  }
}
