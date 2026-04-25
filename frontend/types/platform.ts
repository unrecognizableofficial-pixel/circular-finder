export type Brand = {
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

export type SupplierBrandLink = {
  id: number;
  name: string;
  relationshipType: string;
  transparencyScore: number;
};

export type Supplier = {
  id: number;
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
  isVerified: boolean;
  brands: SupplierBrandLink[];
};

export type ProductJourneyStep = {
  id: number;
  stepType: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  details: string;
  stepOrder: number;
  supplierId: number | null;
};

export type Passport = {
  passportDbId: number;
  passportId: string;
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
  passportStatus: string;
  qrCode: string;
  barcode: string;
  nfcTag: string;
  verifiedAt: string;
  journey: ProductJourneyStep[];
  product?: Product;
  brand?: Brand;
};

export type Product = {
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
  brand: Brand;
  passport?: Passport;
};

export type MarketplaceListing = {
  id: number;
  title: string;
  description: string;
  sizeLabel: string;
  condition: string;
  price: number;
  predictedPrice: number;
  expectedDaysToSell: number;
  status: string;
  imageUrl: string;
  seller: {
    id: number;
    name: string;
  };
  product: Product;
  passport: Passport;
};

export type WardrobeEvent = {
  id: number;
  eventType: string;
  note: string;
  createdAt: string;
};

export type WardrobeItem = {
  id: number;
  nickname: string;
  condition: string;
  status: string;
  wearCount: number;
  repairCount: number;
  lastWornAt: string | null;
  acquiredOn: string | null;
  purchasePrice: number | null;
  notes: string;
  resaleOpportunity: number;
  product: Product;
  passport: Passport;
  events: WardrobeEvent[];
};

export type Outfit = {
  title: string;
  summary: string;
  items: WardrobeItem[];
};

export type WardrobeInsights = {
  inventoryCount: number;
  usageRate: number;
  outfitPotential: number;
  totalWardrobeValue: number;
  resaleValue: number;
  unusedClothingValue: number;
  repairReadyCount: number;
  recommendations: string[];
};

export type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export type BootstrapUser = {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  insights: WardrobeInsights;
  outfits: Outfit[];
};

export type BootstrapPayload = {
  app: {
    name: string;
    philosophy: string[];
  };
  brands: Brand[];
  knownBrandOptions: { id: number; name: string; slug: string }[];
  suppliers: Supplier[];
  products: Product[];
  marketplace: MarketplaceListing[];
  user: BootstrapUser | null;
};

export type BodyProfile = {
  id: string;
  name: string;
  heightCm: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  inseamCm: number;
  preferredFit: "tailored" | "regular" | "relaxed";
  stylePreferences: string[];
};
