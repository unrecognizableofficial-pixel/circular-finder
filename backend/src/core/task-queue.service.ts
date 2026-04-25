import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { AI_AGENT_QUEUE } from "@/common/queues/queue.constants";

@Injectable()
export class TaskQueueService {
  constructor(@InjectQueue(AI_AGENT_QUEUE) private readonly queue: Queue) {}

  async enqueue(name: string, payload: Record<string, unknown>, priority = 3) {
    return this.queue.add(name, payload, {
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 200,
      priority
    });
  }
}
