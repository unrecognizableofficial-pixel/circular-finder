import type { Prisma } from "@prisma/client";

type BrandRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  governanceScore: number;
  sustainabilityScore: number;
  trustScore: number;
  verified: boolean;
};

type CircularIdRecord = {
  id: string;
  code: string;
  origin: string;
  materials: Prisma.JsonValue;
  repairGuide: string;
  authenticityStatus: string;
  careInstructions: string;
  sustainabilityScore: number;
  passportData: Prisma.JsonValue;
  createdAt?: Date;
};

type ProductRecord = {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  materials: Prisma.JsonValue;
  price: Prisma.Decimal | number | string;
  origin: string;
  brand: BrandRecord;
  circularIds?: CircularIdRecord[];
};

type WardrobeEventRecord = {
  id: string;
  eventType: string;
  note: string | null;
  createdAt: Date;
};

type WardrobeItemRecord = {
  id: string;
  nickname: string;
  condition: string;
  status: string;
  wearCount: number;
  repairCount: number;
  lastWornAt: Date | null;
  acquiredOn: Date | null;
  purchasePrice: Prisma.Decimal | number | string | null;
  notes: string | null;
  circularId: CircularIdRecord & {
    product: ProductRecord;
  };
  events: WardrobeEventRecord[];
};

type BrandPresentation = {
  id: number;
  name: string;
  slug: string;
  description: string;
  headquartersRegion: string;
  transparencyScore: number;
  sustainabilityRating: number;
  ratingLabel: string;
  demographics: string[];
  certifications: string[];
  website: string;
  isVerified: boolean;
};

type ProductPresentation = {
  id: number;
  productCode: string;
  name: string;
  garmentType: string;
  category: string;
  targetDemographic: string;
  baseColor: string;
  materialsSummary: string;
  msrp: number;
  productStory: string;
  imageUrl: string;
  styleTags: string[];
  brand: BrandPresentation;
};

export function toFrontendId(value: string | number | undefined | null) {
  if (typeof value === "number") {
    return value;
  }

  const text = String(value ?? "0");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) || 1;
}

function toMoney(value: Prisma.Decimal | number | string | null | undefined) {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function extractJsonStrings(value: Prisma.JsonValue) {
  if (!value || typeof value !== "object") {
    return [] as string[];
  }

  const values = Array.isArray(value) ? value : Object.values(value as Record<string, Prisma.JsonValue>);
  return values.flatMap((entry) => (Array.isArray(entry) ? entry : [entry])).filter((entry): entry is string => typeof entry === "string");
}

function ratingLabel(score: number) {
  if (score >= 92) return "A";
  if (score >= 86) return "A-";
  if (score >= 80) return "B+";
  if (score >= 72) return "B";
  return "C";
}

function categoryImage(category: string, seed: string) {
  const groups: Record<string, string[]> = {
    outerwear: [
      "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
    ],
    knitwear: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
    ],
    tailoring: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
    ],
    accessories: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80"
    ],
    denim: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
    ],
    shirting: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
    ]
  };

  const pool =
    groups[category.toLowerCase()] ?? [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
    ];

  return pool[toFrontendId(seed) % pool.length];
}

export function buildBrandPresentation(brand: BrandRecord) {
  return {
    id: toFrontendId(brand.id),
    name: brand.name,
    slug: brand.slug,
    description: brand.description ?? `${brand.name} is a governed Circular Finder brand profile.`,
    headquartersRegion: "Global demo network",
    transparencyScore: brand.trustScore ?? brand.governanceScore,
    sustainabilityRating: Math.round((brand.sustainabilityScore / 20) * 10) / 10,
    ratingLabel: ratingLabel(brand.sustainabilityScore),
    demographics: ["Women", "Men", "Unisex"],
    certifications: ["Circular Finder Demo"],
    website: brand.website ?? "https://circularfinder.demo",
    isVerified: brand.verified
  } satisfies BrandPresentation;
}

export function buildProductPresentation(product: ProductRecord): ProductPresentation {
  const brand = buildBrandPresentation(product.brand);
  const category = titleCase(product.category);
  const materials = extractJsonStrings(product.materials);
  return {
    id: toFrontendId(product.id),
    productCode: product.sku,
    name: product.name,
    garmentType: category,
    category,
    targetDemographic: "Unisex",
    baseColor: "charcoal",
    materialsSummary: materials.length ? materials.join(" • ") : "Tracked material blend",
    msrp: toMoney(product.price),
    productStory: product.description,
    imageUrl: categoryImage(product.category, product.id),
    styleTags: [category.toLowerCase(), "circular", "traceable", product.origin.toLowerCase()],
    brand
  };
}

export function buildPassportPresentation(
  product: ProductPresentation,
  circularId: CircularIdRecord
) {
  const materials = extractJsonStrings(circularId.materials);
  const sustainabilityScore = circularId.sustainabilityScore;

  return {
    passportDbId: toFrontendId(circularId.id),
    passportId: circularId.code,
    manufacturer: product.brand.name,
    factoryLocation: circularId.origin,
    countryOfOrigin: circularId.origin,
    materialComposition: materials.length ? materials : ["Tracked material blend"],
    carbonFootprintKg: Math.max(2.4, Number((11 - sustainabilityScore / 10).toFixed(1))),
    waterUsageLiters: Math.round(900 + (100 - sustainabilityScore) * 18),
    sustainabilityCertifications: ["Circular Finder Demo", `Impact score ${sustainabilityScore}`],
    repairInstructions: circularId.repairGuide,
    recyclingInstructions: "Reuse, repair, or route this item through a Circular Finder recovery partner.",
    durabilityRating: Math.round((sustainabilityScore + product.brand.transparencyScore) / 20),
    circularityScore: sustainabilityScore,
    resaleValueEstimate: Math.round(product.msrp * 0.62),
    passportStatus: circularId.authenticityStatus,
    qrCode: `QR-${circularId.code}`,
    barcode: `BAR-${product.productCode}`,
    nfcTag: `NFC-${circularId.code}`,
    verifiedAt: (circularId.createdAt ?? new Date()).toISOString(),
    journey: [],
    product,
    brand: product.brand
  };
}

export function buildWardrobeEventPresentation(event: WardrobeEventRecord) {
  return {
    id: toFrontendId(event.id),
    eventType: event.eventType,
    note: event.note ?? "Logged from the live wardrobe service.",
    createdAt: event.createdAt.toISOString()
  };
}

export function buildWardrobeItemPresentation(item: WardrobeItemRecord) {
  const product = buildProductPresentation(item.circularId.product);
  const passport = buildPassportPresentation(product, item.circularId);

  return {
    id: toFrontendId(item.id),
    nickname: item.nickname,
    condition: item.condition,
    status: item.status,
    wearCount: item.wearCount,
    repairCount: item.repairCount,
    lastWornAt: item.lastWornAt?.toISOString() ?? null,
    acquiredOn: item.acquiredOn?.toISOString().slice(0, 10) ?? null,
    purchasePrice: item.purchasePrice === null ? null : toMoney(item.purchasePrice),
    notes: item.notes ?? "",
    resaleOpportunity: Math.round(passport.resaleValueEstimate),
    product,
    passport,
    events: item.events
      .slice()
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .map(buildWardrobeEventPresentation)
  };
}

export function buildWardrobeInsights(items: Array<ReturnType<typeof buildWardrobeItemPresentation>>) {
  const totalWardrobeValue = items.reduce((sum, item) => sum + (item.purchasePrice ?? item.product.msrp), 0);
  const resaleValue = items.reduce((sum, item) => sum + item.resaleOpportunity, 0);

  return {
    inventoryCount: items.length,
    usageRate: items.length ? Math.min(96, 52 + items.reduce((sum, item) => sum + item.wearCount, 0) / items.length) : 0,
    outfitPotential: Math.max(items.length * 2, items.length ? 6 : 0),
    totalWardrobeValue,
    resaleValue,
    unusedClothingValue: Math.round(resaleValue * 0.4),
    repairReadyCount: items.filter((item) => item.condition === "repairable" || item.repairCount > 0).length,
    recommendations: [
      "Move high-trust items into the marketplace when their wear count slows down.",
      "Use scanner uploads to attach fresh lifecycle context before resale.",
      "Complete repair events early to raise reuse value and trust."
    ]
  };
}

export function buildOutfits(items: Array<ReturnType<typeof buildWardrobeItemPresentation>>) {
  if (!items.length) {
    return [] as Array<{ title: string; summary: string; items: Array<ReturnType<typeof buildWardrobeItemPresentation>> }>;
  }

  const outerwear = items.find((item) => item.product.category.toLowerCase() === "outerwear");
  const tailoring = items.find((item) => item.product.category.toLowerCase() === "tailoring");
  const accessories = items.find((item) => item.product.category.toLowerCase() === "accessories");
  const hero = outerwear ?? tailoring ?? items[0];

  const looks = [
    {
      title: "Boardroom Capsule",
      summary: "Pairs a structured layer with passport-backed staples for a trust-forward marketplace story.",
      items: compactItems([hero, accessories])
    },
    {
      title: "Minimal Travel Layer",
      summary: "Built for repeat wear, low packing volume, and easy repair coordination.",
      items: compactItems([outerwear ?? items[0], items[1] ?? items[0]])
    },
    {
      title: "Weekend Rewear Edit",
      summary: "Highlights the strongest circular items with a resale-ready styling angle.",
      items: compactItems([items[0], items[2] ?? items[1] ?? items[0]])
    }
  ];

  return looks.map((look) => ({
    ...look,
    items: look.items.slice(0, 2)
  }));
}

function compactItems<T>(items: Array<T | undefined | null>) {
  return items.filter((item): item is T => Boolean(item));
}

export function buildUploadResponse(
  product: ProductRecord,
  circularId: CircularIdRecord,
  uploadedImageUrl?: string,
  confidence = 0.82,
  extra: Record<string, unknown> = {}
) {
  const productPresentation = buildProductPresentation(product);
  const passport = buildPassportPresentation(productPresentation, circularId);

  return {
    recognized: true,
    confidence,
    uploadedImageUrl: uploadedImageUrl ?? productPresentation.imageUrl,
    passport,
    ...extra
  };
}
