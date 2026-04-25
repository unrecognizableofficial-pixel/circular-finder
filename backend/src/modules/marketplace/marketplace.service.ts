import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateProductDto } from "@/modules/marketplace/dto/create-product.dto";
import { SearchProductsDto } from "@/modules/marketplace/dto/search-products.dto";

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  listProducts(query: SearchProductsDto) {
    return this.prisma.product.findMany({
      where: {
        category: query.category ?? undefined,
        brandId: query.brandId ?? undefined,
        verified: query.verified ? query.verified === "true" : undefined,
        OR: query.q
          ? [
              { name: { contains: query.q, mode: "insensitive" } },
              { sku: { contains: query.q, mode: "insensitive" } },
              { description: { contains: query.q, mode: "insensitive" } }
            ]
          : undefined
      },
      include: {
        brand: true,
        subBrand: true,
        inventories: true,
        circularIds: true
      },
      take: 50,
      orderBy: [{ sustainabilityScore: "desc" }, { createdAt: "desc" }]
    });
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        subBrand: true,
        inventories: true,
        circularIds: true,
        reviews: true
      }
    });
    if (!product) {
      throw new NotFoundException("Product not found.");
    }
    return product;
  }

  createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        brandId: dto.brandId,
        subBrandId: dto.subBrandId,
        name: dto.name,
        slug: dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sku: dto.sku,
        category: dto.category,
        description: dto.description,
        materials: { composition: dto.materials },
        price: dto.price,
        carbonScore: dto.carbonScore,
        repairabilityScore: dto.repairabilityScore,
        reuseValue: dto.reuseValue,
        sustainabilityScore: dto.sustainabilityScore,
        fitGuidance: dto.fitGuidance,
        careInstructions: dto.careInstructions,
        origin: dto.origin,
        verified: dto.verified ?? true
      }
    });
  }

  updateProduct(id: string, dto: Partial<CreateProductDto>) {
    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        description: dto.description,
        materials: dto.materials ? { composition: dto.materials } : undefined,
        price: dto.price,
        carbonScore: dto.carbonScore,
        repairabilityScore: dto.repairabilityScore,
        reuseValue: dto.reuseValue,
        sustainabilityScore: dto.sustainabilityScore,
        fitGuidance: dto.fitGuidance,
        careInstructions: dto.careInstructions,
        origin: dto.origin,
        verified: dto.verified
      }
    });
  }

  inventory(productId: string) {
    return this.prisma.inventory.findMany({
      where: { productId },
      include: {
        vendor: {
          include: { profile: true }
        }
      },
      orderBy: [{ trustScore: "desc" }, { createdAt: "desc" }]
    });
  }
}
