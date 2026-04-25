import { BadRequestException, Injectable } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { CreateOrderDto } from "@/modules/orders/dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  listOrders(user: RequestUser) {
    return this.prisma.order.findMany({
      where: {
        OR: [{ buyerId: user.sub }, { sellerId: user.sub }]
      },
      include: {
        product: true,
        inventory: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async checkout(user: RequestUser, dto: CreateOrderDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) {
      throw new BadRequestException("Product not found.");
    }

    const inventory = dto.inventoryId
      ? await this.prisma.inventory.findUnique({ where: { id: dto.inventoryId } })
      : null;

    const subtotal = Number(product.price) * dto.quantity;
    const tax = subtotal * 0.08;
    const shipping = 12;

    return this.prisma.order.create({
      data: {
        productId: dto.productId,
        inventoryId: dto.inventoryId,
        buyerId: user.sub,
        sellerId: inventory?.vendorId,
        quantity: dto.quantity,
        status: OrderStatus.CHECKOUT_PENDING,
        subtotal,
        tax,
        shipping,
        total: subtotal + tax + shipping,
        shippingAddress: {
          line1: dto.shippingLine1,
          city: dto.shippingCity,
          country: dto.shippingCountry
        }
      }
    });
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}
