import type {
  BootstrapPayload,
  Brand,
  MarketplaceListing,
  Outfit,
  Passport,
  Product,
  ProductJourneyStep,
  Supplier,
  UserProfile,
  WardrobeItem,
  WardrobeInsights
} from "@/types/platform";

const brands: Brand[] = [
  {
    id: 1,
    name: "Eterna Loom",
    slug: "eterna-loom",
    description: "Luxury essentials designed around traceability, repair readiness, and premium natural fibers.",
    headquartersRegion: "London, United Kingdom",
    transparencyScore: 94,
    sustainabilityRating: 4.8,
    ratingLabel: "A",
    demographics: ["Women", "Men", "Unisex"],
    certifications: ["GOTS", "B Corp", "Fair Trade"],
    website: "https://eternaloom.example",
    isVerified: true
  },
  {
    id: 2,
    name: "Aureline",
    slug: "aureline",
    description: "Precision tailoring with transparent mills, structured fits, and long-life product passports.",
    headquartersRegion: "Copenhagen, Denmark",
    transparencyScore: 91,
    sustainabilityRating: 4.6,
    ratingLabel: "A-",
    demographics: ["Women", "Professionals", "Unisex"],
    certifications: ["OEKO-TEX", "SA8000", "B Corp"],
    website: "https://aureline.example",
    isVerified: true
  },
  {
    id: 3,
    name: "Loop Standard",
    slug: "loop-standard",
    description: "Circular denim and utility layers with resale-ready metadata and return-to-repair workflows.",
    headquartersRegion: "Los Angeles, United States",
    transparencyScore: 88,
    sustainabilityRating: 4.4,
    ratingLabel: "B+",
    demographics: ["Men", "Women", "Gen Z"],
    certifications: ["Climate Neutral", "GRS"],
    website: "https://loopstandard.example",
    isVerified: true
  }
];

const suppliers: Supplier[] = [
  {
    id: 1,
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
    isVerified: true,
    brands: [
      { id: 1, name: "Eterna Loom", relationshipType: "Raw material source", transparencyScore: 94 },
      { id: 2, name: "Loop Standard", relationshipType: "Raw material source", transparencyScore: 88 }
    ]
  },
  {
    id: 2,
    name: "Porto Trace Textile Mill",
    supplierType: "Textile Mill",
    region: "Europe",
    country: "Portugal",
    city: "Porto",
    latitude: 41.1579,
    longitude: -8.6291,
    certifications: ["OEKO-TEX", "ISO 14001"],
    materials: ["Organic Cotton", "TENCEL"],
    laborStandard: "Collective bargaining in place",
    transparencyNotes: "Low-impact finishing and batch-level fiber traceability are linked to each passport.",
    isVerified: true,
    brands: [
      { id: 3, name: "Eterna Loom", relationshipType: "Textile partner", transparencyScore: 94 },
      { id: 4, name: "Aureline", relationshipType: "Textile partner", transparencyScore: 91 }
    ]
  },
  {
    id: 3,
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
    transparencyNotes: "Supports repair bookings, refinishing, and resale conditioning with shared passport history.",
    isVerified: true,
    brands: [
      { id: 5, name: "Eterna Loom", relationshipType: "Repair network", transparencyScore: 94 },
      { id: 6, name: "Loop Standard", relationshipType: "Repair network", transparencyScore: 88 }
    ]
  }
];

const journeys: Record<string, ProductJourneyStep[]> = {
  "DPP-EL-TRN-001": [
    {
      id: 1,
      stepType: "Farm",
      name: "Vidarbha Regenerative Cotton Collective",
      country: "India",
      latitude: 21.1458,
      longitude: 79.0882,
      details: "Organic cotton grown with regenerative soil practices and cooperative ownership.",
      stepOrder: 1,
      supplierId: 1
    },
    {
      id: 2,
      stepType: "Mill",
      name: "Porto Trace Textile Mill",
      country: "Portugal",
      latitude: 41.1579,
      longitude: -8.6291,
      details: "Fabric milled, finished, and indexed with batch-level material traceability.",
      stepOrder: 2,
      supplierId: 2
    },
    {
      id: 3,
      stepType: "Repair Hub",
      name: "Los Angeles Renewal Studio",
      country: "United States",
      latitude: 34.0522,
      longitude: -118.2437,
      details: "Post-sale repair and resale conditioning are pre-mapped into the lifecycle plan.",
      stepOrder: 3,
      supplierId: 3
    }
  ],
  "DPP-AU-SHR-002": [
    {
      id: 4,
      stepType: "Mill",
      name: "Porto Trace Textile Mill",
      country: "Portugal",
      latitude: 41.1579,
      longitude: -8.6291,
      details: "Tailoring shirting fabric woven and finished with OEKO-TEX controlled chemistry.",
      stepOrder: 1,
      supplierId: 2
    },
    {
      id: 5,
      stepType: "Repair Hub",
      name: "Los Angeles Renewal Studio",
      country: "United States",
      latitude: 34.0522,
      longitude: -118.2437,
      details: "Alteration pathway and collar refresh service attached to the garment passport.",
      stepOrder: 2,
      supplierId: 3
    }
  ],
  "DPP-LS-TOT-003": [
    {
      id: 6,
      stepType: "Farm",
      name: "Vidarbha Regenerative Cotton Collective",
      country: "India",
      latitude: 21.1458,
      longitude: 79.0882,
      details: "Canvas cotton source with regenerative acreage reporting.",
      stepOrder: 1,
      supplierId: 1
    },
    {
      id: 7,
      stepType: "Repair Hub",
      name: "Los Angeles Renewal Studio",
      country: "United States",
      latitude: 34.0522,
      longitude: -118.2437,
      details: "Handle replacement and hardware refresh available through the repair network.",
      stepOrder: 2,
      supplierId: 3
    }
  ]
};

function makePassportBase(input: {
  passportDbId: number;
  passportId: string;
  brand: Brand;
  manufacturer: string;
  factoryLocation: string;
  countryOfOrigin: string;
  materialComposition: string[];
  carbonFootprintKg: number;
  waterUsageLiters: number;
  sustainabilityCertifications: string[];
  careInstructions: string;
  repairInstructions: string;
  recyclingInstructions: string;
  takeBackProgram: string;
  durabilityRating: number;
  circularityScore: number;
  resaleValueEstimate: number;
  qrCode: string;
  barcode: string;
  nfcTag: string;
}) {
  return {
    passportDbId: input.passportDbId,
    passportId: input.passportId,
    manufacturer: input.manufacturer,
    factoryLocation: input.factoryLocation,
    countryOfOrigin: input.countryOfOrigin,
    materialComposition: input.materialComposition,
    carbonFootprintKg: input.carbonFootprintKg,
    waterUsageLiters: input.waterUsageLiters,
    sustainabilityCertifications: input.sustainabilityCertifications,
    careInstructions: input.careInstructions,
    repairInstructions: input.repairInstructions,
    recyclingInstructions: input.recyclingInstructions,
    takeBackProgram: input.takeBackProgram,
    durabilityRating: input.durabilityRating,
    circularityScore: input.circularityScore,
    resaleValueEstimate: input.resaleValueEstimate,
    passportStatus: "Demo ready",
    qrCode: input.qrCode,
    barcode: input.barcode,
    nfcTag: input.nfcTag,
    verifiedAt: "2026-04-20T00:00:00Z",
    journey: journeys[input.passportId],
    brand: input.brand
  };
}

const products: Product[] = [
  {
    id: 1,
    productCode: "CF-EL-TRN-001",
    name: "Sage Meridian Trench",
    garmentType: "Trench Coat",
    category: "outerwear",
    targetDemographic: "Women",
    baseColor: "sage",
    materialsSummary: "Organic cotton twill with TENCEL lining",
    msrp: 420,
    productStory: "Engineered for repeat wear with modular buttons, tailored structure, and repair-first detailing.",
    imageUrl: "/circular-finder/images/trench.svg",
    styleTags: ["capsule", "tailored", "minimal"],
    brand: brands[0]
  },
  {
    id: 2,
    productCode: "CF-AU-SHR-002",
    name: "Ivory Precision Shirt",
    garmentType: "Shirt",
    category: "shirt",
    targetDemographic: "Unisex",
    baseColor: "ivory",
    materialsSummary: "Organic cotton poplin with structured tailoring finish",
    msrp: 180,
    productStory: "A polished core shirt designed for long-life office rotation with verified tailoring support.",
    imageUrl: "/circular-finder/images/shirt.svg",
    styleTags: ["tailored", "office", "core"],
    brand: brands[1]
  },
  {
    id: 3,
    productCode: "CF-LS-TOT-003",
    name: "Stone Utility Tote",
    garmentType: "Bag",
    category: "accessory",
    targetDemographic: "Unisex",
    baseColor: "stone",
    materialsSummary: "Heavy organic cotton canvas with repairable hardware",
    msrp: 145,
    productStory: "Built for daily carry with reinforced straps, modular hardware, and a passport-ready repair path.",
    imageUrl: "/circular-finder/images/tote.svg",
    styleTags: ["utility", "carry", "daily"],
    brand: brands[2]
  }
];

const passports: Passport[] = [
  {
    ...makePassportBase({
      passportDbId: 1,
      passportId: "DPP-EL-TRN-001",
      brand: brands[0],
      manufacturer: "Eterna Loom Manufacturing",
      factoryLocation: "Da Nang, Vietnam",
      countryOfOrigin: "Vietnam",
      materialComposition: ["Organic Cotton 78%", "TENCEL Lyocell 22%"],
      carbonFootprintKg: 16.4,
      waterUsageLiters: 920,
      sustainabilityCertifications: ["GOTS", "Fair Trade", "ZDHC"],
      careInstructions: "Spot clean between wears, steam on low heat, and eco dry clean only when needed.",
      repairInstructions: "Reinforce cuffs after 70 wears and replace buttons through the repair hub when needed.",
      recyclingInstructions: "Detach buttons and lining before fiber recycling or trade back through the take-back flow.",
      takeBackProgram: "Return through Eterna Loom Renew for repair credit, authenticated resale, or fiber recovery.",
      durabilityRating: 92,
      circularityScore: 95,
      resaleValueEstimate: 210,
      qrCode: "QR-EL-TRN-001",
      barcode: "BAR-EL-TRN-001",
      nfcTag: "NFC-EL-TRN-001"
    }),
    product: undefined
  },
  {
    ...makePassportBase({
      passportDbId: 2,
      passportId: "DPP-AU-SHR-002",
      brand: brands[1],
      manufacturer: "Aureline Tailoring House",
      factoryLocation: "Porto, Portugal",
      countryOfOrigin: "Portugal",
      materialComposition: ["Organic Cotton 100%"],
      carbonFootprintKg: 8.7,
      waterUsageLiters: 410,
      sustainabilityCertifications: ["OEKO-TEX", "SA8000"],
      careInstructions: "Cold wash, hang dry, and press lightly to preserve collar structure and stitched finish.",
      repairInstructions: "Refresh the collar and button placket after extended office rotation.",
      recyclingInstructions: "Remove buttons and recycle through cotton recovery streams.",
      takeBackProgram: "Send back through Aureline Second Wear to relist, repair, or route into cotton recovery.",
      durabilityRating: 89,
      circularityScore: 88,
      resaleValueEstimate: 92,
      qrCode: "QR-AU-SHR-002",
      barcode: "BAR-AU-SHR-002",
      nfcTag: "NFC-AU-SHR-002"
    }),
    product: undefined
  },
  {
    ...makePassportBase({
      passportDbId: 3,
      passportId: "DPP-LS-TOT-003",
      brand: brands[2],
      manufacturer: "Loop Standard Utility Works",
      factoryLocation: "Los Angeles, United States",
      countryOfOrigin: "United States",
      materialComposition: ["Organic Cotton Canvas 94%", "Metal Hardware 6%"],
      carbonFootprintKg: 6.1,
      waterUsageLiters: 240,
      sustainabilityCertifications: ["GRS", "Climate Neutral"],
      careInstructions: "Brush clean after daily use, wipe hardware dry, and store flat to protect structure.",
      repairInstructions: "Replace strap hardware and reinforce handles through the service network.",
      recyclingInstructions: "Separate hardware before textile recycling or route through circular accessories take-back.",
      takeBackProgram: "Use Loop Standard Exchange for hardware refresh, resale prep, or accessory take-back.",
      durabilityRating: 90,
      circularityScore: 86,
      resaleValueEstimate: 78,
      qrCode: "QR-LS-TOT-003",
      barcode: "BAR-LS-TOT-003",
      nfcTag: "NFC-LS-TOT-003"
    }),
    product: undefined
  }
];

products[0].passport = passports[0];
products[1].passport = passports[1];
products[2].passport = passports[2];

function hydratePassport(passport: Passport, product: Product): Passport {
  return {
    ...passport,
    brand: product.brand,
    product: {
      ...product,
      passport: {
        ...passport,
        product: undefined,
        brand: product.brand
      }
    }
  };
}

const marketplace: MarketplaceListing[] = [
  {
    id: 1,
    title: "Sage Meridian Trench",
    description: "Verified outerwear listing with premium tailoring and a strong circularity score.",
    sizeLabel: "M",
    condition: "excellent",
    price: 280,
    predictedPrice: 275,
    expectedDaysToSell: 5,
    status: "live",
    imageUrl: "/circular-finder/images/trench.svg",
    seller: { id: 1, name: "Studio House 01" },
    product: products[0],
    passport: hydratePassport(passports[0], products[0])
  },
  {
    id: 2,
    title: "Ivory Precision Shirt",
    description: "Workwear-ready shirt with verified mill data and polished repair guidance.",
    sizeLabel: "L",
    condition: "excellent",
    price: 120,
    predictedPrice: 118,
    expectedDaysToSell: 4,
    status: "live",
    imageUrl: "/circular-finder/images/shirt.svg",
    seller: { id: 2, name: "Aureline Archive" },
    product: products[1],
    passport: hydratePassport(passports[1], products[1])
  },
  {
    id: 3,
    title: "Stone Utility Tote",
    description: "Daily carry accessory with repairable hardware and transparent sourcing history.",
    sizeLabel: "One Size",
    condition: "good",
    price: 92,
    predictedPrice: 96,
    expectedDaysToSell: 6,
    status: "live",
    imageUrl: "/circular-finder/images/tote.svg",
    seller: { id: 3, name: "Loop Standard Archive" },
    product: products[2],
    passport: hydratePassport(passports[2], products[2])
  }
];

const wardrobeItems: WardrobeItem[] = [
  {
    id: 1,
    nickname: "Work trench",
    condition: "excellent",
    status: "active",
    wearCount: 34,
    repairCount: 1,
    lastWornAt: "2026-04-18T00:00:00Z",
    acquiredOn: "2025-09-12",
    purchasePrice: 420,
    notes: "High rotation in spring and travel season.",
    resaleOpportunity: 210,
    product: products[0],
    passport: hydratePassport(passports[0], products[0]),
    events: [
      {
        id: 1,
        eventType: "repair",
        note: "Button reinforcement completed at the repair hub.",
        createdAt: "2026-01-10T00:00:00Z"
      }
    ]
  }
];

function buildInsights(items: WardrobeItem[]): WardrobeInsights {
  const totalWardrobeValue = items.reduce((sum, item) => sum + (item.purchasePrice ?? item.product.msrp), 0);
  const resaleValue = items.reduce((sum, item) => sum + item.resaleOpportunity, 0);
  return {
    inventoryCount: items.length,
    usageRate: 72,
    outfitPotential: 16,
    totalWardrobeValue,
    resaleValue,
    unusedClothingValue: Math.round(resaleValue * 0.4),
    repairReadyCount: items.filter((item) => item.repairCount > 0).length,
    recommendations: [
      "Move your strongest trust-score products into the marketplace feed for faster conversion.",
      "Use the supplier map to highlight transparent sourcing in your next campaign.",
      "Complete the scanner flow to unlock more impact challenges."
    ]
  };
}

function buildOutfits(items: WardrobeItem[]): Outfit[] {
  if (!items.length) {
    return [];
  }

  return [
    {
      title: "Boardroom Capsule",
      summary: "Pairs a structured outer layer with polished staples for a trust-forward marketplace story.",
      items: [items[0]]
    },
    {
      title: "Minimal Travel Layer",
      summary: "Optimized for repeat wear, low packing volume, and easy repair coordination.",
      items: [items[0]]
    }
  ];
}

const defaultProfile: UserProfile = {
  id: 1,
  fullName: "Mia Alvarez",
  email: "mia@circularfinder.com",
  role: "demo-user"
};

let demoState: {
  bootstrap: BootstrapPayload;
  user: {
    profile: UserProfile;
    wardrobe: WardrobeItem[];
    insights: WardrobeInsights;
    outfits: Outfit[];
  };
  nextListingId: number;
  nextWardrobeId: number;
} = createInitialState();

function createInitialState() {
  const user = {
    profile: { ...defaultProfile },
    wardrobe: wardrobeItems.map(clone),
    insights: buildInsights(wardrobeItems.map(clone)),
    outfits: buildOutfits(wardrobeItems.map(clone))
  };

  return {
    bootstrap: {
      app: {
        name: "Circular Finder",
        philosophy: [
          "Know your impact.",
          "Build trust through transparent product passports.",
          "Unify governance, commerce, and social growth in one system."
        ]
      },
      brands: brands.map(clone),
      knownBrandOptions: brands.map((brand) => ({ id: brand.id, name: brand.name, slug: brand.slug })),
      suppliers: suppliers.map(clone),
      products: products.map((product) => ({
        ...clone(product),
        passport: product.passport ? clone(product.passport) : undefined
      })),
      marketplace: marketplace.map(clone),
      user: null
    },
    user,
    nextListingId: 4,
    nextWardrobeId: 2
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function syncUserIntoBootstrap(token?: string) {
  demoState.bootstrap.user = token ? clone(demoState.user) : null;
}

export function resetDemoState() {
  demoState = createInitialState();
}

export function getDemoBootstrap(token?: string): BootstrapPayload {
  syncUserIntoBootstrap(token);
  return clone(demoState.bootstrap);
}

export function demoLogin(email: string) {
  demoState.user.profile.email = email;
  return {
    token: "demo-token",
    user: clone(demoState.user.profile)
  };
}

export function demoRegister(fullName: string, email: string) {
  demoState.user.profile.fullName = fullName;
  demoState.user.profile.email = email;
  return {
    token: "demo-token",
    user: clone(demoState.user.profile)
  };
}

export function getDemoSuppliers(filters: {
  search?: string;
  brand?: string;
  country?: string;
  supplier_type?: string;
  region?: string;
  certification?: string;
  material?: string;
  labor_standard?: string;
  demographic?: string;
  verified_only?: boolean;
}) {
  const search = filters.search?.toLowerCase().trim() ?? "";
  const demographic = filters.demographic?.toLowerCase();
  const items = demoState.bootstrap.suppliers.filter((supplier) => {
    if (filters.verified_only && !supplier.isVerified) return false;
    if (filters.brand && !supplier.brands.some((brand) => brand.name === filters.brand)) return false;
    if (filters.country && supplier.country !== filters.country) return false;
    if (filters.supplier_type && supplier.supplierType !== filters.supplier_type) return false;
    if (filters.region && !supplier.region.toLowerCase().includes(filters.region.toLowerCase())) return false;
    if (filters.certification && !supplier.certifications.join(" ").toLowerCase().includes(filters.certification.toLowerCase())) return false;
    if (filters.material && !supplier.materials.join(" ").toLowerCase().includes(filters.material.toLowerCase())) return false;
    if (filters.labor_standard && !supplier.laborStandard.toLowerCase().includes(filters.labor_standard.toLowerCase())) return false;
    if (demographic && !supplier.brands.some((brand) => brand.name.toLowerCase().includes(demographic))) return false;
    if (!search) return true;
    return [supplier.name, supplier.country, supplier.city, supplier.transparencyNotes, supplier.certifications.join(" "), supplier.materials.join(" "), supplier.supplierType]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
  return { items: clone(items) };
}

export function getDemoMarketplace(filters: { search?: string; brand?: string }) {
  const search = filters.search?.toLowerCase().trim() ?? "";
  const items = demoState.bootstrap.marketplace.filter((listing) => {
    if (filters.brand && listing.product.brand.name !== filters.brand) return false;
    if (!search) return true;
    return [listing.title, listing.description, listing.product.name, listing.product.brand.name, listing.condition]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
  return { items: clone(items) };
}

export function getDemoPassport(passportId: string) {
  const match = demoState.bootstrap.marketplace.find((listing) => listing.passport.passportId === passportId)?.passport;
  if (!match) {
    throw new Error("Passport not found.");
  }
  return clone(match);
}

export function demoLookupPassport(scanValue: string, hints: string) {
  const normalized = scanValue.toLowerCase();
  const hintText = hints.toLowerCase();
  const match =
    demoState.bootstrap.marketplace.find((listing) =>
      [listing.passport.passportId, listing.passport.qrCode, listing.passport.barcode, listing.passport.nfcTag, listing.product.name]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    ) ??
    demoState.bootstrap.marketplace.find((listing) =>
      hintText ? [listing.product.name, listing.product.materialsSummary, listing.product.productStory].join(" ").toLowerCase().includes(hintText) : false
    );

  if (!match) {
    return { recognized: false, confidence: 0.42, message: "No demo passport matched this code." };
  }

  return {
    recognized: true,
    confidence: 0.93,
    passport: clone(match.passport)
  };
}

export function demoUploadScan(hints: string, brandHint: string) {
  const hintText = `${hints} ${brandHint}`.toLowerCase().trim();
  const match =
    demoState.bootstrap.marketplace.find((listing) =>
      hintText ? [listing.title, listing.description, listing.product.brand.name].join(" ").toLowerCase().includes(hintText) : false
    ) ?? demoState.bootstrap.marketplace[0];

  return {
    recognized: true,
    confidence: 0.86,
    uploadedImageUrl: match.imageUrl,
    passport: clone(match.passport)
  };
}

export function demoAddWardrobeItem(passportId: string, nickname?: string, purchasePrice?: number) {
  const match = demoState.bootstrap.marketplace.find((listing) => listing.passport.passportId === passportId);
  if (!match) {
    throw new Error("Passport not found.");
  }

  const item: WardrobeItem = {
    id: demoState.nextWardrobeId++,
    nickname: nickname || match.product.name,
    condition: "excellent",
    status: "active",
    wearCount: 0,
    repairCount: 0,
    lastWornAt: null,
    acquiredOn: new Date().toISOString().slice(0, 10),
    purchasePrice: purchasePrice ?? match.product.msrp,
    notes: "Added from the GitHub Pages demo scanner.",
    resaleOpportunity: Math.round(match.passport.resaleValueEstimate),
    product: clone(match.product),
    passport: clone(match.passport),
    events: []
  };

  demoState.user.wardrobe.unshift(item);
  demoState.user.insights = buildInsights(demoState.user.wardrobe);
  demoState.user.outfits = buildOutfits(demoState.user.wardrobe);

  return { message: "Added to your demo wardrobe.", item: clone(item) };
}

export function getDemoWardrobe() {
  return {
    items: clone(demoState.user.wardrobe),
    insights: clone(demoState.user.insights),
    outfits: clone(demoState.user.outfits)
  };
}

export function getDemoOutfits() {
  return { items: clone(demoState.user.outfits) };
}

export function demoCreateListing(payload: {
  passport_id: string;
  wardrobe_item_id?: number;
  title: string;
  description?: string;
  size_label: string;
  condition: string;
  price: number;
}) {
  const source =
    demoState.user.wardrobe.find((item) => item.id === payload.wardrobe_item_id) ??
    demoState.bootstrap.marketplace.find((listing) => listing.passport.passportId === payload.passport_id);

  if (!source) {
    throw new Error("A matching passport or wardrobe item is required.");
  }

  const product = source.product;
  const passport = source.passport;

  const listing: MarketplaceListing = {
    id: demoState.nextListingId++,
    title: payload.title,
    description: payload.description || "Newly created demo listing.",
    sizeLabel: payload.size_label,
    condition: payload.condition,
    price: payload.price,
    predictedPrice: Math.round(payload.price * 0.98),
    expectedDaysToSell: 5,
    status: "live",
    imageUrl: product.imageUrl,
    seller: { id: 99, name: demoState.user.profile.fullName },
    product: clone(product),
    passport: clone(passport)
  };

  demoState.bootstrap.marketplace.unshift(listing);
  return { message: "Demo listing created.", listing: clone(listing) };
}

export function demoCreateOrder(listingId: number) {
  const listing = demoState.bootstrap.marketplace.find((item) => item.id === listingId);
  if (!listing) {
    throw new Error("Listing not found.");
  }

  return {
    message: "Demo order confirmed.",
    order: {
      id: Date.now(),
      trackingReference: `CF-DEMO-${listingId}`,
      orderStatus: "processing",
      totalPrice: listing.price
    }
  };
}
