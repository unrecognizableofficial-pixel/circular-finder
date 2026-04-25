import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { ProductAgent } from "@/ai-agents/product-agent";

@Injectable()
export class ProductAgentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productAgent: ProductAgent
  ) {}

  async passportCoverage(organizationId?: string) {
    const [products, passports] = await Promise.all([
      this.prisma.product.count({
        where: organizationId
          ? {
              brand: {
                is: {
                  organizationId
                }
              }
            }
          : undefined
      }),
      this.prisma.digitalProductPassport.count({
        where: { organizationId: organizationId ?? undefined }
      })
    ]);

    const agent = await this.productAgent.run({
      organizationId,
      taskType: "product.passport_coverage",
      payload: {
        products,
        passports
      }
    });

    return {
      coverage: products === 0 ? 0 : Number((passports / products).toFixed(2)),
      products,
      passports,
      agent
    };
  }
}
