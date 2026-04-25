import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { AI_AGENT_QUEUE } from "@/common/queues/queue.constants";
import { AiAgentsController } from "@/modules/ai-agents/ai-agents.controller";
import { AiAgentsService } from "@/modules/ai-agents/ai-agents.service";
import { AgentOrchestratorService } from "@/services/agent-orchestrator.service";
import { LegalAgentService } from "@/services/legal-agent.service";
import { FinanceAgentService } from "@/services/finance-agent.service";
import { ProductAgentService } from "@/services/product-agent.service";
import { SupplyChainAgentService } from "@/services/supply-chain-agent.service";
import { InvestorService } from "@/services/investor.service";
import { LegalAgent } from "@/ai-agents/legal-agent";
import { FinanceAgent } from "@/ai-agents/finance-agent";
import { ProductAgent } from "@/ai-agents/product-agent";
import { GrowthAgent } from "@/ai-agents/growth-agent";
import { SupplyChainAgent } from "@/ai-agents/supply-chain-agent";
import { EventBusService } from "@/core/event-bus.service";
import { TaskQueueService } from "@/core/task-queue.service";
import { MemoryStoreService } from "@/core/memory-store.service";
import { DecisionEngineService } from "@/core/decision-engine.service";
import { RiskEngineService } from "@/core/risk-engine.service";
import { AuditLoggerService } from "@/security/audit-logger.service";
import { AiSafetyLayerService } from "@/compliance/ai-safety-layer.service";
import { OpenAiIntegrationService } from "@/integrations/openai.service";

@Module({
  imports: [BullModule.registerQueue({ name: AI_AGENT_QUEUE })],
  controllers: [AiAgentsController],
  providers: [
    AiAgentsService,
    AgentOrchestratorService,
    LegalAgentService,
    FinanceAgentService,
    ProductAgentService,
    SupplyChainAgentService,
    InvestorService,
    LegalAgent,
    FinanceAgent,
    ProductAgent,
    GrowthAgent,
    SupplyChainAgent,
    EventBusService,
    TaskQueueService,
    MemoryStoreService,
    DecisionEngineService,
    RiskEngineService,
    AuditLoggerService,
    AiSafetyLayerService,
    OpenAiIntegrationService
  ],
  exports: [
    AiAgentsService,
    AgentOrchestratorService,
    LegalAgentService,
    FinanceAgentService,
    ProductAgentService,
    SupplyChainAgentService,
    InvestorService,
    MemoryStoreService,
    RiskEngineService
  ]
})
export class AiAgentsModule {}
