import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { ANALYTICS_QUEUE } from "@/common/queues/queue.constants";

@Processor(ANALYTICS_QUEUE)
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing analytics job ${job.id}`);
    return job.data;
  }
}
