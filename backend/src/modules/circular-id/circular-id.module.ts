import { Module } from "@nestjs/common";
import { CircularIdController } from "@/modules/circular-id/circular-id.controller";
import { CircularIdService } from "@/modules/circular-id/circular-id.service";

@Module({
  controllers: [CircularIdController],
  providers: [CircularIdService],
  exports: [CircularIdService]
})
export class CircularIdModule {}
