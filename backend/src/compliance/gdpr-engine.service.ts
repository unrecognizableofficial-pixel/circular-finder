import { Injectable } from "@nestjs/common";

@Injectable()
export class GdprEngineService {
  assess(input: { hasDpa: boolean; hasDeletionWorkflow: boolean; dataMinimized: boolean }) {
    const score = [input.hasDpa, input.hasDeletionWorkflow, input.dataMinimized].filter(Boolean).length * 33;
    return {
      framework: "GDPR",
      readinessScore: Math.min(100, score),
      controls: {
        dpa: input.hasDpa,
        deletionWorkflow: input.hasDeletionWorkflow,
        dataMinimized: input.dataMinimized
      }
    };
  }
}
