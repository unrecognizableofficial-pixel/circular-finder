import type { DemoRoleId } from "@/lib/roles";

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  path: string;
  cta: string;
};

export type DiscoveryProfile = {
  id: string;
  name: string;
  handle: string;
  roleLabel: string;
  group: "Suggested creators" | "Similar brands" | "Nearby vendors" | "Trending professionals" | "Verified sub-brands";
  location: string;
  mutualConnections: number;
  reputationScore: number;
  followers: number;
  summary: string;
  tags: string[];
  initials: string;
  tone: string;
  verified: boolean;
  nearby: boolean;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  roleLabel: string;
  impactPoints: number;
  streakDays: number;
  followersGained: number;
  sustainabilityActions: number;
  trustScore: number;
  referrals: number;
  initials: string;
  tone: string;
};

export type ImpactChallenge = {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  rewardBadge: string;
  target: number;
  progress: number;
  category: "Profile" | "Social" | "Marketplace" | "Scanner" | "Training";
};

export type RewardBadge = {
  id: string;
  title: string;
  description: string;
  rarity: string;
  unlocked: boolean;
};

export type FeedSection = "Following" | "Trending" | "Suggested" | "Marketplace Creators" | "Verified Brands";

export type FeedPost = {
  id: string;
  section: FeedSection;
  author: string;
  authorRole: string;
  initials: string;
  tone: string;
  verified: boolean;
  caption: string;
  autoCaption: string;
  cta: string;
  qrCode: string;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  visualTitle: string;
  visualSubtitle: string;
};

export type GovernancePreset = {
  id: string;
  name: string;
  subBrand: string;
  colorFamily: string;
  updatedAt: string;
  typography: string;
  approved: boolean;
};

export type FieldLock = {
  id: string;
  field: string;
  scope: "Global" | "Per-product";
  locked: boolean;
  owner: string;
  reason: string;
};

export type TrainingModule = {
  id: string;
  title: string;
  format: "Video" | "Guide" | "Quiz" | "Certification";
  category: string;
  duration: string;
  progress: number;
  required: boolean;
};

export type BatchFolder = {
  id: string;
  name: string;
  status: "Active" | "Archive" | "Recently Deleted";
  retentionDays: number;
  itemCount: number;
};

export type DemoNotification = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "warning" | "success";
  createdAt: string;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "scan",
    title: "Scan QR / Circular ID",
    description: "Open the Scanner to validate a digital passport and pull the latest product twin.",
    path: "/scanner",
    cta: "Open Scanner"
  },
  {
    id: "lock-fields",
    title: "Lock marketplace fields",
    description: "Protect pricing, claims, and SKU accuracy with centralized field governance.",
    path: "/dashboard",
    cta: "Review locks"
  },
  {
    id: "batch-upload",
    title: "Create batch upload",
    description: "Organize commerce assets into governed folders with retention countdowns.",
    path: "/marketplace",
    cta: "Open batches"
  },
  {
    id: "post-feed",
    title: "Post to feed / marketplace",
    description: "Generate an on-brand social moment with a QR code, CTA, and tracked engagement.",
    path: "/feed",
    cta: "Launch feed"
  },
  {
    id: "view-analytics",
    title: "View analytics dashboard",
    description: "Track reach, conversions, trust signals, and sustainability outcomes in one place.",
    path: "/impact",
    cta: "See impact"
  }
];

export const discoveryProfiles: DiscoveryProfile[] = [
  {
    id: "profile-alina",
    name: "Alina Mercer",
    handle: "@alinamercer",
    roleLabel: "Creator / Influencer",
    group: "Suggested creators",
    location: "Los Angeles, CA",
    mutualConnections: 18,
    reputationScore: 96,
    followers: 18240,
    summary: "Luxury circular styling creator with strong campaign conversion and sustainability storytelling.",
    tags: ["Luxury styling", "Creator commerce", "Circular IDs"],
    initials: "AM",
    tone: "from-fuchsia-500 to-rose-300",
    verified: true,
    nearby: true
  },
  {
    id: "profile-hinterland",
    name: "Hinterland Studio",
    handle: "@hinterlandstudio",
    roleLabel: "Verified sub-brand",
    group: "Verified sub-brands",
    location: "Portland, OR",
    mutualConnections: 11,
    reputationScore: 93,
    followers: 8240,
    summary: "Outerwear-focused sub-brand running governed assets and strong compliance recovery.",
    tags: ["Outerwear", "Brand governance", "Approved assets"],
    initials: "HS",
    tone: "from-emerald-500 to-cyan-300",
    verified: true,
    nearby: false
  },
  {
    id: "profile-southloop",
    name: "South Loop Supply",
    handle: "@southloopsupply",
    roleLabel: "Marketplace Vendor",
    group: "Nearby vendors",
    location: "San Francisco, CA",
    mutualConnections: 9,
    reputationScore: 89,
    followers: 4020,
    summary: "Vendor with high trust signals, fast order fulfillment, and transparent marketplace metadata.",
    tags: ["Inventory", "Trust score", "Fast shipping"],
    initials: "SL",
    tone: "from-blue-500 to-cyan-300",
    verified: true,
    nearby: true
  },
  {
    id: "profile-nora",
    name: "Nora Lin",
    handle: "@noralin",
    roleLabel: "Trending professional",
    group: "Trending professionals",
    location: "New York, NY",
    mutualConnections: 24,
    reputationScore: 91,
    followers: 12110,
    summary: "Fast-growing operator connecting brand storytelling with measurable product performance.",
    tags: ["Growth", "Marketplace strategy", "Brand systems"],
    initials: "NL",
    tone: "from-amber-400 to-orange-300",
    verified: false,
    nearby: false
  },
  {
    id: "profile-atelier",
    name: "Atelier North",
    handle: "@ateliernorth",
    roleLabel: "Similar brand",
    group: "Similar brands",
    location: "Austin, TX",
    mutualConnections: 14,
    reputationScore: 90,
    followers: 7190,
    summary: "Minimalist apparel brand with strong style-card usage and clean marketplace governance.",
    tags: ["Brand identity", "Typography", "Marketplace cards"],
    initials: "AN",
    tone: "from-slate-500 to-sand-300",
    verified: true,
    nearby: false
  }
];

export const leaderboardSeed: LeaderboardEntry[] = [
  {
    id: "lead-1",
    name: "Hinterland Studio",
    roleLabel: "Sub-Brand Manager",
    impactPoints: 4820,
    streakDays: 60,
    followersGained: 420,
    sustainabilityActions: 122,
    trustScore: 96,
    referrals: 84,
    initials: "HS",
    tone: "from-emerald-500 to-teal-300"
  },
  {
    id: "lead-2",
    name: "Alina Mercer",
    roleLabel: "Creator / Influencer",
    impactPoints: 4580,
    streakDays: 42,
    followersGained: 710,
    sustainabilityActions: 96,
    trustScore: 91,
    referrals: 102,
    initials: "AM",
    tone: "from-fuchsia-500 to-rose-300"
  },
  {
    id: "lead-3",
    name: "South Loop Supply",
    roleLabel: "Marketplace Vendor",
    impactPoints: 4310,
    streakDays: 30,
    followersGained: 180,
    sustainabilityActions: 74,
    trustScore: 94,
    referrals: 63,
    initials: "SL",
    tone: "from-blue-500 to-cyan-300"
  },
  {
    id: "lead-4",
    name: "Atelier North",
    roleLabel: "Verified sub-brand",
    impactPoints: 3980,
    streakDays: 21,
    followersGained: 205,
    sustainabilityActions: 81,
    trustScore: 92,
    referrals: 46,
    initials: "AN",
    tone: "from-slate-500 to-sand-300"
  }
];

export const impactChallengesSeed: ImpactChallenge[] = [
  {
    id: "challenge-profile",
    title: "Complete profile",
    description: "Finish setup and publish your first tailored presence.",
    rewardPoints: 120,
    rewardBadge: "Profile Polished",
    target: 1,
    progress: 1,
    category: "Profile"
  },
  {
    id: "challenge-post",
    title: "Make first post",
    description: "Share a feed story with a QR call-to-action.",
    rewardPoints: 140,
    rewardBadge: "Story Spark",
    target: 1,
    progress: 0,
    category: "Social"
  },
  {
    id: "challenge-followers",
    title: "Gain 5 followers",
    description: "Grow your network with discovery and strong engagement.",
    rewardPoints: 180,
    rewardBadge: "Momentum",
    target: 5,
    progress: 3,
    category: "Social"
  },
  {
    id: "challenge-product",
    title: "Upload first product",
    description: "Create a governed listing with a valid Circular ID.",
    rewardPoints: 160,
    rewardBadge: "Catalog Builder",
    target: 1,
    progress: 0,
    category: "Marketplace"
  },
  {
    id: "challenge-purchase",
    title: "First purchase",
    description: "Complete your first trusted marketplace order.",
    rewardPoints: 110,
    rewardBadge: "Reuse Hero",
    target: 1,
    progress: 0,
    category: "Marketplace"
  },
  {
    id: "challenge-repair",
    title: "Repair item",
    description: "Use passport guidance to complete your first repair-ready action.",
    rewardPoints: 130,
    rewardBadge: "Repair Ready",
    target: 1,
    progress: 0,
    category: "Marketplace"
  },
  {
    id: "challenge-reuse",
    title: "Reuse listing",
    description: "Relist or save an item so it stays in circulation longer.",
    rewardPoints: 100,
    rewardBadge: "Reuse Hero",
    target: 1,
    progress: 0,
    category: "Marketplace"
  },
  {
    id: "challenge-scan",
    title: "Scan Circular ID",
    description: "Run a scanner lookup and store the passport preview.",
    rewardPoints: 90,
    rewardBadge: "Digital Twin Finder",
    target: 1,
    progress: 0,
    category: "Scanner"
  },
  {
    id: "challenge-training",
    title: "Complete training module",
    description: "Review governance guidance and acknowledge policy rules.",
    rewardPoints: 150,
    rewardBadge: "Compliance Restored",
    target: 1,
    progress: 0,
    category: "Training"
  }
];

export const rewardBadgesSeed: RewardBadge[] = [
  { id: "badge-started", title: "Getting Started", description: "Complete the guided walkthrough.", rarity: "Core", unlocked: false },
  { id: "badge-recovery", title: "Compliance Restored", description: "Finish the policy recovery loop.", rarity: "Rare", unlocked: false },
  { id: "badge-story", title: "Story Spark", description: "Publish your first social story.", rarity: "Core", unlocked: false },
  { id: "badge-marketplace", title: "Catalog Builder", description: "Upload your first governed product.", rarity: "Pro", unlocked: false },
  { id: "badge-reuse", title: "Reuse Hero", description: "Keep a product in circulation through resale or reuse.", rarity: "Rare", unlocked: false },
  { id: "badge-repair", title: "Repair Ready", description: "Use passport guidance to extend a product life cycle.", rarity: "Rare", unlocked: false }
];

export const feedSections: FeedSection[] = ["Following", "Trending", "Suggested", "Marketplace Creators", "Verified Brands"];

export const feedPostsSeed: FeedPost[] = [
  {
    id: "feed-1",
    section: "Following",
    author: "Alina Mercer",
    authorRole: "Creator / Influencer",
    initials: "AM",
    tone: "from-fuchsia-500 to-rose-300",
    verified: true,
    caption: "Studio drop is now paired with every Circular ID, so shoppers can jump from story to passport in one tap.",
    autoCaption: "Auto caption: Styled with digital twin proof and a direct marketplace call-to-action.",
    cta: "View collection",
    qrCode: "QR-CREATOR-301",
    likes: 1820,
    comments: 124,
    shares: 61,
    engagementRate: 8.3,
    visualTitle: "Creator launch card",
    visualSubtitle: "QR-linked story with conversion pulse"
  },
  {
    id: "feed-2",
    section: "Trending",
    author: "Hinterland Studio",
    authorRole: "Verified sub-brand",
    initials: "HS",
    tone: "from-emerald-500 to-cyan-300",
    verified: true,
    caption: "We restored our campaign after policy training and came back with fully approved templates and cleaner metadata.",
    autoCaption: "Auto caption: Recovery complete with verified asset governance.",
    cta: "See the recovery story",
    qrCode: "QR-BRAND-119",
    likes: 1460,
    comments: 96,
    shares: 44,
    engagementRate: 7.1,
    visualTitle: "Recovery timeline",
    visualSubtitle: "Before / after governance showcase"
  },
  {
    id: "feed-3",
    section: "Suggested",
    author: "Nora Lin",
    authorRole: "Growth strategist",
    initials: "NL",
    tone: "from-amber-400 to-orange-300",
    verified: false,
    caption: "Pairing seller trust score with feed proof is lifting conversions for vendors faster than discounting alone.",
    autoCaption: "Auto caption: Marketplace trust is now a growth lever.",
    cta: "Open insights",
    qrCode: "QR-GROWTH-204",
    likes: 980,
    comments: 72,
    shares: 28,
    engagementRate: 6.2,
    visualTitle: "Insight snapshot",
    visualSubtitle: "Conversion and trust signals"
  },
  {
    id: "feed-4",
    section: "Marketplace Creators",
    author: "South Loop Supply",
    authorRole: "Marketplace Vendor",
    initials: "SL",
    tone: "from-blue-500 to-cyan-300",
    verified: true,
    caption: "Fresh upload with locked sustainability fields, verified packaging claims, and a clean creator-ready resale story.",
    autoCaption: "Auto caption: Inventory story with marketplace confidence signals.",
    cta: "Shop the drop",
    qrCode: "QR-VENDOR-808",
    likes: 1260,
    comments: 58,
    shares: 33,
    engagementRate: 5.9,
    visualTitle: "Marketplace drop",
    visualSubtitle: "Governed listing with trust tags"
  },
  {
    id: "feed-5",
    section: "Verified Brands",
    author: "Atelier North",
    authorRole: "Verified brand",
    initials: "AN",
    tone: "from-slate-500 to-sand-300",
    verified: true,
    caption: "Our new style card preview keeps light mode, dark mode, typography, and button language aligned across every team.",
    autoCaption: "Auto caption: Brand system approved and synced.",
    cta: "Preview style card",
    qrCode: "QR-BRAND-702",
    likes: 1110,
    comments: 68,
    shares: 39,
    engagementRate: 6.7,
    visualTitle: "Style card preview",
    visualSubtitle: "Dark mode, light mode, and component parity"
  }
];

export const governancePresetsSeed: GovernancePreset[] = [
  { id: "preset-1", name: "Core Brand Standard", subBrand: "Global", colorFamily: "Forest / Sand", updatedAt: "Apr 18", typography: "Editorial Sans", approved: true },
  { id: "preset-2", name: "Studio House 01", subBrand: "Studio House 01", colorFamily: "Emerald / Pearl", updatedAt: "Apr 19", typography: "Modern Grotesk", approved: true },
  { id: "preset-3", name: "Creator Market Pulse", subBrand: "Creator Commerce", colorFamily: "Rose / Quartz", updatedAt: "Apr 20", typography: "Signal Sans", approved: false }
];

export const fieldLocksSeed: FieldLock[] = [
  { id: "lock-price", field: "Pricing", scope: "Global", locked: true, owner: "Master Brand", reason: "Maintain pricing integrity." },
  { id: "lock-sku", field: "SKU", scope: "Global", locked: true, owner: "Master Brand", reason: "Prevent duplicate catalog records." },
  { id: "lock-claims", field: "Sustainability claims", scope: "Per-product", locked: true, owner: "Compliance Admin", reason: "Requires verification source." },
  { id: "lock-branding", field: "Branding fields", scope: "Global", locked: false, owner: "Master Brand", reason: "Temporarily editable for launch prep." }
];

export const trainingModulesSeed: TrainingModule[] = [
  { id: "training-logo", title: "Correct logo usage", format: "Video", category: "Brand Guidelines", duration: "00:18", progress: 100, required: true },
  { id: "training-marketplace", title: "Marketplace compliance", format: "Video", category: "Marketplace", duration: "00:18", progress: 40, required: true },
  { id: "training-social", title: "Approved social posting standards", format: "Video", category: "Social", duration: "00:18", progress: 0, required: true },
  { id: "training-certification", title: "Policy certification", format: "Certification", category: "Governance", duration: "3 min", progress: 0, required: true }
];

export const batchFoldersSeed: BatchFolder[] = [
  { id: "batch-active", name: "Q2 Marketplace Launch", status: "Active", retentionDays: 60, itemCount: 28 },
  { id: "batch-archive", name: "Archive / Winter Capsule", status: "Archive", retentionDays: 32, itemCount: 16 },
  { id: "batch-deleted", name: "Recently Deleted / Draft Templates", status: "Recently Deleted", retentionDays: 18, itemCount: 9 }
];

export const notificationsSeed: DemoNotification[] = [
  {
    id: "notice-1",
    title: "Your Circular Finder streak is ready today",
    body: "Keep your logo glowing — complete one action in Scanner, Social Feed, Marketplace, or Tailored Profiles.",
    tone: "info",
    createdAt: "Now"
  },
  {
    id: "notice-2",
    title: "7-day streak unlocked",
    body: "Your logo evolved into a warm aura ring after a full week of circular actions.",
    tone: "success",
    createdAt: "4m"
  },
  {
    id: "notice-3",
    title: "New suggested follows",
    body: "Three verified creators were matched to your role, location, and trust profile.",
    tone: "success",
    createdAt: "12m"
  }
];

export const roleMetricBaseline: Record<DemoRoleId, { views: number; followers: number; conversions: number; sustainability: number; reach: number }> = {
  "master-admin": { views: 18200, followers: 240, conversions: 84, sustainability: 96, reach: 92 },
  "compliance-admin": { views: 12600, followers: 72, conversions: 38, sustainability: 98, reach: 80 },
  "sub-brand-manager": { views: 22140, followers: 314, conversions: 132, sustainability: 91, reach: 87 },
  creator: { views: 29400, followers: 880, conversions: 162, sustainability: 84, reach: 94 },
  vendor: { views: 16400, followers: 138, conversions: 154, sustainability: 86, reach: 79 },
  user: { views: 9400, followers: 58, conversions: 44, sustainability: 88, reach: 68 }
};
