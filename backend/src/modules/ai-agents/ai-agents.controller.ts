import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { RequestAgentTaskDto } from "@/modules/ai-agents/dto/request-agent-task.dto";
import { AiAgentsService } from "@/modules/ai-agents/ai-agents.service";

@ApiTags("ai-agents")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("ai-agents")
export class AiAgentsController {
  constructor(private readonly aiAgentsService: AiAgentsService) {}

  @Get()
  @Permissions("ai-agents:orchestrate")
  catalog() {
    return this.aiAgentsService.catalog();
  }

  @Get("tasks")
  @Permissions("ai-agents:orchestrate")
  tasks(@Query("organizationId") organizationId?: string) {
    return this.aiAgentsService.tasks(organizationId);
  }

  @Get("logs")
  @Permissions("ai-agents:orchestrate")
  logs(@Query("organizationId") organizationId?: string) {
    return this.aiAgentsService.logs(organizationId);
  }

  @Post("tasks")
  @Permissions("ai-agents:orchestrate")
  requestTask(@CurrentUser() user: RequestUser, @Body() dto: RequestAgentTaskDto) {
    return this.aiAgentsService.requestTask(user, dto);
  }
}
