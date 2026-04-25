"use client";

import * as React from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  Barcode,
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  Layers3,
  LayoutDashboard,
  Maximize2,
  MessageSquare,
  Minimize2,
  Pause,
  Play,
  QrCode,
  Search,
  Settings2,
  ShieldCheck,
  Shirt,
  Sparkles,
  Store,
  Trophy,
  UserRound,
  UserCircle2,
  Volume2,
  VolumeX
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { usePlatform } from "@/components/platform-state";
import { StreakLogo } from "@/components/streak-logo";
import { formatCurrency, formatDate } from "@/lib/format";
import { roles } from "@/lib/roles";

type DemoPreviewPlayerProps = {
  autoPlayOnMount?: boolean;
  onOpenRoles: () => void;
};

type DemoPreviewMetric = {
  label: string;
  value: string;
};

type DemoInfoTabId = "overview" | "features" | "rewards" | "passport" | "analytics" | "settings" | "more-info";

type DemoPreviewBeat = {
  body: string;
  cue: string;
  headline: string;
  label: string;
  uiFocus: string;
};

type PreviewSceneId = "dashboard" | "scan" | "passport" | "wardrobe" | "marketplace" | "rewards" | "roles";
type PreviewPlaybackMode = "full" | "chapter";
type NarrationStatus = "idle" | "playing" | "ready" | "error";

type PreviewCameraState = {
  origin: string;
  scale: number;
  x: string;
  y: string;
};

type PreviewCursorState = {
  action: "click" | "drag" | "hover";
  label: string;
  x: string;
  y: string;
};

type DemoPreviewChapter = {
  accent: string;
  beats: DemoPreviewBeat[];
  ctaLabel: string;
  description: string;
  eyebrow: string;
  editCaption: string;
  editSurface: "dark" | "light";
  featureList: string[];
  icon: keyof typeof chapterIconMap;
  id: PreviewSceneId;
  metrics: DemoPreviewMetric[];
  narrationLine: string;
  shortLabel: string;
  title: string;
};

type DemoFeatureDockItem = {
  chapterId: PreviewSceneId;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  infoTabId: DemoInfoTabId;
  label: string;
};

type DemoInfoTab = {
  description: string;
  details: string[];
  icon: React.ComponentType<{ className?: string }>;
  id: DemoInfoTabId;
  linkedChapterId: PreviewSceneId;
  metrics: DemoPreviewMetric[];
  title: string;
};

type PreviewData = {
  authenticity: string;
  badgeTitles: string[];
  barcode: string;
  brandName: string;
  careInstructions: string;
  certifications: string[];
  challengeCards: Array<{
    badge: string;
    category: string;
    progress: number;
    rewardPoints: number;
    title: string;
  }>;
  circularityScore: number;
  complianceReadiness: number;
  condition: string;
  enterpriseReadiness: number;
  expectedDaysToSell: number;
  factoryLocation: string;
  imageUrl: string;
  impactPoints: number;
  inventoryCount: number;
  lastWorn: string;
  listingPrice: number;
  materials: string[];
  outfitPotential: number;
  passportId: string;
  productName: string;
  qrCode: string;
  recyclingInstructions: string;
  repairCount: number;
  repairInstructions: string;
  resaleValueEstimate: number;
  searchHint: string;
  secondaryListingPrice: number;
  secondaryProductName: string;
  sellerName: string;
  streakDays: number;
  streakPointsToNextLevel: number;
  supplierRiskAverage: number;
  takeBackProgram: string;
  trustCenterScore: number;
  unlockedRewardCount: number;
  walletValue: number;
  wardrobeLabel: string;
  wearCount: number;
  passportCoveragePercent: number;
  countryOfOrigin: string;
};

const chapterIconMap = {
  BadgeCheck,
  Layers3,
  QrCode,
  Sparkles,
  Shirt,
  Store,
  Trophy
};

const roleIconMap = {
  Layers3,
  Sparkles,
  Store,
  UserRound
};

const NARRATOR_VOICE_PATTERNS = [
  /Microsoft Aria/i,
  /Microsoft Jenny/i,
  /Microsoft Sonia/i,
  /Microsoft Libby/i,
  /Ava/i,
  /Allison/i,
  /Samantha/i,
  /Victoria/i,
  /Serena/i,
  /Susan/i,
  /Karen/i,
  /Moira/i,
  /Google UK English Female/i,
  /Google US English/i
] as const;

const MIN_CHAPTER_DURATION_MS = 12800;
const CHAPTER_BUFFER_MS = 3200;
const ON_SCREEN_READING_WORDS_PER_SECOND = 2.35;
const NARRATION_WORDS_PER_SECOND = 1.65;
const FEATURED_ROLE_IDS = new Set(["sub-brand-manager", "creator", "vendor", "user"]);
const DEMO_AUDIO_VERSION = "2026-04-24-f";

export default function DemoPreviewPlayer({ autoPlayOnMount = false, onOpenRoles }: DemoPreviewPlayerProps) {
  const { bootstrap, challenges, impactPoints, rewards, streak } = usePlatform();

  const featuredListing = bootstrap?.marketplace?.[0] ?? null;
  const secondaryListing = bootstrap?.marketplace?.[1] ?? featuredListing;
  const wardrobeItem = bootstrap?.user?.wardrobe?.[0] ?? null;
  const wardrobeInsights = bootstrap?.user?.insights ?? null;
  const featuredRoles = React.useMemo(() => roles.filter((role) => FEATURED_ROLE_IDS.has(role.id)), []);

  const previewData = React.useMemo<PreviewData>(() => {
    const passport = featuredListing?.passport ?? featuredListing?.product.passport ?? null;
    const product = featuredListing?.product ?? passport?.product ?? null;
    const secondaryProduct = secondaryListing?.product ?? secondaryListing?.passport.product ?? null;
    const relevantChallenges = ["challenge-scan", "challenge-repair", "challenge-purchase"]
      .map((challengeId) => challenges.find((entry) => entry.id === challengeId))
      .filter(Boolean)
      .map((challenge) => ({
        badge: challenge?.rewardBadge ?? "Digital Twin Finder",
        category: challenge?.category ?? "Scanner",
        progress: Math.round((((challenge?.progress ?? 0) / Math.max(challenge?.target ?? 1, 1)) || 0) * 100),
        rewardPoints: challenge?.rewardPoints ?? 120,
        title: challenge?.title ?? "Complete circular action"
      }));
    const unlockedRewards = rewards.filter((reward) => reward.unlocked);

    return {
      authenticity: passport?.passportStatus?.replaceAll("_", " ") ?? "Verified authentic",
      badgeTitles: (unlockedRewards.length ? unlockedRewards : rewards)
        .slice(0, 3)
        .map((reward) => reward.title),
      barcode: passport?.barcode ?? "BAR-EL-TRN-001",
      brandName: passport?.brand?.name ?? product?.brand.name ?? "Eterna Loom",
      careInstructions:
        passport?.careInstructions ??
        "Spot clean between wears, steam low, and wash only when needed to protect structure and finish.",
      certifications: passport?.sustainabilityCertifications?.length
        ? passport.sustainabilityCertifications
        : ["GOTS", "Fair Trade", "ZDHC"],
      challengeCards: relevantChallenges.length
        ? relevantChallenges
        : [
            { badge: "Digital Twin Finder", category: "Scanner", progress: 100, rewardPoints: 90, title: "Scan Circular ID" },
            { badge: "Repair Ready", category: "Marketplace", progress: 72, rewardPoints: 130, title: "Repair item" },
            { badge: "Reuse Hero", category: "Marketplace", progress: 48, rewardPoints: 110, title: "First purchase" }
          ],
      circularityScore: passport?.circularityScore ?? 95,
      complianceReadiness: 92,
      condition: featuredListing?.condition ?? wardrobeItem?.condition ?? "excellent",
      countryOfOrigin: passport?.countryOfOrigin ?? "Vietnam",
      enterpriseReadiness: 91,
      expectedDaysToSell: featuredListing?.expectedDaysToSell ?? 5,
      factoryLocation: passport?.factoryLocation ?? "Da Nang, Vietnam",
      imageUrl: featuredListing?.imageUrl ?? product?.imageUrl ?? "/images/trench.svg",
      impactPoints,
      inventoryCount: wardrobeInsights?.inventoryCount ?? 3,
      lastWorn: formatDate(wardrobeItem?.lastWornAt ?? "2026-04-18T00:00:00Z"),
      listingPrice: featuredListing?.price ?? 280,
      materials: passport?.materialComposition?.length
        ? passport.materialComposition
        : ["Organic Cotton 78%", "TENCEL Lyocell 22%"],
      outfitPotential: wardrobeInsights?.outfitPotential ?? 16,
      passportId: passport?.passportId ?? "DPP-EL-TRN-001",
      productName: product?.name ?? "Sage Meridian Trench",
      qrCode: passport?.qrCode ?? "QR-EL-TRN-001",
      recyclingInstructions:
        passport?.recyclingInstructions ??
        "Detach trims, route the shell to fiber recovery, and use a verified take-back partner when the garment reaches end of life.",
      repairCount: wardrobeItem?.repairCount ?? 1,
      repairInstructions:
        passport?.repairInstructions ??
        "Reinforce high-stress seams, replace trims through the repair hub, and log every service event into the passport.",
      resaleValueEstimate: passport?.resaleValueEstimate ?? 210,
      searchHint: `${passport?.brand?.name ?? product?.brand.name ?? "Eterna Loom"} ${product?.name ?? "trench coat"}`,
      secondaryListingPrice: secondaryListing?.price ?? 120,
      secondaryProductName: secondaryProduct?.name ?? "Ivory Precision Shirt",
      sellerName: featuredListing?.seller.name ?? "Studio House 01",
      streakDays: streak.days,
      streakPointsToNextLevel: streak.impactPointsToNextLevel,
      supplierRiskAverage: 18,
      takeBackProgram:
        passport?.takeBackProgram ??
        "Return through the brand take-back network for repair credit, authenticated resale, or material recovery.",
      trustCenterScore: 94,
      unlockedRewardCount: unlockedRewards.length,
      walletValue: wardrobeInsights?.resaleValue ?? passport?.resaleValueEstimate ?? 210,
      wardrobeLabel: wardrobeItem?.nickname ?? "Work trench",
      wearCount: wardrobeItem?.wearCount ?? 34,
      passportCoveragePercent: 96
    };
  }, [challenges, featuredListing, impactPoints, rewards, secondaryListing, streak.days, streak.impactPointsToNextLevel, wardrobeInsights, wardrobeItem]);

  const previewChapters = React.useMemo<DemoPreviewChapter[]>(
    () => [
      {
        accent: "from-sky-400 via-cyan-300 to-blue-200",
        beats: [
          {
            body: "The landing story starts with one clear command center instead of a noisy dashboard. The product feels organized the moment it appears.",
            cue: "command center",
            headline: "Everything in one place",
            label: "Beat 1",
            uiFocus: "Assembling the core dashboard modules into one clean SaaS control center."
          },
          {
            body: "Analytics, passport coverage, trust-center health, and live product detail panels move into focus so the viewer understands the platform in seconds.",
            cue: "search and analytics",
            headline: "Track performance instantly",
            label: "Beat 2",
            uiFocus: "Panning the camera across enterprise analytics, trust metrics, search, and passport-backed product detail cards."
          },
          {
            body: "Messages, workflow automation, notifications, settings, and the mobile view reveal how the platform stays connected across the full operating stack.",
            cue: "operations workflow",
            headline: "Stay connected anywhere",
            label: "Beat 3",
            uiFocus: "Switching focus to inbox, workflow automations, notifications, settings, and the mobile companion preview."
          },
          {
            body: "The full workspace then opens up so the whole product feels visible, premium, and investor-ready in one complete view.",
            cue: "full platform overview",
            headline: "See the full product experience together",
            label: "Beat 4",
            uiFocus: "Showing the full interface at once with dashboard, CRM panels, messages, automation, and mobile preview together."
          }
        ],
        ctaLabel: "Choose role",
        description:
          "Start with a premium command center that brings dashboard cards, analytics, notifications, messages, automation, settings, and mobile preview into one cinematic product view.",
        eyebrow: "Landing teaser",
        editCaption: "everything in one place",
        editSurface: "dark",
        featureList: [
          "Command center dashboard with premium cards, KPIs, and enterprise readiness",
          "Search, alerts, inbox, notifications, and trust-center signals in one workspace",
          "Workflow automations, CRM tables, supplier visibility, and product detail panels",
          "Mobile responsive companion preview alongside desktop"
        ],
        icon: "Sparkles",
        id: "dashboard",
        metrics: [
          { label: "Passport coverage", value: `${previewData.passportCoveragePercent}%` },
          { label: "Compliance readiness", value: `${previewData.complianceReadiness}/100` },
          { label: "Unread signals", value: "19 updates" }
        ],
        narrationLine:
          "Everything in one place. Circular Finder opens with one premium command center, where dashboard cards, passport coverage, trust center health, notifications, and live product detail assemble into view. Track performance instantly. Analytics, search, supplier signals, and enterprise readiness move into focus together. Stay connected anywhere. Messages, workflow automations, settings, and mobile preview stay in sync across the same system. See the full product experience together. The camera pulls back so the whole workspace remains visible in one polished platform view.",
        shortLabel: "Overview",
        title: "Open with a premium circular fashion command center"
      },
      {
        accent: "from-emerald-400 via-teal-300 to-cyan-300",
        beats: [
          {
            body: "A QR code, NFC tap, barcode, or search all open the same verified circular layer.",
            cue: "entry point",
            headline: "Scan any clothing item",
            label: "Beat 1",
            uiFocus: "Showing the four scan paths as one simple starting point."
          },
          {
            body: "The app locks onto the garment fast, confirms the match, and prepares the Digital Product Passport.",
            cue: "match confidence",
            headline: "Find the exact product in one motion",
            label: "Beat 2",
            uiFocus: "Moving the scan frame and elevating the live match result."
          },
          {
            body: "The result hands off straight into the passport so the user never has to hunt for trust, care, or circular data.",
            cue: "passport handoff",
            headline: "Open the DPP instantly",
            label: "Beat 3",
            uiFocus: "Promoting the passport-ready state and product reveal."
          },
          {
            body: "The full scan layer then comes together, showing every entry path, the live match, and the handoff into the passport in one polished system view.",
            cue: "full scan flow",
            headline: "See the whole scan experience together",
            label: "Beat 4",
            uiFocus: "Bringing every scan method and the final product handoff back on screen together."
          }
        ],
        ctaLabel: "Choose role",
        description:
          "Scan by QR code, NFC, barcode, or search to open a verified Digital Product Passport in one clean motion.",
        eyebrow: "Smart scan layer",
        editCaption: "scan any item",
        editSurface: "dark",
        featureList: [
          "QR, NFC, barcode, and search in one entry point",
          "Fast match confidence with premium product visuals",
          "Brand-safe handoff into the passport view",
          "Turns any garment into a smart digital asset"
        ],
        icon: "QrCode",
        id: "scan",
        metrics: [
          { label: "Scan paths", value: "4 live methods" },
          { label: "Featured code", value: previewData.qrCode },
          { label: "Matched item", value: previewData.productName }
        ],
        narrationLine:
          "Every garment can be opened like a smart asset. Scan a QR code, tap NFC, read a barcode, or search and the passport appears instantly.",
        shortLabel: "Scan",
        title: "Open the Digital Product Passport from any scan path"
      },
      {
        accent: "from-cyan-400 via-sky-300 to-blue-300",
        beats: [
          {
            body: "The first view confirms the brand, the product, the origin, and the authenticity status in one premium screen.",
            cue: "identity layer",
            headline: "See the verified product story first",
            label: "Beat 1",
            uiFocus: "Centering the item, brand, origin, and authenticity summary."
          },
          {
            body: "Materials, certifications, care, and repair guidance are clear enough for shoppers and structured enough for teams.",
            cue: "care and repair",
            headline: "Make circular care easy to understand",
            label: "Beat 2",
            uiFocus: "Switching the focus to materials, certifications, care, and repair cards."
          },
          {
            body: "Resale value, recycling, and take-back options keep the item moving through its next useful life.",
            cue: "recovery options",
            headline: "Keep value attached after purchase",
            label: "Beat 3",
            uiFocus: "Highlighting resale, recycling, and take-back actions."
          },
          {
            body: "The full Digital Product Passport then opens up so identity, care, trust, and recovery all live in one premium circular view.",
            cue: "full passport view",
            headline: "See the full passport in one screen",
            label: "Beat 4",
            uiFocus: "Showing the complete DPP with identity, care, repair, resale, and recovery together."
          }
        ],
        ctaLabel: "Choose role",
        description: `${previewData.productName} reveals brand, materials, origin, certifications, care, repair, resale, authenticity, and take-back in one investor-ready screen.`,
        eyebrow: "Passport detail",
        editCaption: "everything in one passport",
        editSurface: "light",
        featureList: [
          "Verified brand, factory, and country of origin",
          "Materials and certification evidence in plain language",
          "Care, repair, and take-back guidance in the same view",
          "Circularity score, authenticity, and resale value together"
        ],
        icon: "BadgeCheck",
        id: "passport",
        metrics: [
          { label: "Circularity", value: `${previewData.circularityScore}/100` },
          { label: "Authenticity", value: previewData.authenticity },
          { label: "Resale", value: formatCurrency(previewData.resaleValueEstimate) }
        ],
        narrationLine:
          "The passport makes fashion transparent. One view explains what the item is, where it came from, how to care for it, and how to keep it circulating longer.",
        shortLabel: "Passport",
        title: "Bring the full product story into one premium DPP"
      },
      {
        accent: "from-amber-300 via-yellow-200 to-lime-200",
        beats: [
          {
            body: "Once saved, the item becomes a living wardrobe record instead of a one-time scan result.",
            cue: "save to wardrobe",
            headline: "Turn the scan into a living record",
            label: "Beat 1",
            uiFocus: "Bringing the saved garment and passport record into view."
          },
          {
            body: "Wear count, last worn, repair history, and care reminders keep ownership practical and useful.",
            cue: "ownership data",
            headline: "Track the life of the item over time",
            label: "Beat 2",
            uiFocus: "Emphasizing wear history, repair status, and care signals."
          },
          {
            body: "The app then suggests the next circular move, whether that is repair, resale, reuse, or take-back.",
            cue: "next best action",
            headline: "Guide the next circular decision",
            label: "Beat 3",
            uiFocus: "Switching the focus to value, recovery, and next-action cards."
          },
          {
            body: "The whole wardrobe picture then appears together so the record, wear history, repair state, and next action all read as one circular ownership dashboard.",
            cue: "full wardrobe view",
            headline: "See the whole wardrobe story together",
            label: "Beat 4",
            uiFocus: "Opening the full wardrobe record with history, value, and recovery options in one view."
          }
        ],
        ctaLabel: "Choose role",
        description:
          "Saved items become wardrobe records with wear history, repair status, value, and next-best circular actions.",
        eyebrow: "Wardrobe tracking",
        editCaption: "keep it in rotation",
        editSurface: "dark",
        featureList: [
          "Save scanned garments into a living wardrobe",
          "Track wears, repairs, resale value, and readiness",
          "Use passport guidance to extend product life",
          "Turn ownership data into smarter next steps"
        ],
        icon: "Shirt",
        id: "wardrobe",
        metrics: [
          { label: "Saved items", value: String(previewData.inventoryCount) },
          { label: "Wear count", value: `${previewData.wearCount} wears` },
          { label: "Wardrobe value", value: formatCurrency(previewData.walletValue) }
        ],
        narrationLine:
          "The passport does not stop at the scan. It becomes a living wardrobe record with service history, wear signals, resale value, and recovery options.",
        shortLabel: "Wardrobe",
        title: "Track the item after purchase, not just before"
      },
      {
        accent: "from-blue-400 via-cyan-300 to-emerald-300",
        beats: [
          {
            body: "Each listing inherits the passport so trust is built into the shopping experience from the first glance.",
            cue: "passport-backed listing",
            headline: "Bring proof into every resale listing",
            label: "Beat 1",
            uiFocus: "Showing the featured listing as a trusted, passport-backed asset."
          },
          {
            body: "Condition, resale value, and sell-through guidance help sellers price with confidence and buyers shop with clarity.",
            cue: "pricing confidence",
            headline: "Make resale feel premium and informed",
            label: "Beat 2",
            uiFocus: "Switching attention to pricing, condition, and sell-through signals."
          },
          {
            body: "The same trusted data also protects brand claims and keeps circular commerce cleaner at scale.",
            cue: "brand-safe commerce",
            headline: "Keep circular commerce trustworthy at scale",
            label: "Beat 3",
            uiFocus: "Highlighting trust, authenticity, and governance-ready commerce."
          },
          {
            body: "The full marketplace then comes into focus with trusted listings, pricing, provenance, and brand-safe resale signals all visible together.",
            cue: "full marketplace view",
            headline: "See the whole resale system together",
            label: "Beat 4",
            uiFocus: "Showing the full marketplace story with listings, pricing, trust, and buyer confidence together."
          }
        ],
        ctaLabel: "Choose role",
        description:
          "Marketplace listings stay trusted because every item carries provenance, condition, pricing signals, and circular claims from the passport.",
        eyebrow: "Circular marketplace",
        editCaption: "resale with proof",
        editSurface: "light",
        featureList: [
          "Verified resale listings with built-in trust signals",
          "Condition, pricing, and sell-through framed by the passport",
          "Cleaner buyer confidence with authenticity and origin visible",
          "Makes circular commerce feel premium, not secondary"
        ],
        icon: "Store",
        id: "marketplace",
        metrics: [
          { label: "Live ask", value: formatCurrency(previewData.listingPrice) },
          { label: "Sell-through", value: `${previewData.expectedDaysToSell} days` },
          { label: "Seller", value: previewData.sellerName }
        ],
        narrationLine:
          "The marketplace is stronger when every listing is passport-backed. Provenance, repairability, pricing, and trust stay visible from discovery through checkout.",
        shortLabel: "Marketplace",
        title: "Move items into resale and reuse with proof attached"
      },
      {
        accent: "from-fuchsia-400 via-pink-300 to-rose-300",
        beats: [
          {
            body: "Impact Points reward verified circular actions so progress feels visible right away.",
            cue: "points engine",
            headline: "Reward the good move instantly",
            label: "Beat 1",
            uiFocus: "Bringing points, badges, and streak progress to the front."
          },
          {
            body: "Daily streaks and challenges make scanning, repair, reuse, and resale feel habit-forming instead of one-off.",
            cue: "habit loop",
            headline: "Build a circular habit people return to",
            label: "Beat 2",
            uiFocus: "Animating the streak and challenge progress system."
          },
          {
            body: "Badges and milestones make sustainable behavior shareable, social, and retention-friendly.",
            cue: "social proof",
            headline: "Turn sustainability into momentum",
            label: "Beat 3",
            uiFocus: "Switching the view to badges, milestones, and social rewards."
          },
          {
            body: "The full rewards loop then shows up together so points, streaks, badges, and challenges feel like one motivating system.",
            cue: "full rewards view",
            headline: "See the full rewards system together",
            label: "Beat 4",
            uiFocus: "Bringing points, streaks, badges, and challenges together in one complete retention view."
          }
        ],
        ctaLabel: "Choose role",
        description:
          "Impact Points™, streaks, badges, and challenges turn sustainable behavior into a reason to come back every day.",
        eyebrow: "Rewards layer",
        editCaption: "reward the good move",
        editSurface: "dark",
        featureList: [
          "Impact Points™ reward scanning, repair, reuse, and verified commerce",
          "Streaks create habit around healthy circular actions",
          "Badges and challenges make sustainability visible and social",
          "Rewards connect transparency with retention"
        ],
        icon: "Trophy",
        id: "rewards",
        metrics: [
          { label: "Impact Points™", value: previewData.impactPoints.toLocaleString() },
          { label: "Logo streak", value: `${previewData.streakDays} days` },
          { label: "Unlocked badges", value: String(previewData.unlockedRewardCount) }
        ],
        narrationLine:
          "Circular actions become rewarding. The app turns scans, repairs, and resale moments into points, streaks, badges, and challenges people want to keep climbing.",
        shortLabel: "Rewards",
        title: "Reward every circular action with momentum people can feel"
      },
      {
        accent: "from-slate-400 via-stone-300 to-sand-200",
        beats: [
          {
            body: "Shoppers use the passport to scan, understand, save, and resell the things they own.",
            cue: "shopper flow",
            headline: "One layer works for the everyday user",
            label: "Beat 1",
            uiFocus: "Showing the shopper-facing experience first."
          },
          {
            body: "Creators and vendors use the same passport to tell product stories, list items, and build trust faster.",
            cue: "creator and vendor flow",
            headline: "Extend the same passport into growth and commerce",
            label: "Beat 2",
            uiFocus: "Switching focus to creator and vendor workflows."
          },
          {
            body: "Brand and compliance teams keep claims, governance, and circular data aligned without breaking the user experience.",
            cue: "brand governance",
            headline: "Keep every role on one source of truth",
            label: "Beat 3",
            uiFocus: "Ending on the shared governance and brand control layer."
          },
          {
            body: "The full platform view then comes together so every role can be seen operating on top of the same passport system.",
            cue: "full role system",
            headline: "See the whole role-based platform together",
            label: "Beat 4",
            uiFocus: "Showing shoppers, creators, vendors, and brand teams inside one shared DPP platform."
          }
        ],
        ctaLabel: "Choose role",
        description:
          "The same DPP layer powers shoppers, creators, vendors, and brand teams, each with the tools that fit their job.",
        eyebrow: "Role-aware platform",
        editCaption: "one layer for every role",
        editSurface: "light",
        featureList: [
          "Shoppers scan, track, and earn rewards",
          "Creators share verified product stories with confidence",
          "Vendors list inventory with trust built in",
          "Brand teams govern claims, compliance, and circular data"
        ],
        icon: "Layers3",
        id: "roles",
        metrics: [
          { label: "Role views", value: `${featuredRoles.length} tailored demos` },
          { label: "Shared layer", value: "1 passport system" },
          { label: "Story", value: "Scan to resale" }
        ],
        narrationLine:
          "One passport layer powers many workflows. The experience adapts for shoppers, creators, vendors, and brand teams without losing a single source of truth.",
        shortLabel: "Roles",
        title: "Scale one DPP system across every role in the circular stack"
      }
    ],
    [featuredRoles.length, previewData]
  );

  const chapterAudioSources = React.useMemo(
    () =>
      previewChapters.reduce(
        (paths, chapter) => ({ ...paths, [chapter.id]: `/audio/demo-preview/${chapter.id}.wav?v=${DEMO_AUDIO_VERSION}` }),
        {} as Record<PreviewSceneId, string>
      ),
    [previewChapters]
  );
  const chapterIndexById = React.useMemo(
    () =>
      previewChapters.reduce(
        (indexes, chapter, index) => ({
          ...indexes,
          [chapter.id]: index
        }),
        {} as Record<PreviewSceneId, number>
      ),
    [previewChapters]
  );
  const featureDockItems = React.useMemo<DemoFeatureDockItem[]>(
    () => [
      { chapterId: "dashboard", icon: LayoutDashboard, id: "dashboard", infoTabId: "overview", label: "Dashboard" },
      { chapterId: "dashboard", icon: Search, id: "search", infoTabId: "features", label: "Search" },
      { chapterId: "scan", icon: Camera, id: "camera", infoTabId: "features", label: "Camera scan" },
      { chapterId: "passport", icon: BadgeCheck, id: "passport", infoTabId: "passport", label: "Passport" },
      { chapterId: "rewards", icon: Trophy, id: "rewards", infoTabId: "rewards", label: "Rewards" },
      { chapterId: "dashboard", icon: Bell, id: "notifications", infoTabId: "features", label: "Notifications" },
      { chapterId: "dashboard", icon: BarChart3, id: "analytics", infoTabId: "analytics", label: "Analytics" },
      { chapterId: "dashboard", icon: Settings2, id: "settings", infoTabId: "settings", label: "Settings" },
      { chapterId: "dashboard", icon: MessageSquare, id: "messaging", infoTabId: "features", label: "Messaging" },
      { chapterId: "roles", icon: UserCircle2, id: "profile", infoTabId: "more-info", label: "Profile" }
    ],
    []
  );
  const infoTabs = React.useMemo<DemoInfoTab[]>(
    () => [
      {
        description:
          "Start with one clear command center that shows the platform at a glance: dashboard cards, search, product detail, notifications, inbox, workflow automation, and mobile preview.",
        details: [
          "See the full product UI without cropping the key surfaces.",
          "Dashboard cards, search, notifications, messaging, and product detail stay on one premium screen.",
          "The hero preview opens like a product ad, then pulls back to show the whole system together."
        ],
        icon: LayoutDashboard,
        id: "overview",
        linkedChapterId: "dashboard",
        metrics: [
          { label: "Passport coverage", value: `${previewData.passportCoveragePercent}%` },
          { label: "Trust center", value: `${previewData.trustCenterScore}/100` },
          { label: "Unread signals", value: "19 live" }
        ],
        title: "Overview"
      },
      {
        description:
          "The feature layer shows how people actually use the app: search, camera scan, QR, barcode, NFC, messaging, and notifications all guide users into the same verified product flow.",
        details: [
          "Camera scan, QR, NFC, barcode, and search all open one Digital Product Passport flow.",
          "Messages and notifications keep the user informed without breaking the product journey.",
          "The feature dock makes the core icons easy to recognize in one place."
        ],
        icon: Camera,
        id: "features",
        linkedChapterId: "scan",
        metrics: [
          { label: "Live inputs", value: "4 scan paths" },
          { label: "Search handoff", value: previewData.searchHint },
          { label: "Matched item", value: previewData.productName }
        ],
        title: "Features"
      },
      {
        description:
          "Rewards turn transparency into retention. Impact Points™, streaks, badges, and challenges make circular behavior feel motivating instead of passive.",
        details: [
          "Points reward scans, repairs, reuse, and marketplace actions.",
          "Streaks and challenges make the circular loop feel habit-forming.",
          "Badges create visible milestones people want to keep climbing."
        ],
        icon: Trophy,
        id: "rewards",
        linkedChapterId: "rewards",
        metrics: [
          { label: "Impact Points™", value: previewData.impactPoints.toLocaleString() },
          { label: "Streak", value: `${previewData.streakDays} days` },
          { label: "Unlocked badges", value: String(previewData.unlockedRewardCount) }
        ],
        title: "Rewards"
      },
      {
        description:
          "The Digital Product Passport brings brand, materials, origin, authenticity, care, repair, resale value, and take-back into one premium screen.",
        details: [
          "Identity, trust, and origin are visible first.",
          "Care, repair, and material data are easy to understand at a glance.",
          "Resale, recycling, and take-back keep the item moving after purchase."
        ],
        icon: BadgeCheck,
        id: "passport",
        linkedChapterId: "passport",
        metrics: [
          { label: "Circularity", value: `${previewData.circularityScore}/100` },
          { label: "Authenticity", value: previewData.authenticity },
          { label: "Resale", value: formatCurrency(previewData.resaleValueEstimate) }
        ],
        title: "Passport"
      },
      {
        description:
          "Analytics show the business value of the platform fast with enterprise readiness, supplier risk, compliance health, and live product performance in one modern command center.",
        details: [
          "Numbers, charts, and live trust signals explain the product story in seconds.",
          "Enterprise and supplier visibility support investor and brand conversations.",
          "Analytics stay connected to the same scan and passport system."
        ],
        icon: BarChart3,
        id: "analytics",
        linkedChapterId: "dashboard",
        metrics: [
          { label: "Compliance", value: `${previewData.complianceReadiness}/100` },
          { label: "Enterprise", value: `${previewData.enterpriseReadiness}/100` },
          { label: "Supplier risk", value: `${previewData.supplierRiskAverage} avg` }
        ],
        title: "Analytics"
      },
      {
        description:
          "Settings and controls show the platform is production-minded, with privacy, trust rules, governance, rewards automation, and responsive product behavior in one clean control layer.",
        details: [
          "Privacy, trust, and marketplace rules can be surfaced without clutter.",
          "The same preview shows settings, notifications, and mobile responsiveness together.",
          "The result feels premium, controlled, and easy to understand."
        ],
        icon: Settings2,
        id: "settings",
        linkedChapterId: "dashboard",
        metrics: [
          { label: "Sync status", value: "Live" },
          { label: "Trust rules", value: "3 active" },
          { label: "Mobile preview", value: "Responsive" }
        ],
        title: "Settings"
      },
      {
        description:
          "More Info connects wardrobe, profile, marketplace, and role-aware experiences so users see the full platform beyond the first scan.",
        details: [
          "Profile and role-aware views keep the experience tailored without losing the shared passport layer.",
          "Wardrobe and marketplace make the item useful after the first interaction.",
          "The same system supports shoppers, creators, vendors, and brand teams."
        ],
        icon: UserCircle2,
        id: "more-info",
        linkedChapterId: "roles",
        metrics: [
          { label: "Role views", value: `${featuredRoles.length} demos` },
          { label: "Saved wardrobe", value: `${previewData.inventoryCount} items` },
          { label: "Resale path", value: formatCurrency(previewData.listingPrice) }
        ],
        title: "More Info"
      }
    ],
    [featuredRoles.length, previewData]
  );

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [selectedInfoTabId, setSelectedInfoTabId] = React.useState<DemoInfoTabId>("overview");
  const [chapterProgressMs, setChapterProgressMs] = React.useState(0);
  const [chapterDurationsMsById, setChapterDurationsMsById] = React.useState<Partial<Record<PreviewSceneId, number>>>({});
  const [fullscreenSupported, setFullscreenSupported] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [narrationStatus, setNarrationStatus] = React.useState<NarrationStatus>("ready");
  const [narrationMessage, setNarrationMessage] = React.useState("Narration audio is ready. Press Play full video to watch the guided tour with audio, or switch to Chapter guide to hear one screen at a time.");
  const [playbackMode, setPlaybackMode] = React.useState<PreviewPlaybackMode>("full");
  const [voiceEnabled, setVoiceEnabled] = React.useState(true);
  const [voiceSupported, setVoiceSupported] = React.useState(true);
  const [audioError, setAudioError] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const playerRef = React.useRef<HTMLDivElement | null>(null);
  const autoPlayStartedRef = React.useRef(false);
  const activeIndexRef = React.useRef(0);
  const playbackModeRef = React.useRef<PreviewPlaybackMode>("full");
  const voiceEnabledRef = React.useRef(true);
  const activeChapter = previewChapters[activeIndex] ?? previewChapters[0];
  const ActiveIcon = chapterIconMap[activeChapter.icon];
  const lightEditSurface = activeChapter.editSurface === "light";

  const previewChapterDurationsMs = React.useMemo(
    () => previewChapters.map((chapter) => chapterDurationsMsById[chapter.id] ?? getChapterDurationMs(chapter)),
    [chapterDurationsMsById, previewChapters]
  );
  const chapterStartOffsetsMs = React.useMemo(
    () => getChapterStartOffsetsMs(previewChapterDurationsMs),
    [previewChapterDurationsMs]
  );
  const totalDurationMs = React.useMemo(
    () => previewChapterDurationsMs.reduce((sum, duration) => sum + duration, 0),
    [previewChapterDurationsMs]
  );
  const chapterDurationMs = previewChapterDurationsMs[activeIndex] ?? MIN_CHAPTER_DURATION_MS;
  const chapterProgress = clamp(chapterProgressMs / Math.max(chapterDurationMs, 1), 0, 1);
  const timelinePositionMs = clamp((chapterStartOffsetsMs[activeIndex] ?? 0) + chapterProgressMs, 0, totalDurationMs);
  const overallProgress = totalDurationMs > 0 ? (timelinePositionMs / totalDurationMs) * 100 : 0;
  const activeBeatIndex = React.useMemo(
    () => getBeatIndex(chapterProgress, activeChapter.beats.length),
    [activeChapter.beats.length, chapterProgress]
  );
  const activeBeat = activeChapter.beats[activeBeatIndex] ?? activeChapter.beats[0];
  const isOverviewBeat = activeBeatIndex === activeChapter.beats.length - 1;
  const activeFeatureIndex = isOverviewBeat ? -1 : activeBeatIndex % activeChapter.featureList.length;
  const activeMetricIndex = isOverviewBeat ? -1 : activeBeatIndex % activeChapter.metrics.length;
  const selectedInfoTab = infoTabs.find((tab) => tab.id === selectedInfoTabId) ?? infoTabs[0];
  const SelectedInfoIcon = selectedInfoTab.icon;
  const activeFeatureDockIds = React.useMemo(
    () => getActiveFeatureDockIds(activeChapter.id, activeBeatIndex, isOverviewBeat),
    [activeBeatIndex, activeChapter.id, isOverviewBeat]
  );
  const activeMotionKey = `${activeChapter.id}-${activeBeatIndex}`;
  const cameraState = React.useMemo(
    () => getCameraState(activeChapter.id, activeBeatIndex, isOverviewBeat),
    [activeBeatIndex, activeChapter.id, isOverviewBeat]
  );
  const cursorState = React.useMemo(
    () => getCursorState(activeChapter.id, activeBeatIndex, isOverviewBeat),
    [activeBeatIndex, activeChapter.id, isOverviewBeat]
  );

  React.useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  React.useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  React.useEffect(() => {
    if (!isPlaying) {
      return;
    }

    setSelectedInfoTabId(getInfoTabIdForPlayback(activeChapter.id, activeBeatIndex, isOverviewBeat));
  }, [activeBeatIndex, activeChapter.id, isOverviewBeat, isPlaying]);

  React.useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.muted = !voiceEnabled;
  }, [voiceEnabled]);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    setFullscreenSupported(Boolean(document.fullscreenEnabled));

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    const audio = audioRef.current;
    const firstChapter = previewChapters[0];

    if (!audio || !firstChapter) {
      return;
    }

    audio.src = chapterAudioSources[firstChapter.id];
    audio.preload = "auto";
    audio.dataset.chapterId = firstChapter.id;
    audio.muted = !voiceEnabledRef.current;
    audio.load();
  }, [chapterAudioSources, previewChapters]);

  React.useEffect(() => {
    if (typeof Audio === "undefined") {
      return;
    }

    const probes = previewChapters.map((chapter) => {
      const probe = new Audio(chapterAudioSources[chapter.id]);
      probe.preload = "metadata";

      const handleLoadedMetadata = () => {
        if (!Number.isFinite(probe.duration) || probe.duration <= 0) {
          return;
        }

        setChapterDurationsMsById((currentDurations) => {
          const nextDuration = Math.round(probe.duration * 1000);
          if (currentDurations[chapter.id] === nextDuration) {
            return currentDurations;
          }

          return {
            ...currentDurations,
            [chapter.id]: nextDuration
          };
        });
      };

      const handleError = () => {
        setVoiceSupported(false);
      };

      probe.addEventListener("loadedmetadata", handleLoadedMetadata);
      probe.addEventListener("error", handleError);
      probe.load();

      return { handleError, handleLoadedMetadata, probe };
    });

    return () => {
      probes.forEach(({ handleError, handleLoadedMetadata, probe }) => {
        probe.removeEventListener("loadedmetadata", handleLoadedMetadata);
        probe.removeEventListener("error", handleError);
      });
    };
  }, [chapterAudioSources, previewChapters]);

  const stopAudioPlayback = React.useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
  }, []);

  const loadChapterAudio = React.useCallback(
    (index: number, options?: { allowMutedFallback?: boolean; autoplay?: boolean; restart?: boolean }) => {
      const audio = audioRef.current;
      const normalizedIndex = (index + previewChapters.length) % previewChapters.length;
      const nextChapter = previewChapters[normalizedIndex];

      if (!audio || !nextChapter) {
        return;
      }

      const nextSource = chapterAudioSources[nextChapter.id];
      const chapterChanged = audio.dataset.chapterId !== nextChapter.id;

      setActiveIndex(normalizedIndex);
      setChapterProgressMs(0);
      setAudioError(null);

      if (chapterChanged) {
        audio.pause();
        audio.src = nextSource;
        audio.dataset.chapterId = nextChapter.id;
        audio.load();
      }

      audio.muted = !voiceEnabledRef.current;

      if (options?.restart ?? true) {
        try {
          audio.currentTime = 0;
        } catch {
          // Ignore browsers that block currentTime until metadata is ready.
        }
      }

      if (!options?.autoplay) {
        setNarrationStatus(voiceEnabledRef.current ? "ready" : "idle");
        setNarrationMessage(
          voiceEnabledRef.current
            ? `${nextChapter.shortLabel} is ready. Press play to hear the narration.`
            : "Audio is muted. Turn audio on to hear the narration."
        );
        return;
      }

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          if (options?.allowMutedFallback && !audio.muted) {
            audio.muted = true;
            setVoiceEnabled(false);
            setNarrationStatus("idle");
            setNarrationMessage("The teaser is auto-playing. Turn audio on or press replay to hear the narration.");
            const mutedPlayPromise = audio.play();
            if (mutedPlayPromise && typeof mutedPlayPromise.catch === "function") {
              mutedPlayPromise.catch(() => {
                setIsPlaying(false);
                setNarrationStatus("error");
                setNarrationMessage("Audio is ready, but the browser needs a direct play click to start it.");
              });
            }
            return;
          }

          setIsPlaying(false);
          setNarrationStatus("error");
          setNarrationMessage("Audio is ready, but the browser needs a direct play click to start it.");
        });
      }
    },
    [chapterAudioSources, previewChapters]
  );

  React.useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleLoadedMetadata = () => {
      const chapterId = audio.dataset.chapterId as PreviewSceneId | undefined;
      if (chapterId && Number.isFinite(audio.duration) && audio.duration > 0) {
        setChapterDurationsMsById((currentDurations) => {
          const nextDuration = Math.round(audio.duration * 1000);
          if (currentDurations[chapterId] === nextDuration) {
            return currentDurations;
          }

          return {
            ...currentDurations,
            [chapterId]: nextDuration
          };
        });
      }

      setVoiceSupported(true);
    };

    const handleTimeUpdate = () => {
      setChapterProgressMs(Math.round(audio.currentTime * 1000));
    };

    const handlePlay = () => {
      const currentChapter = previewChapters[activeIndexRef.current] ?? previewChapters[0];
      setIsPlaying(true);
      setNarrationStatus(voiceEnabledRef.current ? "playing" : "idle");
      setNarrationMessage(
        voiceEnabledRef.current
          ? `Playing ${playbackModeRef.current === "full" ? "the full video" : `${currentChapter.shortLabel.toLowerCase()} audio`}.`
          : "Audio is muted. Turn audio on to hear the narration."
      );
    };

    const handlePause = () => {
      if (audio.ended) {
        return;
      }

      setIsPlaying(false);
      setNarrationStatus(voiceEnabledRef.current ? "ready" : "idle");
      setNarrationMessage(
        voiceEnabledRef.current
          ? playbackModeRef.current === "full"
            ? "Video paused. Press play to continue the guided tour."
            : "Chapter paused. Press play to continue this screen."
          : "Audio is muted. Turn audio on to hear the narration."
      );
    };

    const handleEnded = () => {
      const currentIndex = activeIndexRef.current;
      const currentChapter = previewChapters[currentIndex] ?? previewChapters[0];
      const completedDuration = Math.round((audio.duration || 0) * 1000) || previewChapterDurationsMs[currentIndex] || MIN_CHAPTER_DURATION_MS;
      setChapterProgressMs(completedDuration);

      if (playbackModeRef.current === "full" && currentIndex < previewChapters.length - 1) {
        loadChapterAudio(currentIndex + 1, { autoplay: true, restart: true });
        return;
      }

      setIsPlaying(false);
      setNarrationStatus(voiceEnabledRef.current ? "ready" : "idle");
      setNarrationMessage(
        playbackModeRef.current === "full"
          ? "Full video finished. Press Play full video to watch it again."
          : `${currentChapter.shortLabel} finished. Pick another chapter or replay this one.`
      );
    };

    const handleError = () => {
      setIsPlaying(false);
      setVoiceSupported(false);
      setAudioError("Narration audio could not be loaded.");
      setNarrationStatus("error");
      setNarrationMessage("Narration audio could not be loaded.");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [loadChapterAudio, previewChapterDurationsMs, previewChapters]);

  React.useEffect(() => {
    return () => {
      stopAudioPlayback();
    };
  }, [stopAudioPlayback]);

  const playFromIndex = React.useCallback(
    (index: number, mode: PreviewPlaybackMode, options?: { allowMutedFallback?: boolean }) => {
      playbackModeRef.current = mode;
      setPlaybackMode(mode);
      loadChapterAudio(index, { allowMutedFallback: options?.allowMutedFallback, autoplay: true, restart: true });
    },
    [loadChapterAudio]
  );

  const handlePlayPause = React.useCallback(() => {
    if (isPlaying) {
      stopAudioPlayback();
      return;
    }

    if (playbackMode === "full") {
      const shouldRestart = activeIndex === previewChapters.length - 1 && chapterProgressMs >= chapterDurationMs - 150;
      playFromIndex(shouldRestart ? 0 : activeIndex, "full");
      return;
    }

    playFromIndex(activeIndex, "chapter");
  }, [activeIndex, chapterDurationMs, chapterProgressMs, isPlaying, playFromIndex, playbackMode, previewChapters.length, stopAudioPlayback]);

  const handlePreviewStageClick = React.useCallback(() => {
    if (isPlaying) {
      return;
    }

    handlePlayPause();
  }, [handlePlayPause, isPlaying]);

  const handleReplayNarration = React.useCallback(() => {
    playFromIndex(activeIndex, playbackMode);
  }, [activeIndex, playFromIndex, playbackMode]);

  const handlePlaybackModeChange = React.useCallback(
    (mode: PreviewPlaybackMode) => {
      if (mode === playbackMode) {
        return;
      }

      stopAudioPlayback();
      playbackModeRef.current = mode;
      setPlaybackMode(mode);
      setChapterProgressMs(0);
      setNarrationStatus(voiceEnabledRef.current ? "ready" : "idle");
      setNarrationMessage(
        mode === "full"
          ? "Video tour ready. Press Play full video for the start-to-finish walkthrough."
          : "Chapter guide ready. Choose a chapter to hear one screen at a time."
      );
    },
    [playbackMode, stopAudioPlayback]
  );

  const handleVoiceToggle = React.useCallback(() => {
    setVoiceEnabled((currentValue) => !currentValue);
    setNarrationStatus(voiceEnabled ? "idle" : isPlaying ? "playing" : "ready");
    setNarrationMessage(
      voiceEnabled
        ? "Audio muted. Turn audio on whenever you want to hear the narration."
        : isPlaying
          ? "Audio is back on."
          : "Audio is on. Press play to hear the narration."
    );
  }, [isPlaying, voiceEnabled]);

  const handleChapterCardClick = React.useCallback(
    (index: number) => {
      if (playbackMode === "full") {
        playFromIndex(index, "full");
        return;
      }

      playFromIndex(index, "chapter");
    },
    [playFromIndex, playbackMode]
  );

  const handleFeatureDockClick = React.useCallback(
    (item: DemoFeatureDockItem) => {
      setSelectedInfoTabId(item.infoTabId);
      handleChapterCardClick(chapterIndexById[item.chapterId] ?? 0);
    },
    [chapterIndexById, handleChapterCardClick]
  );

  const handleInfoTabClick = React.useCallback((tabId: DemoInfoTabId) => {
    setSelectedInfoTabId(tabId);
  }, []);

  const handleOpenInfoChapter = React.useCallback(
    (chapterId: PreviewSceneId) => {
      handleChapterCardClick(chapterIndexById[chapterId] ?? 0);
    },
    [chapterIndexById, handleChapterCardClick]
  );

  const handleOpenInfoChapterGuide = React.useCallback(
    (chapterId: PreviewSceneId) => {
      playFromIndex(chapterIndexById[chapterId] ?? 0, "chapter");
    },
    [chapterIndexById, playFromIndex]
  );

  const handleFullscreenToggle = React.useCallback(async () => {
    if (typeof document === "undefined") {
      return;
    }

    const player = playerRef.current;

    if (!player || !document.fullscreenEnabled) {
      return;
    }

    if (document.fullscreenElement === player) {
      await document.exitFullscreen();
      return;
    }

    await player.requestFullscreen();
  }, []);

  React.useEffect(() => {
    if (!autoPlayOnMount || autoPlayStartedRef.current) {
      return;
    }

    autoPlayStartedRef.current = true;
    const autoPlayTimer = window.setTimeout(() => {
      playFromIndex(0, "full", { allowMutedFallback: true });
    }, 780);

    return () => {
      window.clearTimeout(autoPlayTimer);
    };
  }, [autoPlayOnMount, playFromIndex]);

  const voiceStatusLabel = !voiceSupported
    ? "Audio unavailable"
    : !voiceEnabled
      ? "Audio muted"
      : narrationStatus === "playing"
        ? "Narration playing"
        : narrationStatus === "error"
          ? "Audio needs restart"
          : "Narration ready";

  const voiceStatusDescription = audioError ?? narrationMessage;

  const playButtonLabel = playbackMode === "full" ? (isPlaying ? "Pause video" : "Play full video") : isPlaying ? "Pause chapter" : "Play chapter";
  const beatTransitionProgress = React.useMemo(
    () => getBeatTransitionProgress(chapterProgress, activeChapter.beats.length),
    [activeChapter.beats.length, chapterProgress]
  );
  const stageTakesPriority = playbackMode === "full" && !isFullscreen;
  const showCenterHeadline = playbackMode !== "full" && beatTransitionProgress < 0.42;
  const showStageEditorialOverlay = playbackMode !== "full";

  return (
    <MotionConfig transition={{ duration: 0.72, ease: [0.2, 0.9, 0.22, 1] }}>
      <div
        ref={playerRef}
        className={[
          "overflow-hidden border border-white/12 bg-stone-950 shadow-shell",
          isFullscreen
            ? "h-screen rounded-none"
            : stageTakesPriority
              ? "rounded-[2rem]"
              : "rounded-[2rem] lg:h-[84vh] lg:max-h-[58rem]"
        ].join(" ")}
      >
      <div className="border-b border-white/10 bg-white/6 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-1 flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-300/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/90" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Video tour and chapter guide</p>
              <p className="mt-1 text-sm text-white/84">
                Watch the app from start to finish, or open one chapter at a time to hear what each part offers.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/68">
            Chapter {activeIndex + 1} of {previewChapters.length}
          </span>
        </div>
      </div>

      <div
        className={[
          "p-4 sm:p-5",
          isFullscreen
            ? "h-[calc(100%-4.5rem)] overflow-hidden"
            : stageTakesPriority
              ? ""
              : "lg:h-[calc(100%-4.5rem)]"
        ].join(" ")}
      >
        <div
          className={[
            "grid gap-4 lg:h-full",
            stageTakesPriority ? "" : "lg:grid-cols-[minmax(0,1.28fr)_17.5rem] xl:grid-cols-[minmax(0,1.32fr)_18.5rem]",
            isFullscreen ? "h-full" : ""
          ].join(" ")}
        >
          <div className="grid min-h-0 gap-4 lg:grid-rows-[minmax(0,1fr)_auto]">
            <div
              className={[
                "relative overflow-hidden rounded-[1.85rem] border px-4 py-4 transition-colors duration-500 sm:px-5 sm:py-5",
                stageTakesPriority
                  ? "min-h-[29rem] sm:min-h-[36rem] xl:min-h-[42rem]"
                  : "min-h-[24rem] sm:min-h-[29rem] lg:min-h-0 lg:h-full",
                lightEditSurface
                  ? "border-black/8 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_34%),linear-gradient(145deg,_#f9fbfd,_#edf3f9_48%,_#d9e5f0)]"
                  : "border-white/10 bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.18),_transparent_34%),linear-gradient(145deg,_#041410,_#0d1717_46%,_#050706)]"
              ].join(" ")}
            >
              <button
                type="button"
                onClick={handlePreviewStageClick}
                aria-label={isPlaying ? "Preview playing" : "Play preview"}
                className={[
                  "absolute inset-0 z-10 transition",
                  isPlaying
                    ? "cursor-default bg-transparent"
                    : lightEditSurface
                      ? "cursor-pointer bg-white/18 hover:bg-white/8"
                      : "cursor-pointer bg-black/18 hover:bg-black/10"
                ].join(" ")}
              >
                {!isPlaying ? (
                  <span className="absolute inset-0 flex items-center justify-center px-6">
                    <span
                      className={[
                        "max-w-[34rem] rounded-[1.6rem] border px-7 py-6 text-center shadow-soft backdrop-blur-xl",
                        lightEditSurface ? "border-black/10 bg-white/82 text-stone-950" : "border-white/12 bg-black/45 text-white"
                      ].join(" ")}
                    >
                      <span className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-inherit">
                        <span className={["h-2 w-2 rounded-full", lightEditSurface ? "bg-sky-500" : "bg-emerald-300"].join(" ")} />
                        Demo preview
                      </span>
                      <span
                        className={[
                          "mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full shadow-soft",
                          lightEditSurface ? "bg-stone-950 text-white" : "bg-emerald-300 text-stone-950"
                        ].join(" ")}
                      >
                        <Play className="ml-0.5 h-7 w-7" />
                      </span>
                      <span className={["mt-5 block text-[1.7rem] font-semibold tracking-tight sm:text-[2rem]", lightEditSurface ? "text-stone-950" : "text-white"].join(" ")}>
                        Watch the Circular Finder demo
                      </span>
                      <span className={["mt-3 block text-base leading-7", lightEditSurface ? "text-stone-700" : "text-white/92"].join(" ")}>
                        Click to play a premium product preview with synced narration, a full-screen player, and the full app UI visible inside the thumbnail.
                      </span>
                      <span className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        {["YouTube-style thumbnail", "Voice-led tour", "Expand fullscreen"].map((item) => (
                          <span
                            key={item}
                            className={[
                              "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
                              lightEditSurface ? "border-black/10 bg-white/72 text-stone-700" : "border-white/12 bg-white/8 text-white/84"
                            ].join(" ")}
                          >
                            {item}
                          </span>
                        ))}
                      </span>
                    </span>
                  </span>
                ) : null}
              </button>
              <div
                className={[
                  "pointer-events-none absolute -right-20 top-10 h-44 w-44 rounded-full blur-3xl transition-colors duration-500",
                  lightEditSurface ? "bg-sky-200/60" : "bg-white/10"
                ].join(" ")}
              />
              <div
                className={[
                  "pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full blur-3xl transition-colors duration-500",
                  lightEditSurface ? "bg-white/55" : "bg-emerald-300/15"
                ].join(" ")}
              />

              <div className="relative flex h-full min-h-0 flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                          lightEditSurface ? "bg-white/84 text-stone-700" : "bg-white/10 text-white/72"
                        ].join(" ")}
                      >
                        {activeChapter.eyebrow}
                      </span>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                          lightEditSurface ? "bg-stone-950 text-white" : "bg-white/10 text-white/52"
                        ].join(" ")}
                      >
                        {playbackMode === "full" ? "Video tour" : "Chapter guide"}
                      </span>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                          lightEditSurface ? "bg-black/6 text-stone-700" : "bg-white/8 text-white/62"
                        ].join(" ")}
                      >
                        {activeBeat.label}
                      </span>
                    </div>
                  </div>

                  <div
                    className={[
                      `flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${activeChapter.accent} shadow-soft`,
                      lightEditSurface ? "text-stone-950" : "text-white"
                    ].join(" ")}
                  >
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="relative z-[1] overflow-x-auto pb-1">
                  <div
                    className={[
                      "inline-flex min-w-full gap-2 rounded-[1.2rem] border px-2 py-2 shadow-soft backdrop-blur-xl",
                      lightEditSurface ? "border-black/10 bg-white/74" : "border-white/10 bg-black/24"
                    ].join(" ")}
                  >
                    {featureDockItems.map((item) => {
                      const DockIcon = item.icon;
                      const isActiveDockItem = activeFeatureDockIds.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleFeatureDockClick(item)}
                          className={[
                            "group inline-flex shrink-0 items-center gap-2 rounded-[1rem] border px-3 py-2.5 text-left transition-all duration-300",
                            isActiveDockItem
                              ? lightEditSurface
                                ? "border-sky-400/40 bg-sky-300/70 text-stone-950 shadow-soft"
                                : "border-cyan-300/45 bg-cyan-300/16 text-white shadow-soft"
                              : lightEditSurface
                                ? "border-black/8 bg-white/66 text-stone-700 hover:bg-white"
                                : "border-white/10 bg-white/5 text-white/72 hover:bg-white/10"
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex h-9 w-9 items-center justify-center rounded-[0.9rem] transition",
                              isActiveDockItem
                                ? lightEditSurface
                                  ? "bg-stone-950 text-white"
                                  : "bg-white text-stone-950"
                                : lightEditSurface
                                  ? "bg-black/6 text-stone-700"
                                  : "bg-white/10 text-white/72"
                            ].join(" ")}
                          >
                            <DockIcon className="h-4 w-4" />
                          </span>
                          <span className="pr-1 text-sm font-semibold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  key={`${activeMotionKey}-scene`}
                  className="relative min-h-0 flex-1 overflow-hidden rounded-[1.7rem]"
                  style={{ animation: "demoPreviewSceneReveal 820ms cubic-bezier(0.16, 0.84, 0.24, 1) both" }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      transform: `translate3d(${cameraState.x}, ${cameraState.y}, 0) scale(${cameraState.scale})`,
                      transformOrigin: cameraState.origin,
                      willChange: "transform"
                    }}
                    animate={{
                      x: cameraState.x,
                      y: cameraState.y,
                      scale: cameraState.scale
                    }}
                  >
                    <div
                      className="h-full"
                      style={{ animation: isPlaying ? "demoPreviewSceneFloat 9.5s ease-in-out infinite" : undefined }}
                    >
                      <PreviewScene
                        chapter={activeChapter}
                        data={previewData}
                        featuredRoles={featuredRoles}
                        activeBeatIndex={activeBeatIndex}
                        chapterProgress={chapterProgress}
                        isOverviewBeat={isOverviewBeat}
                        isPlaying={isPlaying}
                      />
                    </div>
                  </motion.div>
                  <PreviewCursor cursorState={cursorState} lightSurface={lightEditSurface} />
                  {showStageEditorialOverlay ? (
                    <div
                      className={[
                        "pointer-events-none absolute inset-x-4 z-[1] sm:inset-x-5",
                        showCenterHeadline ? "inset-y-0 flex items-center justify-center" : "bottom-4"
                      ].join(" ")}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${activeMotionKey}-${showCenterHeadline ? "center" : "lower"}`}
                          className={showCenterHeadline ? "mx-auto max-w-[42rem]" : "max-w-[28rem]"}
                          initial={{ opacity: 0, y: showCenterHeadline ? 18 : 12, scale: 0.92, filter: "blur(10px)" }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" }}
                        >
                          {showCenterHeadline ? (
                            <motion.div
                              className={[
                                "mx-auto flex max-w-[42rem] flex-col items-center rounded-[1.9rem] px-5 py-6 text-center shadow-soft backdrop-blur-xl sm:px-7 sm:py-7",
                                lightEditSurface ? "bg-white/82 text-stone-950" : "bg-black/54 text-white"
                              ].join(" ")}
                              initial={{ opacity: 0.72, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <motion.div
                                className={[
                                  "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em]",
                                  lightEditSurface ? "border-black/10 bg-white text-stone-700" : "border-white/12 bg-white/8 text-white/84"
                                ].join(" ")}
                                initial={{ y: 8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                              >
                                {activeChapter.shortLabel} • {activeBeat.cue}
                              </motion.div>
                              <motion.div
                                className={[
                                  "mt-5 rounded-[1.15rem] px-4 py-2.5 shadow-soft",
                                  lightEditSurface ? "bg-sky-300/88" : "bg-white/10"
                                ].join(" ")}
                                initial={{ scale: 0.94 }}
                                animate={{ scale: 1 }}
                              >
                                <AnimatedWordLine
                                  className={[
                                    "text-3xl font-semibold tracking-tight sm:text-[2.6rem]",
                                    lightEditSurface ? "text-stone-950" : "text-white"
                                  ].join(" ")}
                                  text={activeBeat.headline}
                                  tone={lightEditSurface ? "light" : "dark"}
                                  wordKey={`${activeMotionKey}-headline-overlay-center`}
                                />
                              </motion.div>
                              <motion.p
                                className={["mt-4 max-w-[34rem] text-sm leading-7 sm:text-base", lightEditSurface ? "text-stone-700" : "text-white/88"].join(" ")}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                {activeBeat.body}
                              </motion.p>
                            </motion.div>
                          ) : (
                            <>
                              <motion.div
                                className={[
                                  "w-fit rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] shadow-soft backdrop-blur",
                                  lightEditSurface ? "border-black/10 bg-white/88 text-stone-700" : "border-white/12 bg-black/55 text-white/86"
                                ].join(" ")}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                              >
                                {activeBeat.cue}
                              </motion.div>
                              <motion.div
                                className={[
                                  "mt-3 rounded-[1.3rem] border px-4 py-4 shadow-soft backdrop-blur",
                                  lightEditSurface ? "border-black/10 bg-white/84 text-stone-950" : "border-white/12 bg-black/52 text-white"
                                ].join(" ")}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <AnimatedWordLine
                                  className={["text-xl font-semibold tracking-tight sm:text-[1.75rem]", lightEditSurface ? "text-stone-950" : "text-white"].join(" ")}
                                  text={activeBeat.headline}
                                  tone={lightEditSurface ? "light" : "dark"}
                                  wordKey={`${activeMotionKey}-headline-overlay`}
                                />
                                <p className={["mt-2 text-sm leading-6", lightEditSurface ? "text-stone-700" : "text-white/88"].join(" ")}>
                                  {activeChapter.shortLabel} • {activeBeat.label}
                                </p>
                              </motion.div>
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[1] sm:inset-x-5">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${activeMotionKey}-cue-strip`}
                          className={[
                            "flex w-fit flex-wrap items-center gap-2 rounded-full border px-3 py-2 shadow-soft backdrop-blur-xl",
                            lightEditSurface ? "border-black/10 bg-white/84 text-stone-900" : "border-white/12 bg-black/42 text-white"
                          ].join(" ")}
                          initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(8px)" }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(6px)" }}
                        >
                          <span className="text-[11px] font-semibold uppercase tracking-[0.26em]">{activeBeat.cue}</span>
                          <span className={["h-1.5 w-1.5 rounded-full", lightEditSurface ? "bg-stone-900/45" : "bg-white/60"].join(" ")} />
                          <span className={["text-sm font-medium", lightEditSurface ? "text-stone-700" : "text-white/84"].join(" ")}>
                            {activeChapter.shortLabel}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur">
              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-2 inline-flex rounded-full border border-white/10 bg-black/20 p-1">
                  <button
                    type="button"
                    onClick={() => handlePlaybackModeChange("full")}
                    className={[
                      "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
                      playbackMode === "full" ? "bg-emerald-300 text-stone-950" : "text-white/68 hover:bg-white/8"
                    ].join(" ")}
                  >
                    Video tour
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlaybackModeChange("chapter")}
                    className={[
                      "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
                      playbackMode === "chapter" ? "bg-emerald-300 text-stone-950" : "text-white/68 hover:bg-white/8"
                    ].join(" ")}
                  >
                    Chapter guide
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleChapterCardClick(activeIndex - 1)}
                  aria-label="Previous chapter"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handlePlayPause}
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-emerald-200"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playButtonLabel}
                </button>
                <button
                  type="button"
                  onClick={() => handleChapterCardClick(activeIndex + 1)}
                  aria-label="Next chapter"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition hover:bg-white/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  disabled={!voiceSupported}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {voiceEnabled ? "Audio on" : "Audio off"}
                </button>
                <button
                  type="button"
                  onClick={handleReplayNarration}
                  disabled={!voiceSupported}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
                >
                  <Volume2 className="h-4 w-4" />
                  Replay audio
                </button>
                <button
                  type="button"
                  onClick={() => void handleFullscreenToggle()}
                  disabled={!fullscreenSupported}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                </button>
                <button
                  type="button"
                  onClick={onOpenRoles}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-sand-50 sm:ml-auto"
                >
                  {activeChapter.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </button>
                </div>

                <div
                  className={[
                    "mt-4 grid gap-4",
                    stageTakesPriority
                      ? "xl:grid-cols-[minmax(0,1.24fr)_minmax(0,0.76fr)]"
                      : "xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,0.88fr)]"
                  ].join(" ")}
                >
                  <motion.div
                    key={`${activeChapter.id}-${activeBeatIndex}-copy`}
                    className={[
                      "grid gap-3 rounded-[1.35rem] border px-4 py-4",
                      stageTakesPriority
                        ? lightEditSurface
                          ? "border-black/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(239,247,255,0.88))] text-stone-950 shadow-soft"
                          : "border-white/12 bg-[linear-gradient(180deg,_rgba(3,12,20,0.92),_rgba(11,23,32,0.86))] text-white shadow-soft"
                        : "border-white/10 bg-black/20 text-white"
                    ].join(" ")}
                    initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    style={{ animation: "demoPreviewHeadlineShift 720ms cubic-bezier(0.2, 0.9, 0.22, 1) both" }}
                  >
                    <div
                      key={`${activeChapter.id}-${activeBeatIndex}-cue`}
                      className={[
                        "inline-flex max-w-fit rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]",
                        stageTakesPriority
                          ? lightEditSurface
                            ? "border-black/10 bg-sky-300/70 text-stone-950"
                            : "border-white/12 bg-white/8 text-white"
                          : "border-white/12 bg-white/8 text-white"
                      ].join(" ")}
                      style={{ animation: "demoPreviewBeatSlide 520ms ease both" }}
                    >
                      {activeChapter.editCaption} • {activeBeat.cue}
                    </div>
                    <p className={["mt-1 text-[11px] uppercase tracking-[0.22em]", stageTakesPriority ? (lightEditSurface ? "text-stone-500" : "text-white/48") : "text-white/48"].join(" ")}>
                      {activeChapter.title}
                    </p>
                    <AnimatedWordLine
                      className={[
                        "max-w-4xl font-semibold tracking-tight",
                        stageTakesPriority ? "text-[2.15rem] sm:text-[2.85rem]" : "text-2xl sm:text-[2.1rem]",
                        stageTakesPriority ? (lightEditSurface ? "text-stone-950" : "text-white") : "text-white"
                      ].join(" ")}
                      text={activeBeat.headline}
                      tone={stageTakesPriority && lightEditSurface ? "light" : "dark"}
                      wordKey={`${activeMotionKey}-headline-card`}
                    />
                    <p
                      className={[
                        "max-w-3xl leading-7 sm:text-base",
                        stageTakesPriority ? "text-base" : "text-sm",
                        stageTakesPriority ? (lightEditSurface ? "text-stone-700" : "text-white/90") : "text-white/92"
                      ].join(" ")}
                      style={{ animation: "demoPreviewTextRise 860ms cubic-bezier(0.2, 0.9, 0.22, 1) both" }}
                    >
                      {activeBeat.body}
                    </p>

                    {stageTakesPriority ? (
                      <div className="grid gap-3 pt-2 lg:grid-cols-2">
                        <div
                          className={[
                            "rounded-[1.15rem] border px-4 py-3",
                            lightEditSurface ? "border-black/10 bg-white/72" : "border-white/10 bg-white/6"
                          ].join(" ")}
                        >
                          <p className={["text-[11px] uppercase tracking-[0.18em]", lightEditSurface ? "text-stone-500" : "text-white/48"].join(" ")}>
                            Spoken line
                          </p>
                          <p className={["mt-2 text-sm leading-7", lightEditSurface ? "text-stone-700" : "text-white/86"].join(" ")}>
                            {activeBeat.body}
                          </p>
                        </div>
                        <div
                          className={[
                            "rounded-[1.15rem] border px-4 py-3",
                            lightEditSurface ? "border-black/10 bg-white/72" : "border-white/10 bg-white/6"
                          ].join(" ")}
                        >
                          <p className={["text-[11px] uppercase tracking-[0.18em]", lightEditSurface ? "text-stone-500" : "text-white/48"].join(" ")}>
                            Matching UI move
                          </p>
                          <p className={["mt-2 text-sm leading-7", lightEditSurface ? "text-stone-700" : "text-white/86"].join(" ")}>
                            {activeBeat.uiFocus}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="pt-1">
                      <div className={["flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.18em]", stageTakesPriority ? (lightEditSurface ? "text-stone-500" : "text-white/52") : "text-white/52"].join(" ")}>
                        <span>{playbackMode === "full" ? "Video progress" : "Chapter progress"}</span>
                        <span>
                          {activeIndex + 1} / {previewChapters.length}
                        </span>
                      </div>
                      <div className={["mt-2 h-2 rounded-full", lightEditSurface ? "bg-stone-900/8" : "bg-white/10"].join(" ")}>
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 transition-[width] duration-300"
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>

                      <div className={["mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.18em]", stageTakesPriority ? (lightEditSurface ? "text-stone-500" : "text-white/45") : "text-white/45"].join(" ")}>
                        <span>{playbackMode === "full" ? "Time through video" : "Time in chapter"}</span>
                        <span>
                          {formatDurationLabel(timelinePositionMs)} / {formatDurationLabel(totalDurationMs)}
                        </span>
                      </div>
                      <div className={["mt-2 h-2 rounded-full", lightEditSurface ? "bg-stone-900/8" : "bg-white/10"].join(" ")}>
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${activeChapter.accent} transition-[width] duration-300`}
                          style={{ width: `${chapterProgress * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {stageTakesPriority ? (
                    <div className="grid gap-4">
                      <motion.div
                        key={`${activeChapter.id}-${activeBeatIndex}-sync`}
                        className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4"
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Voice and UI sync</p>
                        <p className="mt-3 text-sm leading-7 text-white/92">{activeBeat.uiFocus}</p>
                        <div className="mt-4 flex gap-2">
                          {activeChapter.beats.map((beat, beatIndex) => (
                            <div
                              key={`${activeChapter.id}-${beat.label}`}
                              className={[
                                "h-2.5 flex-1 rounded-full transition-all duration-500",
                                beatIndex < activeBeatIndex
                                  ? `bg-gradient-to-r ${activeChapter.accent}`
                                  : beatIndex === activeBeatIndex
                                    ? "bg-white"
                                    : "bg-white/10"
                              ].join(" ")}
                            />
                          ))}
                        </div>
                        <p className="mt-4 text-xs leading-6 text-white/72">
                          Full video mode keeps the app window clean, then moves the narration and explanation below the stage so the product stays readable.
                        </p>
                      </motion.div>

                      <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">How to use this preview</p>
                        <p className="mt-3 text-sm leading-7 text-white/88">
                          `Video tour` now behaves more like a teaser: the full interface stays visible while the synced narration and text update below it.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-white/74">
                          `Chapter guide` keeps the larger on-screen overlays so one feature can be read in place before you jump to the next screen.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        key={`${activeChapter.id}-${activeBeatIndex}-sync`}
                        className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4"
                        style={{ animation: "demoPreviewBeatIn 520ms ease both" }}
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Voice and UI sync</p>
                        <p className="mt-3 text-sm leading-7 text-white/92">{activeBeat.uiFocus}</p>
                        <div className="mt-4 flex gap-2">
                          {activeChapter.beats.map((beat, beatIndex) => (
                            <div
                              key={`${activeChapter.id}-${beat.label}`}
                              className={[
                                "h-2.5 flex-1 rounded-full transition-all duration-500",
                                beatIndex < activeBeatIndex
                                  ? `bg-gradient-to-r ${activeChapter.accent}`
                                  : beatIndex === activeBeatIndex
                                    ? "bg-white"
                                    : "bg-white/10"
                              ].join(" ")}
                            />
                          ))}
                        </div>
                        <p className="mt-4 text-xs leading-6 text-white/72">
                          The video now keeps the interface itself visible, then explains what is happening below the stage instead of covering the UI.
                        </p>
                      </div>

                      <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">How to use this preview</p>
                        <p className="mt-3 text-sm leading-7 text-white/88">
                          `Video tour` plays the full story with audio while keeping the product UI as the main focus on screen.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-white/74">
                          `Chapter guide` lets you jump to one screen, read what it offers, and replay that chapter audio without losing the interface view.
                        </p>
                      </div>
                    </>
                  )}
                </div>
                </div>
              </div>

          <div
            className={[
              "grid min-h-0 gap-4",
              stageTakesPriority ? "xl:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]" : "lg:overflow-y-auto lg:pr-1"
            ].join(" ")}
          >
            <div className={["rounded-[1.45rem] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur", stageTakesPriority ? "xl:col-span-2" : ""].join(" ")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Current screen</p>
                <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                  {voiceStatusLabel}
                </span>
              </div>

              <p className="mt-3 text-lg font-semibold text-white">{activeChapter.shortLabel}</p>
              <p className="mt-2 text-sm leading-7 text-white/88">{activeChapter.description}</p>

              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Narration audio</p>
                  <button
                    type="button"
                    onClick={handleReplayNarration}
                    disabled={!voiceSupported}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    Replay audio
                  </button>
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/48">Line on screen now</p>
                <p
                  key={`${activeChapter.id}-${activeBeatIndex}-narration`}
                  className="mt-3 text-base leading-8 text-white"
                  style={{ animation: "demoPreviewBeatIn 460ms ease both" }}
                >
                  {activeBeat.body}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/48">Commercial line</p>
                <p className="mt-2 text-sm leading-7 text-white/84">{activeChapter.narrationLine}</p>
                <p className="mt-3 text-xs leading-6 text-white/72">{voiceStatusDescription}</p>
              </div>

              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">What this screen offers</p>
                <div className="mt-3 grid gap-3">
                  {activeChapter.featureList.map((feature, featureIndex) => (
                    <div
                      key={feature}
                      className={[
                        "rounded-[1.2rem] border px-4 py-3 transition-all duration-500",
                        isOverviewBeat || featureIndex === activeFeatureIndex
                          ? "border-emerald-300/50 bg-emerald-300/10 shadow-soft"
                          : "border-white/10 bg-black/20"
                      ].join(" ")}
                    >
                      <p className="text-sm leading-7 text-white/96">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Quick stats</p>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                    {isPlaying ? "Playing" : "Ready"}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {activeChapter.metrics.map((metric, metricIndex) => (
                    <div
                      key={metric.label}
                      className={[
                        "rounded-[1.2rem] border px-4 py-3 transition-all duration-500",
                        isOverviewBeat || metricIndex === activeMetricIndex
                          ? "border-cyan-300/50 bg-cyan-300/10 shadow-soft"
                          : "border-white/10 bg-black/20"
                      ].join(" ")}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{metric.label}</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[1.45rem] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Preview help</p>
                <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                  {voiceSupported ? "Audio ready" : "Audio unavailable"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-7 text-white/84">
                Click the thumbnail to start the full demo, use `Fullscreen` for the largest view, and use the chapter navigation below to open concise details about each part of the app.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  { label: "Player style", value: "Clickable thumbnail" },
                  { label: "Narration", value: voiceSupported ? "Generated audio" : "Needs restart" },
                  { label: "View mode", value: isFullscreen ? "Fullscreen" : "Embedded" }
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.15rem] border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-white/5 px-4 py-4 sm:px-5">
        <div className="rounded-[1.7rem] border border-white/10 bg-black/18 px-4 py-4 shadow-soft backdrop-blur sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Chapter navigation</p>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/84">
                Click any chapter below to read the app quickly, then jump that part into the preview player when you want to see it in motion.
              </p>
            </div>
            <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
              {infoTabs.length} sections
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {infoTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = tab.id === selectedInfoTab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleInfoTabClick(tab.id)}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                    isSelected ? "border-sky-300/55 bg-sky-300/16 text-white shadow-soft" : "border-white/10 bg-white/6 text-white/72 hover:bg-white/10"
                  ].join(" ")}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.title}
                </button>
              );
            })}
          </div>

          <motion.div
            key={selectedInfoTab.id}
            className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <div className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(3,12,20,0.92),_rgba(11,23,32,0.86))] px-4 py-4 text-white shadow-soft">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-gradient-to-br from-sky-400 via-cyan-300 to-blue-200 text-stone-950 shadow-soft">
                  <SelectedInfoIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Selected chapter</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-white">{selectedInfoTab.title}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/88">{selectedInfoTab.description}</p>

              <div className="mt-4 grid gap-3">
                {selectedInfoTab.details.map((detail) => (
                  <div key={detail} className="rounded-[1.15rem] border border-white/10 bg-white/6 px-4 py-3 text-sm leading-7 text-white/88">
                    {detail}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenInfoChapter(selectedInfoTab.linkedChapterId)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-sand-50"
                >
                  Show in preview
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenInfoChapterGuide(selectedInfoTab.linkedChapterId)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Open chapter guide
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {selectedInfoTab.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{metric.label}</p>
                    <p className="mt-3 text-sm font-semibold leading-6 text-white">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {previewChapters.map((chapter, index) => {
                  const ChapterIcon = chapterIconMap[chapter.icon];
                  const isActive = chapter.id === selectedInfoTab.linkedChapterId;

                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => handleChapterCardClick(index)}
                      className={[
                        "rounded-[1.2rem] border px-4 py-4 text-left transition",
                        isActive ? "border-emerald-300/55 bg-emerald-300/12 shadow-soft" : "border-white/10 bg-black/18 hover:bg-white/8"
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-gradient-to-br ${chapter.accent} text-white`}>
                          <ChapterIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                            {String(index + 1).padStart(2, "0")} • {chapter.shortLabel}
                          </p>
                          <p className="mt-1 text-base font-semibold text-white">{chapter.title}</p>
                          <p className="mt-2 text-sm leading-7 text-white/78">{chapter.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
        <audio ref={audioRef} className="hidden" preload="auto" aria-hidden="true" />
        <style jsx>{`
        @keyframes demoPreviewBeatIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes demoPreviewBeatSlide {
          from {
            opacity: 0;
            transform: translateX(-18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes demoPreviewOverlayZoom {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.84);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes demoPreviewHeadlineShift {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(0.94);
          }
          58% {
            opacity: 1;
            transform: translateY(-4px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes demoPreviewTextSnap {
          0% {
            opacity: 0;
            transform: scale(0.92);
            letter-spacing: -0.03em;
          }
          65% {
            opacity: 1;
            transform: scale(1.03);
            letter-spacing: -0.01em;
          }
          100% {
            opacity: 1;
            transform: scale(1);
            letter-spacing: -0.02em;
          }
        }

        @keyframes demoPreviewTextRise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes demoPreviewSceneReveal {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.92);
            filter: blur(10px);
          }
          60% {
            opacity: 1;
            transform: translateY(-4px) scale(1.02);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes demoPreviewSceneFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, -8px, 0) scale(1.008);
          }
        }

        @keyframes demoPreviewPlateEnter {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.92);
            filter: blur(14px);
          }
          62% {
            opacity: 1;
            transform: translateY(-2px) scale(1.02);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes demoPreviewWordLift {
          0% {
            opacity: 0;
            transform: translate3d(0, 18px, 0) scale(0.94) rotate(-1.4deg);
            filter: blur(8px);
          }
          60% {
            opacity: 1;
            transform: translate3d(0, -3px, 0) scale(1.02) rotate(0.4deg);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            filter: blur(0);
          }
        }

        @keyframes demoPreviewCursorPulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(94, 234, 212, 0.18);
          }
          45% {
            transform: scale(0.9);
            box-shadow: 0 0 0 14px rgba(94, 234, 212, 0);
          }
          75% {
            transform: scale(1.04);
          }
        }

        @keyframes demoPreviewCursorFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -6px, 0);
          }
        }

        @keyframes demoPreviewCursorDrag {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(12px, -8px, 0);
          }
        }
      `}</style>
      </div>
    </MotionConfig>
  );
}

function PreviewScene({
  chapter,
  data,
  featuredRoles,
  activeBeatIndex,
  chapterProgress,
  isOverviewBeat,
  isPlaying
}: {
  chapter: DemoPreviewChapter;
  data: PreviewData;
  featuredRoles: typeof roles;
  activeBeatIndex: number;
  chapterProgress: number;
  isOverviewBeat: boolean;
  isPlaying: boolean;
}) {
  const sceneProgress = clamp(chapterProgress, 0, 1);

  if (chapter.id === "dashboard") {
    const dashboardMotionEase: [number, number, number, number] = [0.2, 0.9, 0.22, 1];
    const highlightCommandCenter = isOverviewBeat || activeBeatIndex === 0;
    const highlightAnalytics = isOverviewBeat || activeBeatIndex === 1;
    const highlightOperations = isOverviewBeat || activeBeatIndex === 2;

    return (
      <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.24fr)_minmax(0,0.5fr)_minmax(0,0.26fr)]">
        <motion.div
          className="grid gap-3 transition-all duration-700"
          initial={false}
          animate={{
            opacity: isOverviewBeat || activeBeatIndex === 1 || activeBeatIndex === 2 ? 1 : 0.42,
            scale: isOverviewBeat || activeBeatIndex === 1 || activeBeatIndex === 2 ? 1 : 0.96,
            x: highlightCommandCenter ? 0 : -14
          }}
          transition={{ duration: 0.76, ease: dashboardMotionEase }}
        >
          <motion.div
            className="rounded-[1.5rem] border border-white/10 bg-black/28 p-4"
            initial={false}
            animate={{ y: highlightCommandCenter ? 0 : 8, scale: highlightCommandCenter ? 1 : 0.98 }}
            transition={{ duration: 0.68, ease: dashboardMotionEase }}
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">Workspace</p>
            <div className="mt-4 grid gap-2">
              {["Overview", "Scanner", "Marketplace", "Inbox", "Automations", "Settings"].map((item, index) => (
                <motion.div
                  key={item}
                  className={[
                    "rounded-[1rem] border px-3 py-2 text-sm transition-all duration-500",
                    isOverviewBeat || (activeBeatIndex === 2 && index >= 3) || (activeBeatIndex < 2 && index < 3)
                      ? "border-sky-300/35 bg-sky-300/12 text-white"
                      : "border-white/8 bg-white/5 text-white/54"
                  ].join(" ")}
                  initial={false}
                  animate={{
                    opacity: isOverviewBeat || (activeBeatIndex === 2 && index >= 3) || (activeBeatIndex < 2 && index < 3) ? 1 : 0.54,
                    y: highlightCommandCenter ? 0 : 6
                  }}
                  transition={{ duration: 0.5, ease: dashboardMotionEase, delay: index * 0.035 }}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={[
              "rounded-[1.5rem] border bg-white/8 p-4 transition-all duration-700",
              highlightAnalytics ? "border-cyan-300/45 shadow-soft" : "border-white/10"
            ].join(" ")}
            initial={false}
            animate={{
              y: highlightAnalytics ? -4 : 6,
              scale: highlightAnalytics ? 1.01 : 0.985
            }}
            transition={{ duration: 0.72, ease: dashboardMotionEase }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">Search</p>
              <Search className="h-4 w-4 text-white/45" />
            </div>
            <div className="mt-4 rounded-[1rem] border border-white/10 bg-black/24 px-3 py-3 text-sm text-white/82">
              Search: {data.brandName} trench passport
            </div>
            <div className="mt-3 grid gap-2">
              {["Passport found", "Scanner upload ready", "Trust center synced"].map((item) => (
                <div key={item} className="rounded-[1rem] bg-white/6 px-3 py-2 text-sm text-white/66">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={[
              "rounded-[1.5rem] border bg-white/8 p-4 transition-all duration-700",
              highlightOperations ? "border-indigo-300/45 shadow-soft" : "border-white/10"
            ].join(" ")}
            initial={false}
            animate={{
              y: highlightOperations ? -6 : 10,
              scale: highlightOperations ? 1.015 : 0.98
            }}
            transition={{ duration: 0.78, ease: dashboardMotionEase }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">Inbox</p>
              <span className="rounded-full bg-indigo-300/18 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-100">
                4 new
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                "Brand ops: Review passport coverage update",
                "Marketplace: Buyer asked about repair history",
                "Trust center: Privacy disclosure ready for review"
              ].map((message) => (
                <div key={message} className="rounded-[1rem] border border-white/10 bg-black/24 px-3 py-3 text-sm leading-6 text-white/76">
                  {message}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid gap-3 transition-all duration-700"
          initial={false}
          animate={{
            opacity: 1,
            scale: activeBeatIndex === 0 && !isOverviewBeat ? 1.02 : 1,
            x: highlightOperations ? -6 : 0
          }}
          transition={{ duration: 0.78, ease: dashboardMotionEase }}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <SceneCard active={isOverviewBeat || activeBeatIndex === 0} title="Passport coverage" value={`${data.passportCoveragePercent}% live coverage`} />
            <SceneCard active={isOverviewBeat || activeBeatIndex === 0} title="Trust center" value={`${data.trustCenterScore}/100 verified controls`} />
            <SceneCard active={isOverviewBeat || activeBeatIndex === 0} title="Enterprise readiness" value={`${data.enterpriseReadiness}/100 investor-ready`} />
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <motion.div
              className={[
                "rounded-[1.6rem] border bg-black/28 p-4 transition-all duration-700",
                isOverviewBeat || activeBeatIndex <= 1 ? "border-sky-300/45 shadow-soft" : "border-white/10"
              ].join(" ")}
              initial={false}
              animate={{
                y: highlightAnalytics ? -6 : 6,
                scale: highlightAnalytics ? 1.015 : 0.99
              }}
              transition={{ duration: 0.74, ease: dashboardMotionEase }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">Analytics</p>
                  <p className="mt-2 text-xl font-semibold text-white">Circular Finder platform performance</p>
                </div>
                <span className="rounded-full bg-sky-300/16 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100">
                  Live
                </span>
              </div>
              <div className="mt-5 grid h-[10.5rem] grid-cols-8 items-end gap-2">
                {[28, 34, 44, 39, 58, 62, 68, 74].map((height, index) => (
                  <div key={height} className="flex flex-col items-center gap-2">
                    <motion.div
                      className={[
                        "w-full rounded-t-[0.85rem] bg-gradient-to-t transition-all duration-700",
                        index >= 5 ? "from-sky-500 via-cyan-400 to-white" : "from-white/14 via-sky-300/45 to-sky-200/68"
                      ].join(" ")}
                      initial={{ height: "18%" }}
                      animate={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] uppercase tracking-[0.16em] text-white/38">W{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Compliance" value={`${data.complianceReadiness}/100 ready`} dense />
                <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Supplier risk" value={`${data.supplierRiskAverage} avg risk`} dense />
                <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Orders" value="184 active flows" dense />
              </div>
            </motion.div>

            <motion.div
              className={[
                "rounded-[1.6rem] border bg-white/8 p-4 transition-all duration-700",
                highlightAnalytics ? "border-cyan-300/45 shadow-soft" : "border-white/10"
              ].join(" ")}
              initial={false}
              animate={{
                y: highlightAnalytics ? -4 : 8,
                scale: highlightAnalytics ? 1.012 : 0.99
              }}
              transition={{ duration: 0.72, ease: dashboardMotionEase }}
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">Product detail</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                <img src={data.imageUrl} alt={data.productName} className="aspect-[4/4.8] w-full rounded-[1.1rem] object-cover" />
                <div className="grid gap-2">
                  <p className="text-sm text-white/72">{data.brandName}</p>
                  <p className="text-lg font-semibold text-white">{data.productName}</p>
                  <div className="grid gap-2">
                    <SceneCard dense active={isOverviewBeat || activeBeatIndex === 1} title="Passport" value={data.passportId} />
                    <SceneCard dense active={isOverviewBeat || activeBeatIndex === 1} title="Resale" value={formatCurrency(data.resaleValueEstimate)} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className={[
              "rounded-[1.6rem] border bg-white/8 p-4 transition-all duration-700",
              highlightOperations ? "border-indigo-300/45 shadow-soft" : "border-white/10"
            ].join(" ")}
            initial={false}
            animate={{
              y: highlightOperations ? -8 : 10,
              scale: highlightOperations ? 1.018 : 0.985
            }}
            transition={{ duration: 0.82, ease: dashboardMotionEase }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">Workflow automation</p>
                <p className="mt-2 text-lg font-semibold text-white">Circular operations queue</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/68">
                7 flows running
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                "If passport risk changes, alert compliance and freeze listing claim badges.",
                "If a scanner upload matches, attach the DPP and update search, wardrobe, and trust flows.",
                "If repair is logged, update wardrobe value, marketplace trust, and the next circular action."
              ].map((flow, index) => (
                <div
                  key={flow}
                  className={[
                    "rounded-[1rem] border px-3 py-3 text-sm leading-6 transition-all duration-500",
                    index === 1 ? "border-indigo-300/35 bg-indigo-300/12 text-white" : "border-white/10 bg-black/24 text-white/72"
                  ].join(" ")}
                >
                  {flow}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid gap-3 transition-all duration-700"
          initial={false}
          animate={{
            opacity: isOverviewBeat || activeBeatIndex >= 1 ? 1 : 0.34,
            scale: isOverviewBeat || activeBeatIndex >= 1 ? 1 : 0.97,
            x: highlightOperations ? 0 : 16
          }}
          transition={{ duration: 0.76, ease: dashboardMotionEase }}
        >
          <motion.div
            className={[
              "rounded-[1.5rem] border bg-white/8 p-4 transition-all duration-700",
              highlightAnalytics ? "border-sky-300/45 shadow-soft" : "border-white/10"
            ].join(" ")}
            initial={false}
            animate={{
              y: highlightAnalytics ? -5 : 8,
              scale: highlightAnalytics ? 1.01 : 0.99
            }}
            transition={{ duration: 0.72, ease: dashboardMotionEase }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">Notifications</p>
              <span className="rounded-full bg-emerald-300/16 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                19 live
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                "Passport confidence rose to 98%",
                "Marketplace claim review completed",
                "Privacy center update shipped to 12 users"
              ].map((item) => (
                <div key={item} className="rounded-[1rem] border border-white/10 bg-black/24 px-3 py-3 text-sm text-white/72">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={[
              "rounded-[1.5rem] border bg-white/8 p-4 transition-all duration-700",
              highlightOperations ? "border-indigo-300/45 shadow-soft" : "border-white/10"
            ].join(" ")}
            initial={false}
            animate={{
              y: highlightOperations ? -6 : 9,
              scale: highlightOperations ? 1.012 : 0.99
            }}
            transition={{ duration: 0.76, ease: dashboardMotionEase }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">Settings</p>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/64">
                Synced
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {["Privacy center controls", "Automated rewards", "Marketplace trust rules"].map((setting, index) => (
                <div key={setting} className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-black/24 px-3 py-3 text-sm text-white/72">
                  <span>{setting}</span>
                  <span className={["h-5 w-9 rounded-full p-0.5", index < 2 ? "bg-sky-400" : "bg-white/18"].join(" ")}>
                    <span className={["block h-4 w-4 rounded-full bg-white transition", index < 2 ? "translate-x-4" : "translate-x-0"].join(" ")} />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={[
              "rounded-[1.5rem] border bg-black/24 p-4 transition-all duration-700",
              highlightOperations ? "border-cyan-300/45 shadow-soft" : "border-white/10"
            ].join(" ")}
            initial={false}
            animate={{
              y: highlightOperations ? -7 : 11,
              scale: highlightOperations ? 1.014 : 0.985
            }}
            transition={{ duration: 0.8, ease: dashboardMotionEase }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/48">Mobile preview</p>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/64">
                Responsive
              </span>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="w-[10.5rem] rounded-[2rem] border border-white/10 bg-stone-950 p-3 shadow-soft">
                <div className="mx-auto h-1 w-14 rounded-full bg-white/14" />
                <div className="mt-4 rounded-[1.25rem] bg-[linear-gradient(180deg,_rgba(58,130,246,0.3),_rgba(6,9,18,1))] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/58">Mobile passport</p>
                  <div className="mt-3 rounded-[1rem] bg-white/8 p-3">
                    <p className="text-sm font-semibold text-white">{data.productName}</p>
                    <p className="mt-2 text-xs leading-5 text-white/62">Scan, verify, review trust signals, and keep circular actions moving on the go.</p>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {["Scan", "Inbox", "Wallet"].map((tab, index) => (
                      <div key={tab} className={["rounded-full px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]", index === 0 ? "bg-cyan-300 text-stone-950" : "bg-white/10 text-white/62"].join(" ")}>
                        {tab}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (chapter.id === "scan") {
    const scanFocusIndex = isOverviewBeat ? -1 : [0, 1, 3][activeBeatIndex] ?? 0;

    return (
      <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
        <div
          className={[
            "rounded-[1.65rem] border bg-black/24 p-4 transition-all duration-500",
            activeBeatIndex === 1 || isOverviewBeat ? "border-emerald-300/35 shadow-soft" : "border-white/10"
          ].join(" ")}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Smart scanner</p>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Match confidence 98%
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "QR code", icon: <QrCode className="h-4 w-4" /> },
              { label: "NFC tap", icon: <ShieldCheck className="h-4 w-4" /> },
              { label: "Barcode", icon: <Barcode className="h-4 w-4" /> },
              { label: "Search", icon: <Search className="h-4 w-4" /> }
            ].map((method, index) => (
              <span
                key={method.label}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-700",
                  index === scanFocusIndex || isOverviewBeat
                    ? "border-emerald-300/50 bg-emerald-300/16 text-emerald-100 shadow-soft"
                    : "border-white/10 bg-white/6 text-white/70"
                ].join(" ")}
                style={{
                  opacity: isOverviewBeat ? 1 : index === scanFocusIndex ? 1 : 0.32,
                  transform: isOverviewBeat
                    ? "translateY(0) scale(1)"
                    : index === scanFocusIndex
                      ? "translateY(-6px) scale(1.06)"
                      : "translateY(0) scale(0.94)"
                }}
              >
                {method.icon}
                {method.label}
              </span>
            ))}
          </div>

          <div
            className={[
              "relative mt-4 overflow-hidden rounded-[1.5rem] border bg-[#07110f] transition-all duration-500",
              activeBeatIndex === 2 || isOverviewBeat ? "border-emerald-300/45 shadow-soft" : "border-white/10"
            ].join(" ")}
            style={{
              opacity: isOverviewBeat || activeBeatIndex >= 1 ? 1 : 0.46,
              transform: isOverviewBeat ? "scale(1)" : activeBeatIndex >= 1 ? "scale(1)" : "scale(0.96)"
            }}
          >
            <img
              src={data.imageUrl}
              alt={data.productName}
              className="aspect-[4/3] w-full object-cover opacity-78 transition-transform duration-700"
              style={{ transform: `scale(${1 + sceneProgress * 0.035})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/10 to-transparent" />
            <div
              className="absolute inset-5 rounded-[1.3rem] border border-emerald-300/55 transition-all duration-500"
              style={{ transform: `scale(${0.985 + sceneProgress * 0.02})` }}
            />
            <div
              className={[
                "absolute left-5 right-5 h-0.5 bg-emerald-300/95 shadow-[0_0_24px_rgba(110,231,183,0.8)] transition",
                isPlaying ? "animate-pulse" : ""
              ].join(" ")}
              style={{ top: `${34 + sceneProgress * 28}%` }}
            />
            <div className="absolute left-5 top-5 rounded-full bg-black/45 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82 backdrop-blur">
              {data.passportId}
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.2rem] border border-white/10 bg-black/55 p-3 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Detected result</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{data.productName}</p>
                  <p className="mt-1 text-sm text-white/82">{data.brandName}</p>
                </div>
                <span
                  className="rounded-full bg-emerald-300 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-950 transition-transform duration-500"
                  style={{ transform: `translateY(${activeBeatIndex === 2 ? 0 : 2}px)` }}
                >
                  Passport ready
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <SceneCard active={isOverviewBeat || scanFocusIndex === 3} title="Search shortcut" value={data.searchHint} />
            <SceneCard active={isOverviewBeat || scanFocusIndex === 0} title="Preferred code" value={data.qrCode} />
            <SceneCard active={isOverviewBeat || scanFocusIndex === 1} title="NFC mirror" value={`NFC-${data.passportId}`} />
            <SceneCard active={isOverviewBeat || scanFocusIndex === 2} title="Barcode mirror" value={data.barcode} />
          </div>

          <div
            className={[
              "rounded-[1.5rem] border bg-white/8 p-4 transition-all duration-500",
              activeBeatIndex === 2 || isOverviewBeat ? "border-emerald-300/35 shadow-soft" : "border-white/10"
            ].join(" ")}
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Why it matters</p>
            <p className="mt-3 text-sm leading-7 text-white/88">
              One polished entry point makes product transparency feel simple. The scan layer turns a garment label,
              tap point, or product search into a verified passport without making the user think about the data
              plumbing underneath.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (chapter.id === "passport") {
    return (
      <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div
          className={[
            "rounded-[1.65rem] border bg-black/22 p-4 transition-all duration-500",
            activeBeatIndex === 0 || isOverviewBeat ? "border-cyan-300/35 shadow-soft" : "border-white/10"
          ].join(" ")}
          style={{
            opacity: isOverviewBeat || activeBeatIndex === 0 ? 1 : 0.42,
            transform: isOverviewBeat || activeBeatIndex === 0 ? "scale(1)" : "scale(0.97)"
          }}
        >
          <div className="grid gap-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
            <img
              src={data.imageUrl}
              alt={data.productName}
              className="aspect-[4/4.6] w-full rounded-[1.35rem] object-cover transition-transform duration-700"
              style={{ transform: `scale(${1 + sceneProgress * 0.025})` }}
            />
            <div className="grid gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    {data.authenticity}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/62">
                    {data.countryOfOrigin}
                  </span>
                </div>
                <p className="mt-4 text-sm text-white/82">{data.brandName}</p>
                <h4 className="mt-2 text-2xl font-semibold tracking-tight text-white">{data.productName}</h4>
                <p className="mt-3 text-sm leading-7 text-white/88">
                  A passport view that explains circularity, trust, and recovery options clearly enough for shoppers,
                  premium enough for brands, and structured enough for investors.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Circularity" value={`${data.circularityScore}/100`} dense />
                <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Resale value" value={formatCurrency(data.resaleValueEstimate)} dense />
                <SceneCard active={isOverviewBeat || activeBeatIndex === 0} title="Factory" value={data.factoryLocation} dense />
              </div>
            </div>
          </div>
        </div>

        <div
          className="grid gap-3 sm:grid-cols-2"
          style={{
            opacity: isOverviewBeat || activeBeatIndex > 0 ? 1 : 0.34,
            transform: isOverviewBeat || activeBeatIndex > 0 ? "scale(1)" : "scale(0.97)"
          }}
        >
          <SceneCard active={isOverviewBeat || activeBeatIndex === 0} title="Materials" value={data.materials.join(" • ")} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 0} title="Certifications" value={data.certifications.join(" • ")} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Care" value={data.careInstructions} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Repair" value={data.repairInstructions} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Recycling" value={data.recyclingInstructions} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Take-back" value={data.takeBackProgram} />
        </div>
      </div>
    );
  }

  if (chapter.id === "wardrobe") {
    return (
      <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div
          className={[
            "rounded-[1.65rem] border bg-black/22 p-4 transition-all duration-500",
            activeBeatIndex === 0 || isOverviewBeat ? "border-amber-300/35 shadow-soft" : "border-white/10"
          ].join(" ")}
          style={{
            opacity: isOverviewBeat || activeBeatIndex === 0 ? 1 : 0.4,
            transform: isOverviewBeat || activeBeatIndex === 0 ? "scale(1)" : "scale(0.97)"
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Saved to wardrobe</p>
              <h4 className="mt-2 text-2xl font-semibold tracking-tight text-white">{data.wardrobeLabel}</h4>
            </div>
            <span className="rounded-full border border-amber-300/30 bg-amber-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
              {data.condition}
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <img
              src={data.imageUrl}
              alt={data.productName}
              className="aspect-[4/4.6] w-full rounded-[1.3rem] object-cover transition-transform duration-700"
              style={{ transform: `scale(${1 + sceneProgress * 0.02})` }}
            />
            <div className="grid gap-3">
              <SceneCard active={isOverviewBeat || activeBeatIndex === 0} title="Passport attached" value={data.passportId} dense />
              <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Last worn" value={data.lastWorn} dense />
              <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Repair history" value={`${data.repairCount} logged service event`} dense />
              <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Next best action" value="Repair, relist, or keep in rotation from the same record." dense />
            </div>
          </div>
        </div>

        <div
          className="grid gap-3 sm:grid-cols-2"
          style={{
            opacity: isOverviewBeat || activeBeatIndex > 0 ? 1 : 0.34,
            transform: isOverviewBeat || activeBeatIndex > 0 ? "scale(1)" : "scale(0.97)"
          }}
        >
          <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Wear count" value={`${data.wearCount} wears`} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Outfit potential" value={`${data.outfitPotential} outfit paths`} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Resale wallet" value={formatCurrency(data.walletValue)} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Repair ready" value={data.repairInstructions} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Care reminder" value={data.careInstructions} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Recovery route" value={data.takeBackProgram} />
        </div>
      </div>
    );
  }

  if (chapter.id === "marketplace") {
    return (
      <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
        <div className="grid gap-3" style={{ opacity: isOverviewBeat || activeBeatIndex < 2 ? 1 : 0.62 }}>
          <MarketplaceCard
            active={isOverviewBeat || activeBeatIndex === 0}
            badge="Featured listing"
            condition={data.condition}
            imageUrl={data.imageUrl}
            passportId={data.passportId}
            price={data.listingPrice}
            productName={data.productName}
            resaleValueEstimate={data.resaleValueEstimate}
          />
          <MarketplaceCard
            active={isOverviewBeat || activeBeatIndex === 1}
            badge="Secondary listing"
            condition="excellent"
            imageUrl={data.imageUrl}
            passportId={`DPP-${data.secondaryProductName.toUpperCase().replace(/\s+/g, "-")}`}
            price={data.secondaryListingPrice}
            productName={data.secondaryProductName}
            resaleValueEstimate={Math.round(data.secondaryListingPrice * 0.78)}
          />
        </div>

        <div
          className="grid gap-3"
          style={{
            opacity: isOverviewBeat || activeBeatIndex > 0 ? 1 : 0.3,
            transform: isOverviewBeat || activeBeatIndex > 0 ? "scale(1)" : "scale(0.97)"
          }}
        >
          <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Trust signal" value={`${data.authenticity} • origin and materials visible`} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Sell-through window" value={`${data.expectedDaysToSell} days with passport-backed pricing`} />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Why buyers convert" value="Authenticity, care, repair, and resale data stay visible before checkout." />
          <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Why brands stay safe" value="Marketplace claims inherit governance-ready product data instead of ad hoc seller copy." />
        </div>
      </div>
    );
  }

  if (chapter.id === "rewards") {
    return (
      <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div
          className={[
            "rounded-[1.65rem] border bg-white/8 p-4 transition-all duration-500",
            activeBeatIndex === 0 || isOverviewBeat ? "border-fuchsia-300/40 shadow-soft" : "border-white/10"
          ].join(" ")}
          style={{
            opacity: isOverviewBeat || activeBeatIndex === 0 ? 1 : 0.4,
            transform: isOverviewBeat || activeBeatIndex === 0 ? "scale(1)" : "scale(0.97)"
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Impact engine</p>
              <h4 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {data.impactPoints.toLocaleString()} Impact Points™
              </h4>
              <p className="mt-3 text-sm leading-7 text-white/88">
                Circular actions become visible progress. The reward layer turns scanning, repair, reuse, and verified
                commerce into momentum people want to keep alive.
              </p>
            </div>
            <StreakLogo days={data.streakDays} state="active" size="lg" showDayBadge />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Streak" value={`${data.streakDays} days`} dense />
            <SceneCard active={isOverviewBeat || activeBeatIndex === 1} title="Next level" value={`${data.streakPointsToNextLevel} points`} dense />
            <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="Badges" value={`${data.unlockedRewardCount} unlocked`} dense />
          </div>
        </div>

        <div
          className="grid gap-3"
          style={{
            opacity: isOverviewBeat || activeBeatIndex > 0 ? 1 : 0.28,
            transform: isOverviewBeat || activeBeatIndex > 0 ? "scale(1)" : "scale(0.97)"
          }}
        >
          <div className="grid gap-3">
            {data.challengeCards.map((challenge) => (
              <div
                key={challenge.title}
                className={[
                  "rounded-[1.25rem] border bg-black/20 p-4 transition-all duration-500",
                  activeBeatIndex === 1 || isOverviewBeat ? "border-fuchsia-300/35 shadow-soft" : "border-white/10"
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{challenge.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">{challenge.category}</p>
                  </div>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/68">
                    {challenge.badge}
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 transition-[width] duration-700"
                    style={{ width: `${Math.max(12, challenge.progress * (activeBeatIndex === 1 && !isOverviewBeat ? sceneProgress : 1))}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-white/72">Reward: {challenge.rewardPoints} Impact Points™</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {data.badgeTitles.map((badge, badgeIndex) => (
              <div
                key={badge}
                className={[
                  "rounded-[1.25rem] border bg-white/8 px-4 py-3 text-center transition-all duration-500",
                  isOverviewBeat || (activeBeatIndex === 2 && badgeIndex === 0) ? "border-amber-300/45 shadow-soft" : "border-white/10"
                ].join(" ")}
              >
                <Award className="mx-auto h-5 w-5 text-amber-200" />
                <p className="mt-3 text-sm font-semibold text-white">{badge}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
      <div className="grid gap-3 sm:grid-cols-2">
        {featuredRoles.map((role, roleIndex) => {
          const RoleIcon = roleIconMap[role.icon as keyof typeof roleIconMap];

          return (
            <div
              key={role.id}
              className={[
                "rounded-[1.35rem] border bg-black/20 p-4 transition-all duration-500",
                isOverviewBeat || activeBeatIndex === Math.min(roleIndex, 2) ? "border-stone-200/40 shadow-soft" : "border-white/10"
              ].join(" ")}
              style={{
                opacity: isOverviewBeat || activeBeatIndex === Math.min(roleIndex, 2) ? 1 : 0.28,
                transform: isOverviewBeat || activeBeatIndex === Math.min(roleIndex, 2) ? "scale(1)" : "scale(0.95)"
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-[1rem] bg-gradient-to-br ${role.accent} text-white`}>
                  {RoleIcon ? <RoleIcon className="h-5 w-5" /> : <Layers3 className="h-5 w-5" />}
                </div>
                <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                  {role.accessLevel}
                </span>
              </div>
              <p className="mt-4 text-base font-semibold text-white">{role.label}</p>
              <p className="mt-3 text-sm leading-6 text-white/84">{role.summary}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3">
        <SceneCard active={isOverviewBeat || activeBeatIndex === 0} title="Shared product layer" value="One verified passport drives scanner, wardrobe, marketplace, rewards, and role-specific workflows." />
        <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="For investors" value="The same data model supports retention, trust, circular revenue, and brand governance instead of fragmenting each workflow." />
        <SceneCard active={isOverviewBeat || activeBeatIndex === 2} title="For operators" value="Teams can move from product verification to repair, resale, claims governance, and recovery without rebuilding context." />
      </div>
    </div>
  );
}

function AnimatedWordLine({
  className,
  text,
  tone,
  wordKey
}: {
  className?: string;
  text: string;
  tone: "dark" | "light";
  wordKey: string;
}) {
  return (
    <div className={className}>
      {text.split(" ").map((word, index) => (
        <motion.span
          key={`${wordKey}-${word}-${index}`}
          className="inline-block pr-[0.32em]"
          initial={{ opacity: 0, y: 18, scale: 0.94, rotate: -1.4, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" }}
          transition={{ delay: index * 0.055, duration: 0.72, ease: [0.18, 0.88, 0.24, 1] }}
          style={{ color: tone === "light" ? "#0f172a" : undefined }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

function PreviewCursor({
  cursorState,
  lightSurface
}: {
  cursorState: PreviewCursorState;
  lightSurface: boolean;
}) {
  const isDrag = cursorState.action === "drag";
  const isClick = cursorState.action === "click";

  return (
    <motion.div
      className="pointer-events-none absolute z-[3] transition-all duration-700"
      style={{ left: cursorState.x, top: cursorState.y, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0.2, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="relative">
        <div
          className={[
            "absolute inset-0 rounded-full blur-md",
            lightSurface ? "bg-sky-300/35" : "bg-cyan-300/28"
          ].join(" ")}
          style={{ animation: isClick ? "demoPreviewCursorPulse 1.4s ease-out infinite" : "demoPreviewCursorFloat 2.2s ease-in-out infinite" }}
        />
        <div
          className={[
            "relative flex h-9 w-9 items-center justify-center rounded-full border shadow-soft",
            lightSurface ? "border-black/12 bg-white text-stone-950" : "border-white/12 bg-white text-stone-950"
          ].join(" ")}
          style={{ animation: isDrag ? "demoPreviewCursorDrag 1.6s ease-in-out infinite" : "demoPreviewCursorFloat 2.2s ease-in-out infinite" }}
        >
          <span className="block h-2.5 w-2.5 rounded-full bg-stone-950" />
        </div>
        <div
          className={[
            "absolute left-1/2 top-full mt-3 -translate-x-1/2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-soft backdrop-blur",
            lightSurface ? "border-black/8 bg-white/92 text-stone-700" : "border-white/12 bg-black/56 text-white"
          ].join(" ")}
        >
          {cursorState.label}
        </div>
      </div>
    </motion.div>
  );
}

function MarketplaceCard({
  active = false,
  badge,
  condition,
  imageUrl,
  passportId,
  price,
  productName,
  resaleValueEstimate
}: {
  active?: boolean;
  badge: string;
  condition: string;
  imageUrl: string;
  passportId: string;
  price: number;
  productName: string;
  resaleValueEstimate: number;
}) {
  return (
    <motion.div
      className={[
        "rounded-[1.4rem] border bg-black/20 p-4 backdrop-blur-md transition-all duration-700",
        active ? "border-cyan-300/40 shadow-soft" : "border-white/10"
      ].join(" ")}
      initial={false}
      animate={{
        opacity: active ? 1 : 0.74,
        y: active ? -8 : 0,
        scale: active ? 1.035 : 0.975
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <img src={imageUrl} alt={productName} className="aspect-[4/4.6] w-full rounded-[1.15rem] object-cover" />
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/62">
              {badge}
            </span>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
              {condition}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{productName}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">{passportId}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SceneCard title="Price" value={formatCurrency(price)} dense />
            <SceneCard title="Reuse value" value={formatCurrency(resaleValueEstimate)} dense />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SceneCard({
  active = false,
  title,
  value,
  dense = false
}: {
  active?: boolean;
  title: string;
  value: string;
  dense?: boolean;
}) {
  return (
    <motion.div
      className={[
        "rounded-[1.2rem] border backdrop-blur-md transition-all duration-700",
        active ? "border-white/28 bg-white/16 shadow-soft" : "border-white/10 bg-white/8",
        dense ? "px-3 py-3" : "px-4 py-4"
      ].join(" ")}
      initial={false}
      animate={{
        opacity: active ? 1 : 0.72,
        y: active ? -6 : 0,
        scale: active ? 1.04 : 0.97
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/68">{title}</p>
      <p className={dense ? "mt-2 text-sm leading-6 text-white" : "mt-3 text-sm leading-6 text-white/94"}>{value}</p>
    </motion.div>
  );
}

function getChapterDurationMs(chapter: DemoPreviewChapter) {
  const featureWordCount = chapter.featureList.join(" ").trim().split(/\s+/).filter(Boolean).length;
  const descriptionWordCount = chapter.description.trim().split(/\s+/).filter(Boolean).length;
  const metricWordCount = chapter.metrics
    .map((metric) => `${metric.label} ${metric.value}`)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingDurationMs = ((featureWordCount + descriptionWordCount + metricWordCount) / ON_SCREEN_READING_WORDS_PER_SECOND) * 1000;
  const narrationDurationMs = estimateNarrationDurationMs(chapter.narrationLine);
  return Math.max(MIN_CHAPTER_DURATION_MS, readingDurationMs, narrationDurationMs + CHAPTER_BUFFER_MS);
}

function estimateNarrationDurationMs(text: string) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return (wordCount / NARRATION_WORDS_PER_SECOND) * 1000;
}

function getChapterStartOffsetsMs(durations: number[]) {
  let elapsedMs = 0;
  return durations.map((duration) => {
    const nextOffset = elapsedMs;
    elapsedMs += duration;
    return nextOffset;
  });
}

function getChapterIndexAtMs(targetMs: number, chapterStartOffsetsMs: number[], chapterDurationsMs: number[]) {
  for (let index = chapterStartOffsetsMs.length - 1; index >= 0; index -= 1) {
    const startMs = chapterStartOffsetsMs[index] ?? 0;
    const endMs = startMs + (chapterDurationsMs[index] ?? 0);

    if (targetMs >= startMs && targetMs <= endMs) {
      return index;
    }
  }

  return 0;
}

function getBeatIndex(progress: number, beatCount: number) {
  if (beatCount <= 1) {
    return 0;
  }

  return clamp(Math.floor(progress * beatCount), 0, beatCount - 1);
}

function getBeatTransitionProgress(progress: number, beatCount: number) {
  if (beatCount <= 0) {
    return 0;
  }

  const scaledProgress = clamp(progress, 0, 0.999) * beatCount;
  return scaledProgress - Math.floor(scaledProgress);
}

function getCameraState(chapterId: PreviewSceneId, beatIndex: number, isOverviewBeat: boolean): PreviewCameraState {
  if (isOverviewBeat) {
    return { origin: "center center", scale: 1, x: "0%", y: "0%" };
  }

  switch (chapterId) {
    case "dashboard":
      return [
        { origin: "50% 32%", scale: 1.04, x: "0%", y: "0.4%" },
        { origin: "32% 46%", scale: 1.055, x: "-1.4%", y: "0.4%" },
        { origin: "82% 54%", scale: 1.055, x: "1.5%", y: "0.2%" }
      ][beatIndex] ?? { origin: "center center", scale: 1, x: "0%", y: "0%" };
    case "scan":
      return [
        { origin: "20% 22%", scale: 1.045, x: "-1.1%", y: "-0.8%" },
        { origin: "42% 48%", scale: 1.055, x: "-0.6%", y: "0.3%" },
        { origin: "62% 78%", scale: 1.045, x: "1%", y: "1.2%" }
      ][beatIndex] ?? { origin: "center center", scale: 1, x: "0%", y: "0%" };
    case "passport":
      return [
        { origin: "34% 40%", scale: 1.045, x: "-0.8%", y: "0%" },
        { origin: "72% 44%", scale: 1.055, x: "1.2%", y: "0.1%" },
        { origin: "78% 74%", scale: 1.045, x: "1.5%", y: "0.8%" }
      ][beatIndex] ?? { origin: "center center", scale: 1, x: "0%", y: "0%" };
    case "wardrobe":
      return [
        { origin: "30% 42%", scale: 1.045, x: "-1%", y: "0.1%" },
        { origin: "67% 44%", scale: 1.045, x: "1%", y: "0.1%" },
        { origin: "73% 72%", scale: 1.045, x: "1.3%", y: "0.9%" }
      ][beatIndex] ?? { origin: "center center", scale: 1, x: "0%", y: "0%" };
    case "marketplace":
      return [
        { origin: "26% 46%", scale: 1.045, x: "-1%", y: "0.1%" },
        { origin: "38% 66%", scale: 1.045, x: "-0.8%", y: "0.7%" },
        { origin: "77% 50%", scale: 1.045, x: "1.2%", y: "0.2%" }
      ][beatIndex] ?? { origin: "center center", scale: 1, x: "0%", y: "0%" };
    case "rewards":
      return [
        { origin: "34% 34%", scale: 1.045, x: "-0.8%", y: "0%" },
        { origin: "74% 52%", scale: 1.045, x: "1.1%", y: "0.4%" },
        { origin: "73% 78%", scale: 1.045, x: "1.4%", y: "0.8%" }
      ][beatIndex] ?? { origin: "center center", scale: 1, x: "0%", y: "0%" };
    case "roles":
      return [
        { origin: "24% 42%", scale: 1.045, x: "-1%", y: "0.1%" },
        { origin: "48% 46%", scale: 1.045, x: "0%", y: "0.1%" },
        { origin: "78% 56%", scale: 1.045, x: "1.4%", y: "0.2%" }
      ][beatIndex] ?? { origin: "center center", scale: 1, x: "0%", y: "0%" };
    default:
      return { origin: "center center", scale: 1, x: "0%", y: "0%" };
  }
}

function getCursorState(chapterId: PreviewSceneId, beatIndex: number, isOverviewBeat: boolean): PreviewCursorState {
  if (isOverviewBeat) {
    return { action: "hover", label: "full view", x: "50%", y: "72%" };
  }

  const fallbackCursorState: PreviewCursorState = { action: "hover", label: "preview", x: "50%", y: "50%" };
  const cursorStateMap: Record<PreviewSceneId, PreviewCursorState[]> = {
    dashboard: [
      { action: "click", label: "assemble", x: "48%", y: "46%" },
      { action: "hover", label: "search", x: "17%", y: "55%" },
      { action: "drag", label: "mobile", x: "86%", y: "76%" }
    ],
    scan: [
      { action: "hover", label: "scan path", x: "22%", y: "61%" },
      { action: "click", label: "match", x: "40%", y: "73%" },
      { action: "hover", label: "open dpp", x: "61%", y: "82%" }
    ],
    passport: [
      { action: "hover", label: "identity", x: "38%", y: "64%" },
      { action: "click", label: "care", x: "78%", y: "67%" },
      { action: "hover", label: "recovery", x: "79%", y: "86%" }
    ],
    wardrobe: [
      { action: "hover", label: "saved item", x: "37%", y: "64%" },
      { action: "hover", label: "history", x: "71%", y: "66%" },
      { action: "click", label: "next step", x: "75%", y: "86%" }
    ],
    marketplace: [
      { action: "hover", label: "listing", x: "31%", y: "64%" },
      { action: "click", label: "price", x: "42%", y: "81%" },
      { action: "hover", label: "trust", x: "78%", y: "68%" }
    ],
    rewards: [
      { action: "hover", label: "points", x: "31%", y: "61%" },
      { action: "drag", label: "streak", x: "78%", y: "69%" },
      { action: "click", label: "badges", x: "80%", y: "86%" }
    ],
    roles: [
      { action: "hover", label: "shopper", x: "22%", y: "66%" },
      { action: "hover", label: "creator", x: "44%", y: "66%" },
      { action: "click", label: "governance", x: "78%", y: "69%" }
    ]
  };

  return cursorStateMap[chapterId][beatIndex] ?? fallbackCursorState;
}

function getInfoTabIdForPlayback(chapterId: PreviewSceneId, beatIndex: number, isOverviewBeat: boolean): DemoInfoTabId {
  if (chapterId === "dashboard") {
    if (isOverviewBeat || beatIndex === 0) {
      return "overview";
    }

    if (beatIndex === 1) {
      return "analytics";
    }

    return "settings";
  }

  if (chapterId === "scan") {
    return "features";
  }

  if (chapterId === "passport") {
    return "passport";
  }

  if (chapterId === "rewards") {
    return "rewards";
  }

  return "more-info";
}

function getActiveFeatureDockIds(chapterId: PreviewSceneId, beatIndex: number, isOverviewBeat: boolean) {
  if (isOverviewBeat) {
    return ["dashboard", "search", "camera", "passport", "rewards", "notifications", "analytics", "settings", "messaging", "profile"];
  }

  switch (chapterId) {
    case "dashboard":
      return beatIndex === 1
        ? ["dashboard", "search", "analytics", "passport"]
        : beatIndex === 2
          ? ["messaging", "notifications", "settings", "profile"]
          : ["dashboard", "search", "notifications"];
    case "scan":
      return ["camera", "search", "passport"];
    case "passport":
      return ["passport", "search"];
    case "wardrobe":
      return ["profile", "passport"];
    case "marketplace":
      return ["passport", "profile", "notifications"];
    case "rewards":
      return ["rewards", "notifications", "profile"];
    case "roles":
      return ["profile", "dashboard", "settings"];
    default:
      return ["dashboard"];
  }
}

function formatDurationLabel(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function selectPreferredVoice(voices: SpeechSynthesisVoice[]) {
  if (voices.length === 0) {
    return null;
  }

  const sortedVoices = [...voices].sort((leftVoice, rightVoice) => scoreVoice(rightVoice) - scoreVoice(leftVoice));
  return sortedVoices[0] ?? null;
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  let score = 0;
  const descriptor = `${voice.name} ${voice.lang}`;

  if (/en(-|_)?/i.test(voice.lang)) {
    score += 6;
  }

  for (const pattern of NARRATOR_VOICE_PATTERNS) {
    if (pattern.test(descriptor)) {
      score += 12;
      break;
    }
  }

  if (/female|woman|girl/i.test(descriptor)) {
    score += 4;
  }

  if (/natural|neural|enhanced|premium/i.test(descriptor)) {
    score += 3;
  }

  if (voice.default) {
    score += 1;
  }

  return score;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNowMs() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}
