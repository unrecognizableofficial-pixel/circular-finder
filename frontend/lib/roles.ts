export type DemoRoleId =
  | "master-admin"
  | "compliance-admin"
  | "sub-brand-manager"
  | "creator"
  | "vendor"
  | "user";

export type DemoCapability =
  | "governance.manage"
  | "governance.reset"
  | "presets.manage"
  | "compliance.review"
  | "compliance.freeze"
  | "compliance.suspend"
  | "training.assign"
  | "marketplace.manage"
  | "marketplace.sell"
  | "marketplace.browse"
  | "social.publish"
  | "social.moderate"
  | "social.grow"
  | "analytics.full"
  | "analytics.role"
  | "profiles.manage"
  | "scanner.use"
  | "scanner.ip"
  | "supplier.view"
  | "style.use"
  | "orders.manage"
  | "inventory.manage"
  | "settings.access";

export type DemoRole = {
  id: DemoRoleId;
  label: string;
  icon: string;
  accent: string;
  summary: string;
  accessLevel: string;
  dashboardPreview: string;
  permissionsPreview: string[];
  availableTools: string[];
  dashboardWidgets: string[];
  capabilities: DemoCapability[];
};

export const roles: DemoRole[] = [
  {
    id: "master-admin",
    label: "Master Brand Admin",
    icon: "Crown",
    accent: "from-amber-400 via-yellow-300 to-orange-300",
    summary: "Own the full operating system for brand governance, growth, compliance, and marketplace control.",
    accessLevel: "Global Authority",
    dashboardPreview: "Governance command center with policy, analytics, presets, and recovery controls.",
    permissionsPreview: ["Brand identity authority", "Marketplace lock fields", "Master reset", "Executive analytics"],
    availableTools: ["Compliance dashboard", "Preset library", "Policy center", "Audit trail", "Marketplace controls"],
    dashboardWidgets: ["Compliance health", "Sub-brand risk board", "Style card approvals", "Scanner preview"],
    capabilities: [
      "governance.manage",
      "governance.reset",
      "presets.manage",
      "compliance.review",
      "compliance.freeze",
      "compliance.suspend",
      "training.assign",
      "marketplace.manage",
      "marketplace.sell",
      "marketplace.browse",
      "social.publish",
      "social.moderate",
      "social.grow",
      "analytics.full",
      "analytics.role",
      "profiles.manage",
      "scanner.use",
      "scanner.ip",
      "supplier.view",
      "style.use",
      "orders.manage",
      "inventory.manage",
      "settings.access"
    ]
  },
  {
    id: "compliance-admin",
    label: "Compliance Admin / Moderator",
    icon: "Shield",
    accent: "from-rose-500 via-orange-400 to-amber-300",
    summary: "Monitor violations, enforce policy, assign training, and guide accounts back into compliance.",
    accessLevel: "Protected",
    dashboardPreview: "Violation board, risk scoring, training progress, and enforcement queue.",
    permissionsPreview: ["Policy enforcement", "Risk recommendations", "Training unlocks", "Audit logging"],
    availableTools: ["Risk board", "Moderation queue", "Training hub", "Violation timeline"],
    dashboardWidgets: ["Live risk alerts", "Freeze controls", "Recovery queue", "Audit trail"],
    capabilities: [
      "compliance.review",
      "compliance.freeze",
      "compliance.suspend",
      "training.assign",
      "marketplace.browse",
      "social.moderate",
      "analytics.role",
      "scanner.use",
      "scanner.ip",
      "supplier.view",
      "style.use",
      "settings.access"
    ]
  },
  {
    id: "sub-brand-manager",
    label: "Sub-Brand Manager",
    icon: "Layers3",
    accent: "from-emerald-500 via-teal-400 to-cyan-300",
    summary: "Operate a verified sub-brand with approved assets, product listings, campaigns, and growth metrics.",
    accessLevel: "Managed",
    dashboardPreview: "Brand assets, publishing tools, listing performance, and team progress.",
    permissionsPreview: ["Approved asset usage", "Marketplace listings", "Social publishing", "My Impact metrics"],
    availableTools: ["Style card previews", "Campaign composer", "Marketplace listings", "Batch uploads"],
    dashboardWidgets: ["Brand conformity", "Listing health", "Impact growth", "Tailored profiles"],
    capabilities: [
      "presets.manage",
      "marketplace.manage",
      "marketplace.sell",
      "marketplace.browse",
      "social.publish",
      "social.grow",
      "analytics.role",
      "profiles.manage",
      "scanner.use",
      "scanner.ip",
      "supplier.view",
      "style.use",
      "orders.manage",
      "inventory.manage",
      "settings.access"
    ]
  },
  {
    id: "creator",
    label: "Creator / Influencer",
    icon: "Sparkles",
    accent: "from-fuchsia-500 via-pink-400 to-rose-300",
    summary: "Grow audience reach, post branded stories, climb leaderboards, and drive creator commerce.",
    accessLevel: "Growth",
    dashboardPreview: "Creator analytics, challenge streaks, and feed discovery tools.",
    permissionsPreview: ["Social growth tools", "Auto caption templates", "Leaderboard access", "Creator commerce"],
    availableTools: ["Feed studio", "Challenge ladder", "Growth analytics", "QR share templates"],
    dashboardWidgets: ["Follower growth", "Post momentum", "Reward streaks", "Suggested collaborations"],
    capabilities: [
      "marketplace.browse",
      "social.publish",
      "social.grow",
      "analytics.role",
      "profiles.manage",
      "scanner.use",
      "style.use",
      "supplier.view",
      "settings.access"
    ]
  },
  {
    id: "vendor",
    label: "Marketplace Vendor",
    icon: "Store",
    accent: "from-blue-500 via-sky-400 to-cyan-300",
    summary: "Manage inventory, orders, pricing integrity, and trust signals across the marketplace.",
    accessLevel: "Commercial",
    dashboardPreview: "Inventory, orders, reputation, and product performance in one place.",
    permissionsPreview: ["Inventory tools", "Order operations", "Product analytics", "Trust score monitoring"],
    availableTools: ["Inventory board", "Order queue", "Pricing controls", "Reputation insights"],
    dashboardWidgets: ["Order volume", "Trust score", "Listing conversion", "Field lock visibility"],
    capabilities: [
      "marketplace.manage",
      "marketplace.sell",
      "marketplace.browse",
      "analytics.role",
      "profiles.manage",
      "scanner.use",
      "scanner.ip",
      "style.use",
      "orders.manage",
      "inventory.manage",
      "settings.access"
    ]
  },
  {
    id: "user",
    label: "Standard User",
    icon: "UserRound",
    accent: "from-slate-500 via-sage-400 to-sand-300",
    summary: "Discover people and products, track personal impact, and join social and sustainability challenges.",
    accessLevel: "Member",
    dashboardPreview: "Personalized discovery, challenge tracking, and community feed.",
    permissionsPreview: ["Tailored profiles", "Impact dashboard", "Social feed", "Scanner access"],
    availableTools: ["Discovery feed", "Challenges", "Impact leaderboard", "Passport scan"],
    dashboardWidgets: ["Impact pulse", "Suggested follows", "Challenge board", "Recent scan"],
    capabilities: ["marketplace.browse", "social.publish", "social.grow", "analytics.role", "profiles.manage", "scanner.use", "style.use", "supplier.view", "settings.access"]
  }
];

export function getRoleById(roleId: string | null | undefined) {
  return roles.find((role) => role.id === roleId) ?? null;
}

export function roleHasCapability(role: DemoRole | null | undefined, capability: DemoCapability) {
  return role?.capabilities.includes(capability) ?? false;
}
