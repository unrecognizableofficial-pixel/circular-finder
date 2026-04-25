import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { CreateOrderDto } from "@/modules/orders/dto/create-order.dto";
import { OrdersService } from "@/modules/orders/orders.service";

@ApiTags("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Permissions("marketplace:browse")
  listOrders(@CurrentUser() user: RequestUser) {
    return this.ordersService.listOrders(user);
  }

  @Post("checkout")
  @Permissions("marketplace:browse")
  checkout(@CurrentUser() user: RequestUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.checkout(user, dto);
  }

  @Patch(":id/status/:status")
  @Permissions("orders:manage")
  updateStatus(@Param("id") id: string, @Param("status") status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }
}
