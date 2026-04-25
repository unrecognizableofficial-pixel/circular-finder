import type {
  BootstrapPayload,
  Brand,
  MarketplaceListing,
  Outfit,
  Passport,
  Product,
  Supplier,
  UserProfile,
  WardrobeInsights,
  WardrobeItem
} from "@/types/platform";
import {
  demoAddWardrobeItem,
  demoCreateListing,
  demoCreateOrder,
  demoLogin,
  demoLookupPassport,
  demoRegister,
  demoUploadScan,
  getDemoBootstrap,
  getDemoMarketplace,
  getDemoOutfits,
  getDemoPassport,
  getDemoSuppliers,
  getDemoWardrobe
} from "@/lib/demo-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:4000/api";
const NORMALIZED_API_BASE_URL = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;

type RequestOptions = RequestInit & {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
};

type BackendBrand = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  governanceScore?: number;
  sustainabilityScore?: number;
  trustScore?: number;
  verified?: boolean;
};

type BackendSubBrand = {
  id: string;
  name: string;
  slug: string;
};

type BackendInventory = {
  id: string;
  sizeLabel: string;
  condition: string;
  quantity: number;
  availableQuantity: number;
  price: string | number;
  trustScore: number;
  nearbyPickup: boolean;
  sustainabilityMetadata?: Record<string, unknown> | null;
};

type BackendCircularId = {
  id: string;
  code: string;
  productId: string;
  inventoryId?: string | null;
  origin: string;
  materials?: { composition?: string[] } | null;
  fitGuidance: string;
  repairGuide: string;
  authenticityStatus: string;
  ownershipStatus: string;
  careInstructions: string;
  sustainabilityScore: number;
  lifecycleState: string;
  passportData?: Record<string, unknown> | null;
  ownershipHistory?: Array<{
    id: string;
    salePrice?: string | number | null;
    transferredAt?: string;
  }>;
};

type BackendProduct = {
  id: string;
  brandId: string;
  subBrandId?: string | null;
  name: string;
  slug: string;
  sku: string;
  category: string;
  description: string;
  materials?: Record<string, unknown> | null;
  price: string | number;
  carbonScore: number;
  repairabilityScore: number;
  reuseValue: string | number;
  sustainabilityScore: number;
  fitGuidance: string;
  careInstructions: string;
  origin: string;
  verified: boolean;
  brand?: BackendBrand;
  subBrand?: BackendSubBrand | null;
  inventories?: BackendInventory[];
  circularIds?: BackendCircularId[];
};

type BackendCircularRecord = BackendCircularId & {
  product?: BackendProduct;
  inventory?: BackendInventory | null;
};

type BackendProfile = {
  id: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  location?: string | null;
  nearbyEnabled?: boolean;
  trustScore?: number;
  reputationScore?: number;
  impactPoints?: number;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role?: string | { key?: string; name?: string };
  };
};

type BackendAuthResponse = {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  accessToken: string;
  refreshToken?: string;
};

type ListingBackendMeta = {
  productId: string;
  inventoryId?: string;
  circularCode?: string;
};

export type TrustCenterPayload = {
  app: {
    name: string;
    tagline: string;
    motto: string;
    copyright: string;
    trademark: string;
    contactEmail: string;
  };
  privacyCenter: {
    gdpr: {
      framework: string;
      readinessScore: number;
      controls: Record<string, boolean>;
    };
    ccpa: {
      framework: string;
      readinessScore: number;
      controls: Record<string, boolean>;
    };
    agePolicy: {
      isEligible: boolean;
      requiredAge: number;
    };
    dataRights: string[];
  };
  legalHub: {
    hierarchy: Array<{
      level: number;
      key: string;
      description: string;
    }>;
    governance: {
      precedence: string[];
      overrideRule: string;
      actions: string[];
    };
    legalReadinessScore: number;
    complianceReadinessScore: number;
  };
  billing: {
    autoRenewDisclosure: string;
    cancellationTerms: string;
    refundPolicy: string;
    stripe: {
      plan?: string;
      meter?: string;
      integration: {
        configured: boolean;
        publishableConfigured: boolean;
      };
    };
  };
  security: {
    jwtAuth: boolean;
    roleBasedAccess: boolean;
    rateLimiting: boolean;
    encryptedSensitiveFields: boolean;
    auditLogging: boolean;
    webhookVerification: boolean;
  };
  aiTransparency: {
    scannerVision: {
      provider: string;
      model: string;
      remoteEnabled?: boolean;
      minScore?: number;
    };
    disclaimers: string[];
  };
  scanner: {
    cameraPermissionReason: string;
    imageUsageNotice: string;
    metadataBaking: string[];
  };
  passport: {
    scoreMethodology: string[];
    transparencyDisclaimer: string;
  };
  accountManagement: {
    passwordReset: boolean;
    emailVerification: boolean;
    oauthProviders: Array<{
      provider: string;
      url: string;
      message: string;
    }>;
  };
};

export type UserSettingRecord = {
  id: string;
  scope: string;
  scopeId: string;
  key: string;
  value: Record<string, unknown>;
};

class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const remoteCatalogCache = new Map<string, BackendProduct[]>();
const listingBackendMap = new Map<number, ListingBackendMeta>();
const passportCache = new Map<string, Passport>();

const demoTrustCenter: TrustCenterPayload = {
  app: {
    name: "Circular Finder",
    tagline: "Know how it’s made. Know how it fits. Know your impact.",
    motto: "REUSE • REPAIR • REIMAGINE",
    copyright: "© 2026 Circular Finder, LLC All Rights Reserved",
    trademark: "Circular Finder™",
    contactEmail: "trust@circularfinder.demo"
  },
  privacyCenter: {
    gdpr: {
      framework: "GDPR",
      readinessScore: 99,
      controls: {
        dpa: true,
        deletionWorkflow: true,
        dataMinimized: true
      }
    },
    ccpa: {
      framework: "CCPA",
      readinessScore: 99,
      controls: {
        noSellPolicy: true,
        disclosureReady: true,
        deleteReady: true
      }
    },
    agePolicy: {
      isEligible: true,
      requiredAge: 13
    },
    dataRights: [
      "Review privacy controls before sharing scanner, marketplace, or profile data.",
      "Manage marketing and personalization preferences in one place.",
      "Use policy and account controls to understand how trust and rights systems apply."
    ]
  },
  legalHub: {
    hierarchy: [
      { level: 1, key: "MASTER_BRAND_POLICY", description: "Highest authority for Circular Finder identity and enforcement." },
      { level: 2, key: "PLATFORM_POLICY", description: "System-wide trust, commerce, safety, and data rules." },
      { level: 3, key: "SUB_BRAND_POLICY", description: "Sub-brand-specific rules that cannot override master rules." },
      { level: 4, key: "USER_PERMISSION_POLICY", description: "Role-based limits for creators, vendors, and members." }
    ],
    governance: {
      precedence: ["Master Brand Policy", "Platform Policy", "Sub-Brand Policy", "User Permissions Policy"],
      overrideRule: "Master Brand Policy overrides all conflicting lower-level policies.",
      actions: ["Warning", "Content suppression", "Temporary freeze", "Mandatory training", "Suspension", "Permanent removal"]
    },
    legalReadinessScore: 92,
    complianceReadinessScore: 89
  },
  billing: {
    autoRenewDisclosure: "Paid plans renew automatically until canceled from billing controls or your enterprise agreement.",
    cancellationTerms: "Cancellation stops the next renewal cycle and keeps access through the current paid term.",
    refundPolicy: "Refund handling follows your contract terms, checkout disclosures, and marketplace order rules.",
    stripe: {
      plan: "enterprise",
      meter: "enterprise-usage",
      integration: {
        configured: false,
        publishableConfigured: false
      }
    }
  },
  security: {
    jwtAuth: true,
    roleBasedAccess: true,
    rateLimiting: true,
    encryptedSensitiveFields: true,
    auditLogging: true,
    webhookVerification: true
  },
  aiTransparency: {
    scannerVision: {
      provider: "local-signature",
      model: "cf-vision-signature-v2",
      remoteEnabled: false,
      minScore: 0.58
    },
    disclaimers: [
      "AI-assisted matching supports scanner and fit recommendations, but it should not replace manual review.",
      "Similarity, lighting, and image quality can change confidence outcomes.",
      "Report questionable output through the Legal Hub or Compliance workflow."
    ]
  },
  scanner: {
    cameraPermissionReason: "Camera access is requested only to scan garment labels, product tags, and Circular IDs.",
    imageUsageNotice: "Uploaded images are used to match known products, attach Digital Product Passports, and power demo trust signals.",
    metadataBaking: ["Timestamp", "User ID", "Circular ID", "Location (word form)"]
  },
  passport: {
    scoreMethodology: ["Materials", "Emissions estimates", "Transport distance", "Recyclability", "Durability rating"],
    transparencyDisclaimer:
      "Sustainability indicators are decision-support guidance. Review source records, repair guidance, and supplier disclosures before acting."
  },
  accountManagement: {
    passwordReset: true,
    emailVerification: true,
    oauthProviders: [
      { provider: "google", url: "https://auth.circularfinder.demo/google", message: "google OAuth scaffold is ready for client credentials." },
      { provider: "apple", url: "https://auth.circularfinder.demo/apple", message: "apple OAuth scaffold is ready for client credentials." }
    ]
  }
};

function isGithubPagesHost() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.location.hostname.endsWith("github.io");
}

function shouldUseDemoApi() {
  return process.env.NEXT_PUBLIC_STATIC_DEMO === "true" || isGithubPagesHost();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const url =
    /^https?:\/\//i.test(path)
      ? new URL(path)
      : new URL(path.replace(/^\/+/, ""), NORMALIZED_API_BASE_URL);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = getErrorMessage(payload);
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}

async function withDemoFallback<T>(remote: () => Promise<T>, fallback: () => T | Promise<T>) {
  if (shouldUseDemoApi()) {
    return fallback();
  }

  try {
    return await remote();
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && /fetch|network|load/i.test(error.message))) {
      return fallback();
    }
    throw error;
  }
}

function getErrorMessage(payload: unknown) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }
  if (payload && typeof payload === "object") {
    const message = "message" in payload ? (payload as { message?: unknown }).message : undefined;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    const detail = "detail" in payload ? (payload as { detail?: unknown }).detail : undefined;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }
  return "Request failed.";
}

function toFrontendId(value: string | number | undefined | null) {
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

function toMoney(value: string | number | undefined | null) {
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

function extractMaterials(materials: BackendProduct["materials"] | BackendCircularId["materials"]) {
  if (!materials || typeof materials !== "object") {
    return ["Tracked material blend"];
  }

  const candidateValues = Object.values(materials).flatMap((value) => (Array.isArray(value) ? value : [value]));
  const strings = candidateValues.filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  return strings.length ? strings : ["Tracked material blend"];
}

function categoryImage(category: string, seed: string) {
  const key = category.toLowerCase();
  const collection: Record<string, string[]> = {
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
    ]
  };

  const pool = collection[key] ?? [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
  ];

  return pool[toFrontendId(seed) % pool.length];
}

function deriveRatingLabel(score: number) {
  if (score >= 92) return "A";
  if (score >= 86) return "A-";
  if (score >= 80) return "B+";
  if (score >= 72) return "B";
  return "C";
}

function adaptBrand(brand?: BackendBrand | null): Brand {
  const name = brand?.name ?? "Circular Finder Demo";
  const score = brand?.sustainabilityScore ?? brand?.governanceScore ?? 82;

  return {
    id: toFrontendId(brand?.id ?? name),
    name,
    slug: brand?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: brand?.description ?? `${name} is a governed Circular Finder brand profile used in the live marketplace demo.`,
    headquartersRegion: "Global demo network",
    transparencyScore: brand?.trustScore ?? brand?.governanceScore ?? 86,
    sustainabilityRating: Math.round((score / 20) * 10) / 10,
    ratingLabel: deriveRatingLabel(score),
    demographics: ["Women", "Men", "Unisex"],
    certifications: ["Circular Finder Demo"],
    website: brand?.website ?? "https://circularfinder.demo",
    isVerified: brand?.verified ?? true
  };
}

function adaptPassport(product: Product, circular?: BackendCircularId | null) {
  const materials = extractMaterials(circular?.materials ?? null);
  const sustainabilityScore = circular?.sustainabilityScore ?? Math.round(product.brand.sustainabilityRating * 20);
  const passportId = circular?.code ?? `DPP-${product.productCode}`;

  const passport: Passport = {
    passportDbId: toFrontendId(circular?.id ?? passportId),
    passportId,
    manufacturer: product.brand.name,
    factoryLocation: circular?.origin ?? product.brand.headquartersRegion,
    countryOfOrigin: circular?.origin ?? "Global demo network",
    materialComposition: materials,
    carbonFootprintKg: Math.max(2.4, Number((11 - sustainabilityScore / 10).toFixed(1))),
    waterUsageLiters: Math.round(900 + (100 - sustainabilityScore) * 18),
    sustainabilityCertifications: ["Circular Finder Demo", `Impact score ${sustainabilityScore}`],
    careInstructions:
      circular?.careInstructions ??
      "Wash only when needed, air dry where possible, and follow fabric-safe care to extend garment life.",
    repairInstructions: circular?.repairGuide ?? "Repair seams, replace trims, and resell through the Circular Finder network.",
    recyclingInstructions: "Reuse, repair, or route the garment to a certified Circular Finder recovery partner.",
    takeBackProgram: `${product.brand.name} take-back and Circular Finder recovery partners support repair, resale, and end-of-life routing.`,
    durabilityRating: Math.round((sustainabilityScore + product.brand.transparencyScore) / 2),
    circularityScore: sustainabilityScore,
    resaleValueEstimate: Math.round(toMoney((circular?.passportData as { resaleValue?: number } | null | undefined)?.resaleValue) || product.msrp * 0.62),
    passportStatus: circular?.authenticityStatus ?? "Catalog ready",
    qrCode: `QR-${passportId}`,
    barcode: `BAR-${product.productCode}`,
    nfcTag: `NFC-${passportId}`,
    verifiedAt: new Date().toISOString(),
    journey: [],
    product,
    brand: product.brand
  };

  passportCache.set(passport.passportId, passport);
  return passport;
}

function adaptProduct(product: BackendProduct): Product {
  const brand = adaptBrand(product.brand);
  const category = titleCase(product.category);
  const adapted: Product = {
    id: toFrontendId(product.id),
    productCode: product.sku,
    name: product.name,
    garmentType: category,
    category,
    targetDemographic: "Unisex",
    baseColor: "charcoal",
    materialsSummary: extractMaterials(product.materials).join(" • "),
    msrp: toMoney(product.price),
    productStory: product.description,
    imageUrl: categoryImage(product.category, product.id),
    styleTags: [category.toLowerCase(), "circular", "traceable", product.origin.toLowerCase()],
    brand
  };

  const firstCircular = product.circularIds?.[0];
  if (firstCircular) {
    adapted.passport = adaptPassport(adapted, firstCircular);
  }

  return adapted;
}

function adaptListing(product: BackendProduct, inventory?: BackendInventory | null): MarketplaceListing {
  const adaptedProduct = adaptProduct(product);
  const circular = product.circularIds?.find((entry) => entry.inventoryId === inventory?.id) ?? product.circularIds?.[0] ?? null;
  const passport = adaptedProduct.passport ?? adaptPassport(adaptedProduct, circular);
  const listingId = toFrontendId(inventory?.id ?? `listing-${product.id}`);

  listingBackendMap.set(listingId, {
    productId: product.id,
    inventoryId: inventory?.id,
    circularCode: circular?.code
  });

  return {
    id: listingId,
    title: `${product.name} ${inventory ? `• ${inventory.sizeLabel}` : ""}`.trim(),
    description: product.description,
    sizeLabel: inventory?.sizeLabel ?? "One size",
    condition: (inventory?.condition ?? "NEW").toLowerCase(),
    price: toMoney(inventory?.price ?? product.price),
    predictedPrice: Math.round(toMoney(inventory?.price ?? product.price) * 0.97),
    expectedDaysToSell: Math.max(2, 10 - Math.round((inventory?.trustScore ?? 80) / 14)),
    status: inventory?.availableQuantity === 0 ? "sold" : "live",
    imageUrl: adaptedProduct.imageUrl,
    seller: {
      id: toFrontendId(inventory?.id ?? product.brandId),
      name: product.subBrand?.name ?? product.brand?.name ?? adaptedProduct.brand.name
    },
    product: adaptedProduct,
    passport
  };
}

function adaptListings(products: BackendProduct[]) {
  return products.flatMap((product) => {
    if (product.inventories?.length) {
      return product.inventories.map((inventory) => adaptListing(product, inventory));
    }
    return [adaptListing(product)];
  });
}

function adaptUserProfile(profile: BackendProfile): UserProfile {
  const roleValue = profile.user?.role;
  const roleKey = typeof roleValue === "string" ? roleValue : roleValue?.name ?? roleValue?.key ?? "STANDARD_USER";

  return {
    id: toFrontendId(profile.user?.id ?? profile.userId),
    fullName: profile.user?.fullName ?? profile.displayName,
    email: profile.user?.email ?? `${profile.userId}@circularfinder.demo`,
    role: roleKey
  };
}

function extractCircularCode(value: string) {
  const trimmed = value.trim().toUpperCase();
  const directMatch = trimmed.match(/CF-[A-Z0-9-]+/);
  return directMatch?.[0] ?? trimmed;
}

function invalidateRemoteCatalog(token?: string) {
  if (!token) {
    remoteCatalogCache.clear();
    return;
  }
  remoteCatalogCache.delete(token);
  remoteCatalogCache.delete("__guest__");
}

async function getRemoteCatalog(token?: string, search?: string) {
  const cacheKey = token || "__guest__";
  if (!search) {
    const cached = remoteCatalogCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const products = await request<BackendProduct[]>("/products", {
    token,
    params: {
      q: search || undefined
    }
  });

  if (!search) {
    remoteCatalogCache.set(cacheKey, products);
  }

  return products;
}

async function buildRemoteBootstrap(token?: string): Promise<BootstrapPayload> {
  const demo = getDemoBootstrap(token);
  const [products, suppliers, profile, wardrobe, outfits] = await Promise.all([
    getRemoteCatalog(token),
    request<{ items: Supplier[] }>("/suppliers/map"),
    token ? request<BackendProfile>("/profiles/me", { token }) : Promise.resolve(null),
    token ? request<{ items: WardrobeItem[]; insights: WardrobeInsights; outfits: Outfit[] }>("/wardrobe", { token }) : Promise.resolve(null),
    token ? request<{ items: Outfit[] }>("/styling/outfits", { token }) : Promise.resolve(null)
  ]);
  const adaptedProducts = products.map(adaptProduct);
  const marketplace = adaptListings(products);
  const brands = Array.from(new Map(adaptedProducts.map((product) => [product.brand.slug, product.brand])).values());

  return {
    ...demo,
    brands,
    knownBrandOptions: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug
    })),
    suppliers: suppliers.items,
    products: adaptedProducts,
    marketplace,
    user: profile
      ? {
          profile: adaptUserProfile(profile),
          wardrobe: wardrobe?.items ?? [],
          insights: wardrobe?.insights ?? emptyWardrobeInsights(),
          outfits: outfits?.items ?? wardrobe?.outfits ?? []
        }
      : null
  };
}

function emptyWardrobeInsights(): WardrobeInsights {
  return {
    inventoryCount: 0,
    usageRate: 0,
    outfitPotential: 0,
    totalWardrobeValue: 0,
    resaleValue: 0,
    unusedClothingValue: 0,
    repairReadyCount: 0,
    recommendations: []
  };
}

function normalizeAuthResponse(response: BackendAuthResponse) {
  return {
    token: response.accessToken,
    user: {
      id: toFrontendId(response.user.id),
      fullName: response.user.fullName,
      email: response.user.email,
      role: response.user.role
    } satisfies UserProfile
  };
}

export const apiBaseUrl = API_BASE_URL;

type PassportLookupResponse = {
  recognized: boolean;
  confidence: number;
  message?: string;
  passport?: Passport;
};

type UploadScanResponse = PassportLookupResponse & {
  uploadedImageUrl?: string;
};

export async function fetchBootstrap(token?: string): Promise<BootstrapPayload> {
  return withDemoFallback(() => buildRemoteBootstrap(token), () => getDemoBootstrap(token));
}

export async function login(email: string, password: string) {
  return withDemoFallback(
    async () => normalizeAuthResponse(await request<BackendAuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })),
    () => demoLogin(email)
  );
}

export async function register(fullName: string, email: string, password: string) {
  return withDemoFallback(
    async () =>
      normalizeAuthResponse(
        await request<BackendAuthResponse>("/auth/register", {
          method: "POST",
          body: JSON.stringify({ fullName, email, password })
        })
      ),
    () => demoRegister(fullName, email)
  );
}

export async function fetchSuppliers(filters: {
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
}): Promise<{ items: Supplier[] }> {
  return withDemoFallback(() => request<{ items: Supplier[] }>("/suppliers/map", { params: filters }), () => getDemoSuppliers(filters));
}

export async function fetchMarketplace(filters: { search?: string; brand?: string }, token?: string): Promise<{ items: MarketplaceListing[] }> {
  return withDemoFallback(
    async (): Promise<{ items: MarketplaceListing[] }> => {
      const products = await getRemoteCatalog(token, filters.search);
      const items = adaptListings(products).filter((listing) => {
        if (filters.brand && listing.product.brand.name !== filters.brand) {
          return false;
        }
        if (!filters.search) {
          return true;
        }
        const search = filters.search.toLowerCase();
        return [listing.title, listing.description, listing.product.name, listing.product.brand.name, listing.condition]
          .join(" ")
          .toLowerCase()
          .includes(search);
      });

      return { items };
    },
    () => getDemoMarketplace(filters)
  );
}

export async function fetchPassport(passportId: string, token?: string): Promise<Passport> {
  const cached = passportCache.get(passportId);
  if (cached) {
    return cached;
  }

  if (!passportId.toUpperCase().startsWith("CF-")) {
    return getDemoPassport(passportId);
  }

  return withDemoFallback(
    async (): Promise<Passport> => {
      const record = await request<BackendCircularRecord>(`/circular-id/${encodeURIComponent(passportId)}`, { token });
      const product = record.product
        ? adaptProduct(record.product)
        : adaptProduct((await getRemoteCatalog(token)).find((item) => item.id === record.productId) as BackendProduct);
      return adaptPassport(product, record);
    },
    () => getDemoPassport(passportId)
  );
}

export async function lookupPassport(scanType: string, scanValue: string, hints: string, token?: string): Promise<PassportLookupResponse> {
  const circularCode = extractCircularCode(scanValue);
  if (!circularCode.startsWith("CF-")) {
    return demoLookupPassport(scanValue, hints);
  }

  return withDemoFallback(
    async (): Promise<PassportLookupResponse> => {
      const record = await request<BackendCircularRecord>("/scanner/lookup", {
        method: "POST",
        token,
        body: JSON.stringify({
          value: circularCode,
          scanType,
          locationText: hints || "Circular Finder frontend"
        })
      });

      const product = record.product ? adaptProduct(record.product) : adaptProduct((await getRemoteCatalog(token)).find((item) => item.id === record.productId) as BackendProduct);
      return {
        recognized: true,
        confidence: 0.94,
        passport: adaptPassport(product, record)
      };
    },
    () => demoLookupPassport(scanValue, hints)
  );
}

export async function uploadScan(file: File | Blob, fileName: string, hints: string, brandHint: string, token?: string): Promise<UploadScanResponse> {
  return withDemoFallback(
    async (): Promise<UploadScanResponse> => {
      const form = new FormData();
      form.append("file", file, fileName);
      form.append("hints", hints);
      form.append("brand_hint", brandHint);

      return request<UploadScanResponse>("/scanner/upload", {
        method: "POST",
        token,
        body: form
      });
    },
    () => demoUploadScan(hints, brandHint)
  );
}

export async function addWardrobeItem(passportId: string, token: string, nickname?: string, purchasePrice?: number) {
  return withDemoFallback(
    () =>
      request<{ message: string; item: WardrobeItem }>("/wardrobe/items", {
        method: "POST",
        token,
        body: JSON.stringify({
          passport_id: passportId,
          nickname: nickname ?? "",
          condition: "excellent",
          purchase_price: purchasePrice
        })
      }),
    () => demoAddWardrobeItem(passportId, nickname, purchasePrice)
  );
}

export async function fetchWardrobe(token: string) {
  return withDemoFallback(
    () => request<{ items: WardrobeItem[]; insights: WardrobeInsights; outfits: Outfit[] }>("/wardrobe", { token }),
    () => getDemoWardrobe()
  );
}

export async function logWardrobeEvent(itemId: number, eventType: string, token: string) {
  return withDemoFallback(
    () =>
      request<{ message: string; item: WardrobeItem }>(`/wardrobe/items/${itemId}/events`, {
        method: "POST",
        token,
        body: JSON.stringify({
          event_type: eventType,
          note: `${eventType} logged from the live dashboard.`
        })
      }),
    async () => {
      const wardrobe = getDemoWardrobe();
      const item = wardrobe.items.find((entry) => entry.id === itemId);
      if (!item) {
        throw new Error("Wardrobe item not found.");
      }
      return {
        message: "Demo wardrobe event logged.",
        item
      };
    }
  );
}

export async function fetchOutfits(token: string) {
  return withDemoFallback(() => request<{ items: Outfit[] }>("/styling/outfits", { token }), () => getDemoOutfits());
}

export async function createListing(
  token: string,
  payload: {
    passport_id: string;
    wardrobe_item_id?: number;
    title: string;
    description?: string;
    size_label: string;
    condition: string;
    price: number;
  }
) {
  return withDemoFallback(
    async () => {
      const products = await getRemoteCatalog(token);
      const source =
        products.find((product) => product.circularIds?.some((entry) => entry.code === payload.passport_id)) ??
        products[0];

      if (!source) {
        throw new Error("A catalog product is required before creating a live listing.");
      }

      const created = await request<BackendProduct>("/products", {
        method: "POST",
        token,
        body: JSON.stringify({
          brandId: source.brandId,
          subBrandId: source.subBrandId ?? undefined,
          name: payload.title,
          sku: `CF-LIVE-${Date.now().toString().slice(-6)}`,
          category: source.category,
          description: payload.description || "Created from the Circular Finder marketplace listing form.",
          materials: extractMaterials(source.materials),
          price: payload.price,
          carbonScore: source.carbonScore,
          repairabilityScore: source.repairabilityScore,
          sustainabilityScore: source.sustainabilityScore,
          reuseValue: Math.max(payload.price * 0.72, 12),
          fitGuidance: source.fitGuidance,
          careInstructions: source.careInstructions,
          origin: source.origin,
          verified: true
        })
      });

      invalidateRemoteCatalog(token);
      const listing = adaptListing({ ...created, brand: source.brand, subBrand: source.subBrand, inventories: [], circularIds: [] });

      return {
        message: "Live marketplace product created from the demo listing flow.",
        listing
      };
    },
    () => demoCreateListing(payload)
  );
}

export async function createOrder(token: string, listingId: number, shippingAddress: string) {
  return withDemoFallback(
    async () => {
      const listing = listingBackendMap.get(listingId);
      if (!listing) {
        throw new Error("That listing is not available in the live catalog.");
      }

      const order = await request<{
        id: string;
        status: string;
        total: string | number;
      }>("/orders/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({
          productId: listing.productId,
          inventoryId: listing.inventoryId,
          quantity: 1,
          shippingLine1: shippingAddress,
          shippingCity: "Los Angeles",
          shippingCountry: "United States"
        })
      });

      return {
        message: "Live order created.",
        order: {
          id: toFrontendId(order.id),
          trackingReference: `CF-${String(toFrontendId(order.id)).slice(-6)}`,
          orderStatus: order.status.toLowerCase(),
          totalPrice: toMoney(order.total)
        }
      };
    },
    () => demoCreateOrder(listingId)
  );
}

export async function fetchTrustCenter(): Promise<TrustCenterPayload> {
  return withDemoFallback(
    () => request<TrustCenterPayload>("/trust-center"),
    () => demoTrustCenter
  );
}

export async function fetchMySettings(token: string): Promise<UserSettingRecord[]> {
  return withDemoFallback(
    () => request<UserSettingRecord[]>("/settings", { token }),
    () => []
  );
}

export async function saveMySetting(token: string, key: string, value: Record<string, unknown>) {
  return withDemoFallback(
    () =>
      request<UserSettingRecord>("/settings", {
        method: "POST",
        token,
        body: JSON.stringify({
          scope: "USER",
          key,
          value
        })
      }),
    () => ({
      id: `demo-${key}`,
      scope: "USER",
      scopeId: "demo-user",
      key,
      value
    })
  );
}
