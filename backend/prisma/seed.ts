import bcrypt from "bcrypt";
import {
  Prisma,
  PrismaClient,
  RoleKey,
  AccountStatus,
  PostStatus,
  ComplianceSeverity,
  ComplianceActionType,
  TrainingFormat,
  NotificationType,
  ProductCondition,
  OrderStatus,
  ImpactPointType,
  SettingScope,
  MediaAssetType,
  SessionStatus,
  OrganizationPlan,
  PassportVerificationStatus,
  LegalDocumentStatus,
  AgentTaskStatus
} from "@prisma/client";

const prisma = new PrismaClient();

const appCopy = {
  name: "Circular Finder",
  tagline: "Know how it’s made. Know how it fits. Know your impact.",
  motto: "REUSE • REPAIR • REIMAGINE",
  copyright: "© 2026 Circular Finder, LLC All Rights Reserved"
};

const permissionSeeds = [
  ["auth", "manage"],
  ["users", "read"],
  ["users", "update"],
  ["roles", "assign"],
  ["permissions", "assign"],
  ["profiles", "manage"],
  ["feed", "publish"],
  ["feed", "moderate"],
  ["feed", "read"],
  ["marketplace", "browse"],
  ["marketplace", "manage"],
  ["orders", "manage"],
  ["brands", "manage"],
  ["sub-brands", "manage"],
  ["governance", "reset"],
  ["governance", "preset-approve"],
  ["compliance", "review"],
  ["compliance", "freeze"],
  ["compliance", "suspend"],
  ["training", "assign"],
  ["impact", "manage"],
  ["impact", "view"],
  ["notifications", "send"],
  ["analytics", "view"],
  ["analytics", "full"],
  ["enterprise", "view"],
  ["enterprise", "manage"],
  ["ai-agents", "orchestrate"],
  ["passports", "read"],
  ["passports", "manage"],
  ["legal", "manage"],
  ["finance", "view"],
  ["supply-chain", "manage"],
  ["investor", "view"],
  ["circular-id", "generate"],
  ["circular-id", "transfer"],
  ["scanner", "lookup"],
  ["settings", "manage"],
  ["files", "upload"]
] as const;

const rolePermissions: Record<RoleKey, string[]> = {
  MASTER_BRAND_ADMIN: permissionSeeds.map(([resource, action]) => `${resource}:${action}`),
  COMPLIANCE_ADMIN: [
    "users:read",
    "feed:read",
    "feed:moderate",
    "marketplace:browse",
    "brands:manage",
    "compliance:review",
    "compliance:freeze",
    "compliance:suspend",
    "training:assign",
    "notifications:send",
    "analytics:view",
    "enterprise:view",
    "enterprise:manage",
    "ai-agents:orchestrate",
    "passports:read",
    "passports:manage",
    "legal:manage",
    "finance:view",
    "supply-chain:manage",
    "investor:view",
    "scanner:lookup"
  ],
  SUB_BRAND_MANAGER: [
    "profiles:manage",
    "feed:publish",
    "feed:read",
    "marketplace:browse",
    "marketplace:manage",
    "orders:manage",
    "sub-brands:manage",
    "impact:view",
    "enterprise:view",
    "passports:read",
    "passports:manage",
    "supply-chain:manage",
    "circular-id:generate",
    "scanner:lookup",
    "files:upload",
    "settings:manage"
  ],
  CREATOR: [
    "profiles:manage",
    "feed:publish",
    "feed:read",
    "marketplace:browse",
    "impact:view",
    "enterprise:view",
    "passports:read",
    "scanner:lookup",
    "settings:manage"
  ],
  VENDOR: [
    "profiles:manage",
    "feed:read",
    "marketplace:browse",
    "marketplace:manage",
    "orders:manage",
    "impact:view",
    "enterprise:view",
    "passports:read",
    "passports:manage",
    "circular-id:generate",
    "scanner:lookup",
    "files:upload",
    "settings:manage"
  ],
  STANDARD_USER: [
    "profiles:manage",
    "feed:publish",
    "feed:read",
    "marketplace:browse",
    "impact:view",
    "enterprise:view",
    "passports:read",
    "scanner:lookup",
    "settings:manage"
  ]
};

const firstNames = ["Mia", "Jordan", "Kai", "Avery", "Sage", "Rowan", "Taylor", "Reese", "Elliot", "Nora", "Cam", "Devon", "Parker", "Quinn", "Skye"];
const lastNames = ["Mercer", "Lane", "Rivera", "Parker", "Reed", "Stone", "Lin", "Hayes", "Walker", "Brooks", "Adair", "Vale", "Monroe", "Sutton", "Blake"];
const brandWords = ["Aureline", "Loop Standard", "Renew Atelier", "Hinterland", "Signal Studio", "North Thread", "Studio House", "Everform", "Kindred Cloth", "True Loom"];
const categories = ["Outerwear", "Knitwear", "Denim", "Accessories", "Shirting", "Tailoring"];
const materials = [
  ["Organic cotton", "Recycled cotton"],
  ["Merino wool", "Recycled nylon"],
  ["Linen", "Tencel"],
  ["Recycled denim", "Organic cotton"],
  ["Recycled polyester", "Organic cotton"],
  ["Hemp", "Organic cotton"]
];
const cities = ["Los Angeles", "New York", "Austin", "Portland", "San Francisco", "Chicago", "Seattle", "Miami", "Denver", "Atlanta"];
const countries = ["United States", "Portugal", "Italy", "Japan", "Spain", "Canada"];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function toHandle(fullName: string, index: number) {
  return `${slugify(fullName)}-${index}`;
}

async function main() {
  const passwordHash = await bcrypt.hash("Circular123!", 10);

  await prisma.$transaction([
    prisma.analyticsEvent.deleteMany(),
    prisma.agentMemory.deleteMany(),
    prisma.agentTask.deleteMany(),
    prisma.investorReport.deleteMany(),
    prisma.legalDocument.deleteMany(),
    prisma.aiAgentLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.savedPost.deleteMany(),
    prisma.postShare.deleteMany(),
    prisma.like.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.review.deleteMany(),
    prisma.order.deleteMany(),
    prisma.inventory.deleteMany(),
    prisma.wardrobeEventRecord.deleteMany(),
    prisma.wardrobeItemRecord.deleteMany(),
    prisma.scanHistory.deleteMany(),
    prisma.ownershipHistory.deleteMany(),
    prisma.circularId.deleteMany(),
    prisma.sustainabilityScore.deleteMany(),
    prisma.digitalProductPassport.deleteMany(),
    prisma.brandPreset.deleteMany(),
    prisma.product.deleteMany(),
    prisma.supplierRecord.deleteMany(),
    prisma.manufacturer.deleteMany(),
    prisma.challengeProgress.deleteMany(),
    prisma.challenge.deleteMany(),
    prisma.leaderboardEntry.deleteMany(),
    prisma.leaderboard.deleteMany(),
    prisma.impactPoint.deleteMany(),
    prisma.trainingAssignment.deleteMany(),
    prisma.certification.deleteMany(),
    prisma.trainingModule.deleteMany(),
    prisma.complianceEvent.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.session.deleteMany(),
    prisma.mediaAsset.deleteMany(),
    prisma.follower.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.subBrand.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.organization.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.role.deleteMany()
  ]);

  const createdRoles = new Map<RoleKey, string>();
  for (const roleKey of Object.values(RoleKey)) {
    const role = await prisma.role.create({
      data: {
        key: roleKey,
        name: roleKey.replaceAll("_", " "),
        description: `${roleKey.replaceAll("_", " ")} access layer for ${appCopy.name}.`
      }
    });
    createdRoles.set(roleKey, role.id);
  }

  const createdPermissions = new Map<string, string>();
  for (const [resource, action] of permissionSeeds) {
    const permission = await prisma.permission.create({
      data: {
        resource,
        action,
        key: `${resource}:${action}`,
        description: `Allows ${action} on ${resource}.`
      }
    });
    createdPermissions.set(permission.key, permission.id);
  }

  for (const [roleKey, keys] of Object.entries(rolePermissions) as [RoleKey, string[]][]) {
    await prisma.rolePermission.createMany({
      data: keys.map((key) => ({
        roleId: createdRoles.get(roleKey)!,
        permissionId: createdPermissions.get(key)!
      }))
    });
  }

  const users: { id: string; role: RoleKey; fullName: string }[] = [];
  const roleDistribution: RoleKey[] = [
    RoleKey.MASTER_BRAND_ADMIN,
    RoleKey.COMPLIANCE_ADMIN,
    ...Array.from({ length: 20 }, () => RoleKey.SUB_BRAND_MANAGER),
    ...Array.from({ length: 20 }, () => RoleKey.CREATOR),
    ...Array.from({ length: 20 }, () => RoleKey.VENDOR),
    ...Array.from({ length: 38 }, () => RoleKey.STANDARD_USER)
  ];

  for (let index = 0; index < 100; index += 1) {
    const firstName = pick(firstNames, index);
    const lastName = pick(lastNames, index + 3);
    const fullName = `${firstName} ${lastName}`;
    const role = roleDistribution[index] ?? RoleKey.STANDARD_USER;
    const email = `${slugify(fullName)}-${index}@circularfinder.demo`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        roleId: createdRoles.get(role)!,
        status: AccountStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(Date.now() - index * 60_000)
      }
    });
    users.push({ id: user.id, role, fullName });

    await prisma.profile.create({
      data: {
        userId: user.id,
        handle: toHandle(fullName, index),
        displayName: fullName,
        bio: `${appCopy.name} demo profile for ${role.replaceAll("_", " ").toLowerCase()}.`,
        location: `${pick(cities, index)}, ${pick(countries, index)}`,
        trustScore: 65 + (index % 30),
        reputationScore: 60 + (index % 35),
        impactPoints: 400 + index * 11,
        followersCount: index % 120,
        verified: role !== RoleKey.STANDARD_USER,
        stylePreferences: { fit: index % 2 === 0 ? "tailored" : "relaxed", palette: index % 3 === 0 ? "earth" : "monochrome" },
        sustainabilityFocus: { motto: appCopy.motto, goals: ["reuse", "repair", "reimagine"] }
      }
    });
  }

  const masterAdmin = users.find((user) => user.role === RoleKey.MASTER_BRAND_ADMIN)!;
  const complianceAdmin = users.find((user) => user.role === RoleKey.COMPLIANCE_ADMIN)!;
  const managers = users.filter((user) => user.role === RoleKey.SUB_BRAND_MANAGER);
  const creators = users.filter((user) => user.role === RoleKey.CREATOR);
  const vendors = users.filter((user) => user.role === RoleKey.VENDOR);
  const members = users.filter((user) => user.role === RoleKey.STANDARD_USER);

  const organizations: { id: string; name: string }[] = [];
  for (let index = 0; index < 5; index += 1) {
    const organizationName = `${pick(brandWords, index)} Group ${index + 1}`;
    const organization = await prisma.organization.create({
      data: {
        ownerId: index === 0 ? masterAdmin.id : pick(managers, index).id,
        name: organizationName,
        slug: slugify(organizationName),
        domain: `${slugify(organizationName)}.circularfinder.demo`,
        plan: pick(
          [OrganizationPlan.ENTERPRISE, OrganizationPlan.GROWTH, OrganizationPlan.INVESTOR_MODE],
          index
        ),
        verified: true,
        metadata: {
          focus: index % 2 === 0 ? "supply_chain_visibility" : "passport_automation",
          investorMode: index === 0
        }
      }
    });
    organizations.push({ id: organization.id, name: organization.name });
  }

  const manufacturers: { id: string; organizationId: string; name: string; country: string }[] = [];
  for (let index = 0; index < 12; index += 1) {
    const organization = pick(organizations, index);
    const manufacturerName = `${organization.name} Manufacturing ${index + 1}`;
    const manufacturer = await prisma.manufacturer.create({
      data: {
        organizationId: organization.id,
        name: manufacturerName,
        country: pick(countries, index),
        region: pick(cities, index),
        verificationStatus: PassportVerificationStatus.VERIFIED,
        complianceScore: 80 + (index % 16),
        emissionsFactorKg: 8 + (index % 9),
        metadata: {
          specialty: pick(categories, index),
          certified: true
        }
      }
    });
    manufacturers.push({
      id: manufacturer.id,
      organizationId: organization.id,
      name: manufacturer.name,
      country: manufacturer.country
    });
  }

  const supplierRecords: { id: string; organizationId: string; manufacturerId: string; name: string }[] = [];
  for (let index = 0; index < 20; index += 1) {
    const manufacturer = pick(manufacturers, index);
    const supplier = await prisma.supplierRecord.create({
      data: {
        organizationId: manufacturer.organizationId,
        manufacturerId: manufacturer.id,
        name: `${manufacturer.name} Supplier ${index + 1}`,
        supplierType: pick(["TEXTILE_MILL", "TRIMS", "DYE_HOUSE", "REPAIR_HUB"], index),
        country: manufacturer.country,
        region: pick(cities, index + 2),
        verificationStatus: PassportVerificationStatus.VERIFIED,
        materials: { composition: pick(materials, index) },
        riskScore: 12 + (index % 18),
        sustainabilityScore: 76 + (index % 18),
        metadata: {
          demoNetwork: true,
          verifiedAt: new Date().toISOString()
        }
      }
    });
    supplierRecords.push({
      id: supplier.id,
      organizationId: manufacturer.organizationId,
      manufacturerId: manufacturer.id,
      name: supplier.name
    });
  }

  const brands: { id: string; name: string }[] = [];
  for (let index = 0; index < 10; index += 1) {
    const name = `${pick(brandWords, index)} ${index + 1}`;
    const brand = await prisma.brand.create({
      data: {
        ownerId: masterAdmin.id,
        organizationId: pick(organizations, index).id,
        name,
        slug: slugify(name),
        description: `${name} is a governed brand inside the ${appCopy.name} enterprise demo.`,
        website: `https://${slugify(name)}.demo.circularfinder.com`,
        governanceScore: 88 + (index % 8),
        sustainabilityScore: 74 + (index % 16),
        trustScore: 80 + (index % 15),
        verified: true
      }
    });
    brands.push({ id: brand.id, name });

    await prisma.brandPreset.create({
      data: {
        brandId: brand.id,
        name: `${name} Core Preset`,
        colorFamily: index % 2 === 0 ? "Forest / Sand" : "Quartz / Graphite",
        typography: index % 2 === 0 ? "Editorial Sans" : "Modern Grotesk",
        darkModePreview: { accent: "#163326", surface: "#101519" },
        lightModePreview: { accent: "#244d3a", surface: "#f7f3ea" },
        buttonStyles: { primary: "pill", secondary: "outline" },
        marketplaceCardStyle: { shadow: "soft", imageTreatment: "editorial" },
        approvedAt: new Date()
      }
    });
  }

  const subBrands: { id: string; managerId: string; brandId: string; name: string }[] = [];
  for (let index = 0; index < 25; index += 1) {
    const brand = pick(brands, index);
    const manager = pick(managers, index);
    const name = `${brand.name} Studio ${String(index + 1).padStart(2, "0")}`;
    const subBrand = await prisma.subBrand.create({
      data: {
        brandId: brand.id,
        managerId: manager.id,
        name,
        slug: slugify(name),
        description: `${name} is a verified sub-brand used for governance, creator, and marketplace demos.`,
        verified: true,
        complianceScore: 78 + (index % 18),
        riskScore: index % 5 === 0 ? 22 : 8 + (index % 10),
        status: AccountStatus.ACTIVE
      }
    });
    subBrands.push({ id: subBrand.id, managerId: manager.id, brandId: brand.id, name });
  }

  const mediaAssets: { id: string; url: string }[] = [];
  for (let index = 0; index < 80; index += 1) {
    const owner = pick([...creators, ...vendors, ...managers], index);
    const asset = await prisma.mediaAsset.create({
      data: {
        ownerId: owner.id,
        type: MediaAssetType.IMAGE,
        bucket: "circular-finder",
        objectKey: `demo/image-${index + 1}.jpg`,
        url: `https://images.circularfinder.demo/assets/${index + 1}.jpg`,
        mimeType: "image/jpeg",
        bytes: 250_000 + index * 512,
        metadata: { alt: `${appCopy.name} demo asset ${index + 1}` },
        watermarkOpacity: 48
      }
    });
    mediaAssets.push({ id: asset.id, url: asset.url });
  }

  const products: { id: string; brandId: string; subBrandId: string; price: number }[] = [];
  for (let index = 0; index < 200; index += 1) {
    const brand = pick(brands, index);
    const subBrand = pick(subBrands, index);
    const category = pick(categories, index);
    const product = await prisma.product.create({
      data: {
        brandId: brand.id,
        subBrandId: subBrand.id,
        name: `${brand.name} ${category} ${index + 1}`,
        slug: slugify(`${brand.name}-${category}-${index + 1}`),
        sku: `CF-${String(index + 1).padStart(4, "0")}`,
        category,
        sizeRange: { sizes: ["XS", "S", "M", "L", "XL"] },
        description: `${appCopy.name} ${category.toLowerCase()} product seeded for marketplace, passport, and governance demos.`,
        materials: { blend: pick(materials, index) },
        price: 90 + (index % 12) * 18,
        carbonScore: 60 + (index % 35),
        repairabilityScore: 68 + (index % 28),
        reuseValue: 35 + (index % 14) * 8,
        sustainabilityScore: 70 + (index % 26),
        fitGuidance: index % 2 === 0 ? "Regular tailored fit" : "Relaxed layering fit",
        careInstructions: "Cold wash, line dry, repair before replacing.",
        origin: pick(countries, index),
        verified: true
      }
    });
    products.push({ id: product.id, brandId: brand.id, subBrandId: subBrand.id, price: Number(product.price) });
  }

  const inventories: { id: string; productId: string; vendorId: string }[] = [];
  for (let index = 0; index < 200; index += 1) {
    const product = products[index];
    const vendor = pick(vendors, index);
    const inventory = await prisma.inventory.create({
      data: {
        productId: product.id,
        vendorId: vendor.id,
        sizeLabel: pick(["XS", "S", "M", "L", "XL"], index),
        condition: pick([ProductCondition.NEW, ProductCondition.EXCELLENT, ProductCondition.GOOD, ProductCondition.REPAIRABLE], index),
        quantity: 2 + (index % 4),
        availableQuantity: 1 + (index % 3),
        price: product.price + (index % 5) * 6,
        trustScore: 76 + (index % 20),
        nearbyPickup: index % 3 === 0,
        sustainabilityMetadata: {
          repairability: 70 + (index % 20),
          carbonScore: 64 + (index % 20),
          reuseValue: 40 + (index % 18)
        }
      }
    });
    inventories.push({ id: inventory.id, productId: product.id, vendorId: vendor.id });
  }

  const circularIds: { id: string; code: string; productId: string }[] = [];
  for (let index = 0; index < 200; index += 1) {
    const product = products[index];
    const inventory = inventories[index];
    const circularId = await prisma.circularId.create({
      data: {
        code: `CF-${String(index + 1).padStart(3, "0")}-${String(800 + index).padStart(3, "0")}`,
        productId: product.id,
        inventoryId: inventory.id,
        origin: pick(countries, index),
        materials: { composition: pick(materials, index) },
        fitGuidance: index % 2 === 0 ? "True to size with tailored shoulders" : "Relaxed body with easy layering room",
        repairGuide: "Repair seams, replace closures, and refresh trims before resale.",
        authenticityStatus: "Verified",
        ownershipStatus: "Brand-owned",
        careInstructions: "Wash cool, avoid tumble dry, repair early.",
        sustainabilityScore: 72 + (index % 24),
        lifecycleState: index % 4 === 0 ? "resale-ready" : "active",
        passportData: {
          originMill: "Portugal",
          care: "Cold wash",
          authenticity: "Digital twin verified",
          motto: appCopy.motto
        }
      }
    });
    circularIds.push({ id: circularId.id, code: circularId.code, productId: product.id });
  }

  const digitalPassports: { id: string; passportCode: string; productId: string }[] = [];
  for (let index = 0; index < circularIds.length; index += 1) {
    const circularId = circularIds[index];
    const product = products.find((entry) => entry.id === circularId.productId)!;
    const organization = pick(organizations, index);
    const manufacturer = pick(manufacturers, index);
    const supplierChain = supplierRecords
      .filter((record) => record.manufacturerId === manufacturer.id)
      .slice(0, 2)
      .map((record) => ({
        supplierId: record.id,
        name: record.name,
        role: "tier-1"
      }));

    const passport = await prisma.digitalProductPassport.create({
      data: {
        organizationId: organization.id,
        productId: product.id,
        circularIdId: circularId.id,
        manufacturerId: manufacturer.id,
        passportCode: `DPP-${String(index + 1).padStart(4, "0")}`,
        materialComposition: { composition: pick(materials, index) },
        manufacturingOrigin: manufacturer.country,
        supplierChain: { nodes: supplierChain },
        environmentalImpact: {
          emissionsKg: 10 + (index % 18),
          transportKm: 400 + index * 12,
          recyclability: 68 + (index % 24)
        },
        lifecycleData: {
          stage: index % 4 === 0 ? "resale-ready" : "active",
          verification: "digital_twin_attested"
        },
        verificationStatus: PassportVerificationStatus.VERIFIED
      }
    });
    digitalPassports.push({
      id: passport.id,
      passportCode: passport.passportCode,
      productId: product.id
    });
  }

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const passport = digitalPassports[index];
    const materialsScore = 72 + (index % 20);
    const emissionsScore = 68 + (index % 18);
    const transportScore = 60 + (index % 24);
    const recyclabilityScore = 70 + (index % 22);
    const durabilityScore = 74 + (index % 18);
    const normalizedScore = Math.round(
      materialsScore * 0.24 +
        emissionsScore * 0.2 +
        transportScore * 0.14 +
        recyclabilityScore * 0.2 +
        durabilityScore * 0.22
    );

    await prisma.sustainabilityScore.create({
      data: {
        organizationId: pick(organizations, index).id,
        productId: product.id,
        passportId: passport?.id,
        normalizedScore,
        transparencyConfidence: 78 + (index % 18),
        materialsScore,
        emissionsScore,
        transportScore,
        recyclabilityScore,
        durabilityScore,
        categoryBreakdown: {
          materials: materialsScore,
          emissions: emissionsScore,
          transport: transportScore,
          recyclability: recyclabilityScore,
          durability: durabilityScore
        }
      }
    });
  }

  const wardrobeOwners = [masterAdmin, complianceAdmin, ...managers.slice(0, 4), ...creators.slice(0, 4), ...members.slice(0, 4)];
  for (let index = 0; index < 18; index += 1) {
    const owner = pick(wardrobeOwners, index);
    const circularId = pick(circularIds, index);
    const item = await prisma.wardrobeItemRecord.create({
      data: {
        userId: owner.id,
        circularIdId: circularId.id,
        nickname: index % 3 === 0 ? "Work rotation piece" : `Circular wardrobe item ${index + 1}`,
        condition: index % 4 === 0 ? "good" : "excellent",
        status: "active",
        wearCount: 4 + (index % 12),
        repairCount: index % 5 === 0 ? 1 : 0,
        lastWornAt: new Date(Date.now() - index * 86_400_000),
        acquiredOn: new Date(Date.now() - (45 + index) * 86_400_000),
        purchasePrice: 90 + (index % 7) * 24,
        notes: "Seeded wardrobe item for styling, scanner, and resale demos."
      }
    });

    await prisma.wardrobeEventRecord.create({
      data: {
        itemId: item.id,
        eventType: index % 5 === 0 ? "repair" : "wear",
        note:
          index % 5 === 0
            ? "Repair completed through a Circular Finder partner hub."
            : "Captured as part of the live wardrobe usage timeline."
      }
    });
  }

  for (let index = 0; index < 300; index += 1) {
    await prisma.follower.create({
      data: {
        followerId: pick([...creators, ...members, ...vendors], index).id,
        followingId: pick([...creators, ...managers, ...vendors], index + 5).id
      }
    }).catch(() => undefined);
  }

  const posts: { id: string; subBrandId?: string }[] = [];
  for (let index = 0; index < 500; index += 1) {
    const author = pick([...creators, ...managers, ...vendors], index);
    const subBrand = pick(subBrands, index);
    const brand = pick(brands, index);
    const circularId = pick(circularIds, index);
    const mediaAsset = pick(mediaAssets, index);
    const post = await prisma.post.create({
      data: {
        authorId: author.id,
        brandId: brand.id,
        subBrandId: author.role === RoleKey.SUB_BRAND_MANAGER ? subBrand.id : undefined,
        circularIdId: circularId.id,
        mediaAssetId: mediaAsset.id,
        title: `${appCopy.name} story ${index + 1}`,
        caption: `Demo post ${index + 1} showing Circular ID commerce, trust, and sustainability proof.`,
        autoCaption: `Auto-generated caption for ${appCopy.name} social discovery.`,
        qrCode: `QR-${String(index + 1).padStart(4, "0")}`,
        cta: index % 2 === 0 ? "View Circular ID" : "Shop now",
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - index * 3_600_000),
        engagementScore: 70 + (index % 30),
        likeCount: 20 + (index % 300),
        commentCount: 5 + (index % 40),
        shareCount: 2 + (index % 25),
        saveCount: 1 + (index % 20)
      }
    });
    posts.push({ id: post.id, subBrandId: subBrand.id });
  }

  for (let index = 0; index < 800; index += 1) {
    const post = pick(posts, index);
    const actor = pick([...creators, ...members, ...vendors], index);
    await prisma.like.create({
      data: { postId: post.id, userId: actor.id }
    }).catch(() => undefined);
  }

  for (let index = 0; index < 500; index += 1) {
    await prisma.comment.create({
      data: {
        postId: pick(posts, index).id,
        authorId: pick([...creators, ...members, ...vendors], index + 12).id,
        body: `Comment ${index + 1} supporting resale trust and Impact Points™ momentum.`
      }
    });
  }

  for (let index = 0; index < 300; index += 1) {
    await prisma.savedPost.create({
      data: {
        postId: pick(posts, index).id,
        userId: pick([...members, ...creators, ...vendors], index + 3).id
      }
    }).catch(() => undefined);
    await prisma.postShare.create({
      data: {
        postId: pick(posts, index + 7).id,
        userId: pick([...creators, ...vendors], index).id,
        channel: index % 2 === 0 ? "feed" : "qr-card"
      }
    });
  }

  const orders: { id: string; buyerId: string }[] = [];
  for (let index = 0; index < 120; index += 1) {
    const inventory = pick(inventories, index);
    const product = products.find((item) => item.id === inventory.productId)!;
    const buyer = pick([...members, ...creators, ...managers], index);
    const seller = users.find((user) => user.id === inventory.vendorId)!;
    const subtotal = Number(product.price) + (index % 5) * 8;
    const order = await prisma.order.create({
      data: {
        productId: product.id,
        inventoryId: inventory.id,
        buyerId: buyer.id,
        sellerId: seller.id,
        status: pick([OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED], index),
        quantity: 1,
        subtotal,
        tax: subtotal * 0.08,
        shipping: 12,
        total: subtotal * 1.08 + 12,
        shippingAddress: {
          line1: `${index + 10} Demo Street`,
          city: pick(cities, index),
          country: "United States"
        }
      }
    });
    orders.push({ id: order.id, buyerId: buyer.id });
  }

  for (let index = 0; index < 60; index += 1) {
    const order = pick(orders, index);
    const product = pick(products, index);
    await prisma.review.create({
      data: {
        orderId: order.id,
        productId: product.id,
        authorId: order.buyerId,
        rating: 4 + (index % 2),
        title: "Trusted Circular Finder purchase",
        body: "Strong passport visibility, clear fit guidance, and transparent sustainability details.",
        trustScore: 85 + (index % 10)
      }
    });
  }

  const challenges = [
    ["complete-profile", "Complete profile", "Finish a profile and unlock discovery boosts.", "Profile", 120, "Profile Polished"],
    ["first-post", "Create first post", "Publish your first social story.", "Social", 160, "Story Spark"],
    ["gain-followers", "Gain followers", "Grow five new followers.", "Social", 180, "Momentum"],
    ["upload-product", "Upload first product", "List a product with Circular ID metadata.", "Marketplace", 190, "Catalog Builder"],
    ["scan-circular-id", "Scan Circular ID", "Run a scan and open a passport.", "Scanner", 90, "Digital Twin Finder"],
    ["complete-training", "Complete training", "Resolve a compliance event with training.", "Training", 150, "Compliance Restored"]
  ] as const;

  for (const [key, title, description, category, pointsReward, badgeName] of challenges) {
    await prisma.challenge.create({
      data: {
        key,
        title,
        description,
        category,
        pointsReward,
        badgeName,
        targetCount: key === "gain-followers" ? 5 : 1
      }
    });
  }

  const challengeRows = await prisma.challenge.findMany();
  for (let index = 0; index < 90; index += 1) {
    const user = pick(users, index);
    for (const challenge of challengeRows.slice(0, 4)) {
      const progress = challenge.key === "gain-followers" ? Math.min(5, 1 + (index % 5)) : index % 2 === 0 ? 1 : 0;
      await prisma.challengeProgress.create({
        data: {
          challengeId: challenge.id,
          userId: user.id,
          progress,
          completedAt: progress >= challenge.targetCount ? new Date() : null
        }
      });
    }
  }

  await prisma.leaderboard.create({
    data: {
      key: "impact-points-global",
      title: "Impact Points™",
      scope: "global",
      timeWindow: "30d"
    }
  });
  const leaderboard = await prisma.leaderboard.findFirstOrThrow({ where: { key: "impact-points-global" } });

  for (let index = 0; index < 50; index += 1) {
    const user = pick(users, index);
    const points = 1500 - index * 17;
    await prisma.leaderboardEntry.create({
      data: {
        leaderboardId: leaderboard.id,
        userId: user.id,
        points,
        rank: index + 1,
        metadata: { tier: index < 10 ? "Gold" : index < 25 ? "Silver" : "Bronze" }
      }
    });
  }

  for (let index = 0; index < 500; index += 1) {
    const user = pick(users, index);
    const type = pick(
      [
        ImpactPointType.PURCHASE,
        ImpactPointType.RESALE,
        ImpactPointType.REPAIR,
        ImpactPointType.PROFILE_COMPLETION,
        ImpactPointType.SOCIAL_ENGAGEMENT,
        ImpactPointType.CHALLENGE_COMPLETION,
        ImpactPointType.SUSTAINABILITY_ACTION
      ],
      index
    );
    await prisma.impactPoint.create({
      data: {
        userId: user.id,
        type,
        points: 20 + (index % 7) * 15,
        reason: `${type.replaceAll("_", " ")} awarded in ${appCopy.name}.`,
        sourceId: index % 2 === 0 ? pick(orders, index % orders.length).id : pick(posts, index % posts.length).id,
        metadata: { tagline: appCopy.tagline }
      }
    });
  }

  const trainingModules = [
    ["logo-usage", "Correct logo usage", "brand-guidelines", TrainingFormat.VIDEO, 5],
    ["marketplace-compliance", "Marketplace compliance", "marketplace", TrainingFormat.GUIDE, 7],
    ["social-standards", "Social posting standards", "social", TrainingFormat.QUIZ, 6],
    ["policy-certification", "Policy certification", "governance", TrainingFormat.CERTIFICATION, 10]
  ] as const;

  for (const [key, title, category, format, durationMinutes] of trainingModules) {
    await prisma.trainingModule.create({
      data: {
        key,
        title,
        slug: key,
        category,
        format,
        durationMinutes,
        contentUrl: `https://learn.circularfinder.demo/${key}`,
        body: `${title} for ${appCopy.name}.`,
        quizSchema: format === TrainingFormat.QUIZ ? { passingScore: 80 } : undefined,
        requiredAcknowledgement: true
      }
    });
  }

  const seededModules = await prisma.trainingModule.findMany();
  const scenarioManager = managers[0];
  const scenarioSubBrand = subBrands.find((subBrand) => subBrand.managerId === scenarioManager.id)!;
  const scenarioPost = posts.find((post) => post.subBrandId === scenarioSubBrand.id)!;

  const warningEvent = await prisma.complianceEvent.create({
    data: {
      userId: scenarioManager.id,
      brandId: scenarioSubBrand.brandId,
      subBrandId: scenarioSubBrand.id,
      postId: scenarioPost.id,
      resolvedById: complianceAdmin.id,
      type: "OFF_BRAND_CONTENT",
      severity: ComplianceSeverity.HIGH,
      action: ComplianceActionType.WARNING,
      scoreDelta: -18,
      riskScore: 71,
      policyRef: "MBP-101",
      reason: "Sub-brand posted an off-brand logo treatment with unauthorized colors.",
      suggestedFix: "Replace the logo, revert to approved palette, and complete the training module.",
      metadata: { step: 1, demoFlow: true }
    }
  });

  const freezeEvent = await prisma.complianceEvent.create({
    data: {
      userId: scenarioManager.id,
      brandId: scenarioSubBrand.brandId,
      subBrandId: scenarioSubBrand.id,
      postId: scenarioPost.id,
      resolvedById: complianceAdmin.id,
      type: "ACCOUNT_FREEZE",
      severity: ComplianceSeverity.CRITICAL,
      action: ComplianceActionType.FREEZE,
      scoreDelta: -22,
      riskScore: 90,
      policyRef: "MBP-101",
      reason: "Account frozen pending training and acknowledgement.",
      suggestedFix: "Complete assigned training, acknowledge the guidelines, and request restore.",
      metadata: { duration: "72h", step: 4, demoFlow: true }
    }
  });

  const restoreEvent = await prisma.complianceEvent.create({
    data: {
      userId: scenarioManager.id,
      brandId: scenarioSubBrand.brandId,
      subBrandId: scenarioSubBrand.id,
      postId: scenarioPost.id,
      resolvedById: complianceAdmin.id,
      type: "ACCESS_RESTORED",
      severity: ComplianceSeverity.MEDIUM,
      action: ComplianceActionType.RESTORE,
      scoreDelta: 12,
      riskScore: 42,
      policyRef: "MBP-118",
      reason: "Training complete and access restored.",
      suggestedFix: "Continue compliant behavior to regain full score.",
      metadata: { step: 8, demoFlow: true }
    }
  });

  for (const module of seededModules) {
    await prisma.trainingAssignment.create({
      data: {
        moduleId: module.id,
        userId: scenarioManager.id,
        complianceEventId: freezeEvent.id,
        progress: module.key === "policy-certification" ? 100 : 85,
        passed: module.key === "policy-certification",
        acknowledgedAt: module.key === "policy-certification" ? new Date() : undefined,
        completedAt: module.key === "policy-certification" ? new Date() : undefined
      }
    });
  }

  await prisma.certification.create({
    data: {
      moduleId: seededModules.find((item) => item.key === "policy-certification")!.id,
      userId: scenarioManager.id,
      certificateCode: "CF-CERT-2026-001",
      metadata: { restoredFrom: freezeEvent.id }
    }
  });

  for (let index = 0; index < 200; index += 1) {
    const user = pick(users, index);
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: pick([NotificationType.FOLLOW, NotificationType.IMPACT, NotificationType.ORDER, NotificationType.COMPLIANCE, NotificationType.SOCIAL], index),
        title: `${appCopy.name} notification ${index + 1}`,
        body: index === 0
          ? "Compliance score dropped. Review the training requirement."
          : `Demo notification ${index + 1} for ${appCopy.tagline}`,
        payload: { index, motto: appCopy.motto },
        deliveredAt: new Date()
      }
    });
  }

  for (let index = 0; index < 300; index += 1) {
    const circularId = pick(circularIds, index);
    const user = pick(users, index);
    await prisma.scanHistory.create({
      data: {
        circularIdId: circularId.id,
        userId: user.id,
        scanType: index % 2 === 0 ? "QR" : "Circular ID",
        locationText: `${pick(cities, index)}, ${pick(countries, index)}`,
        metadata: { confidence: 0.94, demo: true }
      }
    });
  }

  for (let index = 0; index < 120; index += 1) {
    const circularId = pick(circularIds, index);
    await prisma.ownershipHistory.create({
      data: {
        circularIdId: circularId.id,
        fromUserId: pick(vendors, index).id,
        toUserId: pick([...members, ...creators], index).id,
        salePrice: 45 + (index % 10) * 5,
        notes: "Ownership transferred through marketplace resale."
      }
    });
  }

  for (let index = 0; index < 150; index += 1) {
    const user = pick(users, index);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: await bcrypt.hash(`refresh-${index}`, 6),
        userAgent: "Chrome Demo Session",
        ipAddress: `10.0.0.${(index % 200) + 1}`,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        status: SessionStatus.ACTIVE
      }
    });
  }

  const platformSettings: [string, Prisma.InputJsonValue][] = [
    ["theme.default", { mode: "light" }],
    ["notifications.sound", { enabled: true }],
    ["motion.default", { reduced: false }],
    ["brand.copyright", { value: appCopy.copyright }],
    ["brand.tagline", { value: appCopy.tagline }]
  ];
  for (const [key, value] of platformSettings) {
    await prisma.setting.create({
      data: {
        scope: SettingScope.PLATFORM,
        scopeId: "platform",
        key,
        value
      }
    });
  }

  for (let index = 0; index < 350; index += 1) {
    const user = pick(users, index);
    await prisma.analyticsEvent.create({
      data: {
        actorId: user.id,
        roleKey: user.role,
        brandId: pick(brands, index).id,
        subBrandId: pick(subBrands, index).id,
        productId: pick(products, index).id,
        orderId: index < orders.length ? orders[index].id : undefined,
        resourceType: index % 2 === 0 ? "post" : "order",
        resourceId: index % 2 === 0 ? pick(posts, index).id : orders[index % orders.length].id,
        eventName: pick(["profile.view", "feed.engagement", "marketplace.purchase", "scanner.lookup", "compliance.review"], index),
        metricValue: 10 + (index % 12),
        metadata: { app: appCopy.name, impact: "tracked" }
      }
    });
  }

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: complianceAdmin.id,
        entityType: "ComplianceEvent",
        entityId: warningEvent.id,
        action: "warning-issued",
        reason: "Demo flow step 1"
      },
      {
        actorId: complianceAdmin.id,
        entityType: "ComplianceEvent",
        entityId: freezeEvent.id,
        action: "account-frozen",
        reason: "Demo flow step 4"
      },
      {
        actorId: complianceAdmin.id,
        entityType: "ComplianceEvent",
        entityId: restoreEvent.id,
        action: "access-restored",
        reason: "Demo flow step 8"
      }
    ]
  });

  for (let index = 0; index < organizations.length; index += 1) {
    const organization = organizations[index];

    await prisma.legalDocument.createMany({
      data: [
        {
          organizationId: organization.id,
          title: `${organization.name} SaaS Master Services Agreement`,
          documentType: "MASTER_SERVICE_AGREEMENT",
          status: LegalDocumentStatus.APPROVED,
          jurisdiction: "United States",
          version: "v1.2",
          summary: "Enterprise SaaS agreement covering brand governance, AI systems, and passport data handling.",
          body: `${appCopy.name} legal system generated enterprise-ready terms for ${organization.name}.`,
          generatedByAgent: "legal_agent"
        },
        {
          organizationId: organization.id,
          title: `${organization.name} Data Processing Addendum`,
          documentType: "DPA",
          status: LegalDocumentStatus.REVIEW,
          jurisdiction: "EU/US",
          version: "v0.9",
          summary: "GDPR and CCPA aligned processing terms for Circular Finder platform usage.",
          body: `DPA generated for ${organization.name} with no-selling policy and AI disclosure rules.`,
          generatedByAgent: "legal_agent"
        }
      ]
    });

    await prisma.investorReport.create({
      data: {
        organizationId: organization.id,
        title: `${organization.name} Investor Readiness Report`,
        reportType: "MONTHLY_BOARD_PACKET",
        legalReadinessScore: 84 + (index % 8),
        complianceReadinessScore: 82 + (index % 10),
        revenueModel: {
          arrProjection: 1200000 + index * 275000,
          grossMargin: 0.74,
          expansionPotential: "high"
        },
        riskSummary: {
          primaryRisk: index % 2 === 0 ? "supply-chain concentration" : "contract review backlog",
          mitigations: ["multi-region manufacturers", "AI legal review loop"]
        },
        metrics: {
          passportCoverage: 80 + index * 3,
          supplierVerificationRate: 76 + index * 4,
          impactPointsIssued: 25000 + index * 3200
        },
        dataRoomExport: {
          bundleId: `room-${index + 1}`,
          generatedAt: new Date().toISOString()
        }
      }
    });

    await prisma.agentMemory.create({
      data: {
        organizationId: organization.id,
        namespace: "organization",
        key: "operating_context",
        value: {
          company: organization.name,
          tagline: appCopy.tagline,
          governanceVersion: "cfae_prod_2026"
        },
        tags: ["enterprise", "operating-system"]
      }
    });

    await prisma.agentTask.createMany({
      data: [
        {
          organizationId: organization.id,
          agentName: "legal_agent",
          domain: "legal",
          taskType: "contract_review",
          status: AgentTaskStatus.COMPLETED,
          priority: 1,
          payload: { documentType: "MASTER_SERVICE_AGREEMENT" },
          result: { approved: true, redlines: 2 },
          startedAt: new Date(Date.now() - 180000),
          completedAt: new Date(Date.now() - 120000)
        },
        {
          organizationId: organization.id,
          agentName: "supply_chain_agent",
          domain: "supply-chain",
          taskType: "supplier_risk_sync",
          status: AgentTaskStatus.COMPLETED,
          priority: 2,
          payload: { suppliers: 4 + index },
          result: { verified: true, alerts: index % 2 },
          startedAt: new Date(Date.now() - 240000),
          completedAt: new Date(Date.now() - 210000)
        }
      ]
    });

    await prisma.aiAgentLog.createMany({
      data: [
        {
          organizationId: organization.id,
          agentName: "legal_agent",
          domain: "legal",
          taskType: "contract_generation",
          status: AgentTaskStatus.COMPLETED,
          input: { organization: organization.name, contract: "msa" },
          output: { status: "ready_for_review" },
          decision: { approvedClauses: 18, escalations: 1 },
          riskScore: 21
        },
        {
          organizationId: organization.id,
          agentName: "finance_agent",
          domain: "finance",
          taskType: "investor_readiness",
          status: AgentTaskStatus.COMPLETED,
          input: { organization: organization.name, mode: "board" },
          output: { arrProjection: 1200000 + index * 275000 },
          decision: { confidence: 0.81, nextAction: "refresh pipeline assumptions" },
          riskScore: 18
        },
        {
          organizationId: organization.id,
          agentName: "product_agent",
          domain: "product",
          taskType: "passport_generation",
          status: AgentTaskStatus.COMPLETED,
          input: { passports: 40 },
          output: { generated: 40, verified: 40 },
          decision: { coverageScore: 92 },
          riskScore: 10
        }
      ]
    });
  }

  console.log(
    `Seeded ${appCopy.name} backend demo with 100 users, 5 organizations, 10 brands, 25 sub-brands, 200 products, and 500 posts.`
  );
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
