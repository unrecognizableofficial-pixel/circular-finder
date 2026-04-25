import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { SearchSuppliersDto } from "@/modules/suppliers/dto/search-suppliers.dto";
import { toFrontendId } from "@/common/presenters/platform.presenter";

type SupplierConfig = {
  key: string;
  name: string;
  supplierType: string;
  region: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  certifications: string[];
  materials: string[];
  laborStandard: string;
  transparencyNotes: string;
  verified: boolean;
  partnerIndexes: number[];
};

const SUPPLIER_NETWORK: SupplierConfig[] = [
  {
    key: "farm-india",
    name: "Vidarbha Regenerative Cotton Collective",
    supplierType: "Cotton Farm",
    region: "South Asia",
    country: "India",
    city: "Nagpur",
    latitude: 21.1458,
    longitude: 79.0882,
    certifications: ["GOTS", "Regenerative Organic"],
    materials: ["Organic Cotton"],
    laborStandard: "Farmer-owned cooperative",
    transparencyNotes: "Publishes soil restoration and water renewal metrics each season.",
    verified: true,
    partnerIndexes: [0, 2, 4]
  },
  {
    key: "mill-portugal",
    name: "Porto Trace Textile Mill",
    supplierType: "Textile Mill",
    region: "Europe",
    country: "Portugal",
    city: "Porto",
    latitude: 41.1579,
    longitude: -8.6291,
    certifications: ["OEKO-TEX", "ISO 14001"],
    materials: ["Organic Cotton", "TENCEL", "Merino Wool"],
    laborStandard: "Collective bargaining in place",
    transparencyNotes: "Low-impact finishing and batch-level material traceability link back to each digital twin.",
    verified: true,
    partnerIndexes: [1, 3, 5]
  },
  {
    key: "repair-la",
    name: "Los Angeles Renewal Studio",
    supplierType: "Repair Hub",
    region: "North America",
    country: "United States",
    city: "Los Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
    certifications: ["Circularity Lab"],
    materials: ["Repairs", "Tailoring", "Upcycling"],
    laborStandard: "Local artisan network",
    transparencyNotes: "Handles refinishing, tailoring, and resale prep inside the Circular Finder recovery loop.",
    verified: true,
    partnerIndexes: [0, 6, 7]
  },
  {
    key: "atelier-japan",
    name: "Kyoto Precision Atelier",
    supplierType: "Assembly Studio",
    region: "East Asia",
    country: "Japan",
    city: "Kyoto",
    latitude: 35.0116,
    longitude: 135.7681,
    certifications: ["B Corp Supplier", "SA8000"],
    materials: ["Tailoring", "Recycled Denim"],
    laborStandard: "Skilled studio production",
    transparencyNotes: "Specializes in limited-batch finishing and high-accuracy assembly for premium catalog drops.",
    verified: true,
    partnerIndexes: [8, 9]
  }
];

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async map(query: SearchSuppliersDto) {
    const brands = await this.prisma.brand.findMany({
      orderBy: [{ governanceScore: "desc" }, { sustainabilityScore: "desc" }],
      take: 10
    });

    const items = SUPPLIER_NETWORK.map((supplier) => {
      const linkedBrands = supplier.partnerIndexes
        .map((index) => brands[index % Math.max(brands.length, 1)])
        .filter((brand): brand is (typeof brands)[number] => Boolean(brand))
        .map((brand) => ({
          id: toFrontendId(brand.id),
          name: brand.name,
          relationshipType: supplier.supplierType === "Repair Hub" ? "Repair network" : supplier.supplierType === "Cotton Farm" ? "Raw material source" : "Production partner",
          transparencyScore: brand.trustScore
        }));

      return {
        id: toFrontendId(supplier.key),
        name: supplier.name,
        supplierType: supplier.supplierType,
        region: supplier.region,
        country: supplier.country,
        city: supplier.city,
        latitude: supplier.latitude,
        longitude: supplier.longitude,
        certifications: supplier.certifications,
        materials: supplier.materials,
        laborStandard: supplier.laborStandard,
        transparencyNotes: supplier.transparencyNotes,
        isVerified: supplier.verified,
        brands: linkedBrands
      };
    }).filter((supplier) => this.matchesFilters(supplier, query));

    return { items };
  }

  private matchesFilters(
    supplier: {
      name: string;
      supplierType: string;
      region: string;
      country: string;
      city: string;
      certifications: string[];
      materials: string[];
      laborStandard: string;
      transparencyNotes: string;
      isVerified: boolean;
      brands: Array<{ name: string }>;
    },
    query: SearchSuppliersDto
  ) {
    const search = query.search?.toLowerCase().trim() ?? "";
    const demographic = query.demographic?.toLowerCase().trim();

    if (query.verified_only && !supplier.isVerified) {
      return false;
    }
    if (query.brand && !supplier.brands.some((brand) => brand.name === query.brand)) {
      return false;
    }
    if (query.country && supplier.country !== query.country) {
      return false;
    }
    if (query.supplier_type && supplier.supplierType !== query.supplier_type) {
      return false;
    }
    if (query.region && !supplier.region.toLowerCase().includes(query.region.toLowerCase())) {
      return false;
    }
    if (query.certification && !supplier.certifications.join(" ").toLowerCase().includes(query.certification.toLowerCase())) {
      return false;
    }
    if (query.material && !supplier.materials.join(" ").toLowerCase().includes(query.material.toLowerCase())) {
      return false;
    }
    if (query.labor_standard && !supplier.laborStandard.toLowerCase().includes(query.labor_standard.toLowerCase())) {
      return false;
    }
    if (demographic && ![supplier.name, ...supplier.brands.map((brand) => brand.name)].join(" ").toLowerCase().includes(demographic)) {
      return false;
    }
    if (!search) {
      return true;
    }

    return [
      supplier.name,
      supplier.supplierType,
      supplier.region,
      supplier.country,
      supplier.city,
      supplier.certifications.join(" "),
      supplier.materials.join(" "),
      supplier.laborStandard,
      supplier.transparencyNotes,
      supplier.brands.map((brand) => brand.name).join(" ")
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);
  }
}
