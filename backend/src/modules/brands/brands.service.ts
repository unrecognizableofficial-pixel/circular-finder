import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateBrandPresetDto } from "@/modules/brands/dto/create-brand-preset.dto";

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  listBrands() {
    return this.prisma.brand.findMany({
      include: {
        subBrands: true,
        presets: true
      },
      orderBy: { governanceScore: "desc" }
    });
  }

  async getBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        subBrands: true,
        presets: true,
        products: true
      }
    });
    if (!brand) {
      throw new NotFoundException("Brand not found.");
    }
    return brand;
  }

  subBrands(brandId: string) {
    return this.prisma.subBrand.findMany({
      where: { brandId },
      include: {
        manager: {
          include: { profile: true }
        }
      },
      orderBy: [{ complianceScore: "desc" }, { createdAt: "desc" }]
    });
  }

  createPreset(dto: CreateBrandPresetDto) {
    return this.prisma.brandPreset.create({
      data: {
        brandId: dto.brandId,
        subBrandId: dto.subBrandId,
        name: dto.name,
        colorFamily: dto.colorFamily,
        typography: dto.typography,
        darkModePreview: dto.darkModePreview as Prisma.InputJsonValue,
        lightModePreview: dto.lightModePreview as Prisma.InputJsonValue,
        buttonStyles: { primary: "pill", secondary: "outline" } as Prisma.InputJsonValue,
        marketplaceCardStyle: { density: "editorial", trustTags: true } as Prisma.InputJsonValue
      }
    });
  }
}
