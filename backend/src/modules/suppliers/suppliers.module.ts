import { Module } from "@nestjs/common";
import { SuppliersController } from "@/modules/suppliers/suppliers.controller";
import { SuppliersService } from "@/modules/suppliers/suppliers.service";

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService]
})
export class SuppliersModule {}
