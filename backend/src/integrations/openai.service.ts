import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class OpenAiIntegrationService {
  constructor(private readonly configService: ConfigService) {}

  getRuntime() {
    const apiKey = this.configService.get<string>("integrations.openaiApiKey") ?? "";
    return {
      configured: Boolean(apiKey),
      baseUrl: this.configService.get<string>("integrations.openaiBaseUrl") ?? "https://api.openai.com/v1",
      model: this.configService.get<string>("integrations.openaiModel") ?? "gpt-5.4-mini"
    };
  }

  async summarizeDomainTask(task: { domain: string; taskType: string; payload: Record<string, unknown> }) {
    const runtime = this.getRuntime();
    return {
      provider: runtime.configured ? "openai" : "local-fallback",
      model: runtime.model,
      summary: `${task.domain} agent processed ${task.taskType}.`,
      structured: task.payload
    };
  }
}
