"use client";

import * as React from "react";
import { Player, type PlayerRef } from "@remotion/player";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Camera,
  ChevronRight,
  LayoutDashboard,
  Maximize2,
  MessageSquare,
  Minimize2,
  MousePointer2,
  Pause,
  Play,
  QrCode,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  Trophy,
  UserCircle2,
  Volume2,
  VolumeX
} from "lucide-react";
import { usePlatform } from "@/components/platform-state";
import { formatCurrency } from "@/lib/format";

type DemoPreviewRemotionPlayerProps = {
  onOpenRoles: () => void;
};

type VideoSceneId = "dashboard" | "scan" | "passport" | "wardrobe" | "marketplace" | "rewards" | "roles";
type ChapterViewId = "overview" | "features" | "passport" | "rewards" | "analytics" | "roles" | "settings";
type RoleClipId = "consumer" | "brand" | "supplier" | "admin";
type DockFeatureId =
  | "dashboard"
  | "search"
  | "camera"
  | "passport"
  | "rewards"
  | "notifications"
  | "analytics"
  | "settings"
  | "messaging"
  | "profile";

type PreviewData = {
  authenticity: string;
  brandName: string;
  careInstructions: string;
  circularityScore: number;
  complianceReadiness: number;
  enterpriseReadiness: number;
  imageUrl: string;
  impactPoints: number;
  inventoryCount: number;
  listingPrice: number;
  materials: string[];
  passportCoveragePercent: number;
  passportId: string;
  productName: string;
  qrCode: string;
  repairCount: number;
  resaleValueEstimate: number;
  sellerName: string;
  streakDays: number;
  supplierRiskAverage: number;
  takeBackProgram: string;
  themeMode: "light" | "dark";
  trustCenterScore: number;
  unlockedRewardCount: number;
  soundEnabled: boolean;
};

type VideoScene = {
  accent: string;
  audioSrc: string;
  description: string;
  dockIds: DockFeatureId[];
  durationInFrames: number;
  eyebrow: string;
  headline: string;
  id: VideoSceneId;
  sceneLabel: string;
  theme: "dark" | "light";
};

type FeatureDockItem = {
  chapterId: ChapterViewId;
  clipEndFrame: number;
  clipLabel: string;
  frame: number;
  icon: React.ComponentType<{ className?: string }>;
  id: DockFeatureId;
  label: string;
};

type ChapterViewItem = {
  clipEndFrame: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  id: ChapterViewId;
  linkedFrame: number;
  metrics: Array<{ label: string; value: string }>;
  points: string[];
  title: string;
};

type RoleClipItem = {
  clipEndFrame: number;
  description: string;
  frame: number;
  icon: React.ComponentType<{ className?: string }>;
  id: RoleClipId;
  statLabel: string;
  statValue: string;
  title: string;
};

type PreviewPlaybackMode = "full-tour" | "feature-clip" | "role-clip";

type InteractionCue = {
  frame: number;
  label: string;
  sound: "click" | "hover" | "confirm" | "scan";
  x: number;
  y: number;
};

const VIDEO_FPS = 30;
const VIDEO_WIDTH = 1600;
const VIDEO_HEIGHT = 900;
const VIDEO_SCENE_DURATIONS: Record<VideoSceneId, number> = {
  dashboard: 1035,
  scan: 845,
  passport: 940,
  wardrobe: 875,
  marketplace: 914,
  rewards: 865,
  roles: 1148
};

const videoScenes: VideoScene[] = [
  {
    accent: "from-forest-400 via-sage-300 to-sage-100",
    audioSrc: "/audio/demo-preview/dashboard.wav?v=2026-04-24-l",
    description: "Cards, analytics, search, messages, notifications, settings, and profile stay visible in one polished command center.",
    dockIds: ["dashboard", "search", "analytics", "notifications", "messaging", "settings", "profile"],
    durationInFrames: VIDEO_SCENE_DURATIONS.dashboard,
    eyebrow: "Overview",
    headline: "Everything in one place",
    id: "dashboard",
    sceneLabel: "Command center",
    theme: "dark"
  },
  {
    accent: "from-emerald-400 via-green-300 to-sage-100",
    audioSrc: "/audio/demo-preview/scan.wav?v=2026-04-24-l",
    description: "Camera scan, QR, search, and live matching make any garment feel like a smart digital asset.",
    dockIds: ["camera", "search", "passport"],
    durationInFrames: VIDEO_SCENE_DURATIONS.scan,
    eyebrow: "Features",
    headline: "Scan any clothing item",
    id: "scan",
    sceneLabel: "Camera + search",
    theme: "dark"
  },
  {
    accent: "from-forest-400 via-sage-300 to-emerald-200",
    audioSrc: "/audio/demo-preview/passport.wav?v=2026-04-24-l",
    description: "The Digital Product Passport makes materials, care, repair, resale, authenticity, and take-back easy to understand.",
    dockIds: ["passport", "search"],
    durationInFrames: VIDEO_SCENE_DURATIONS.passport,
    eyebrow: "Passport",
    headline: "See the verified product story",
    id: "passport",
    sceneLabel: "Digital passport",
    theme: "light"
  },
  {
    accent: "from-emerald-300 via-sage-200 to-sand-100",
    audioSrc: "/audio/demo-preview/wardrobe.wav?v=2026-04-24-l",
    description: "Wardrobe tracking keeps ownership, value, repair history, and next steps together after the first scan.",
    dockIds: ["profile", "passport", "notifications"],
    durationInFrames: VIDEO_SCENE_DURATIONS.wardrobe,
    eyebrow: "Wardrobe",
    headline: "Track the item after purchase",
    id: "wardrobe",
    sceneLabel: "Wardrobe history",
    theme: "dark"
  },
  {
    accent: "from-forest-400 via-emerald-300 to-sage-200",
    audioSrc: "/audio/demo-preview/marketplace.wav?v=2026-04-24-l",
    description: "Marketplace trust is built in with pricing, provenance, and authenticity attached to every listing.",
    dockIds: ["passport", "analytics", "profile"],
    durationInFrames: VIDEO_SCENE_DURATIONS.marketplace,
    eyebrow: "Marketplace",
    headline: "Resale with proof attached",
    id: "marketplace",
    sceneLabel: "Trusted resale",
    theme: "light"
  },
  {
    accent: "from-emerald-400 via-sage-300 to-forest-200",
    audioSrc: "/audio/demo-preview/rewards.wav?v=2026-04-24-l",
    description: "Rewards make transparency addictive with Impact Points™, streaks, badges, and challenge loops.",
    dockIds: ["rewards", "notifications", "profile"],
    durationInFrames: VIDEO_SCENE_DURATIONS.rewards,
    eyebrow: "Rewards",
    headline: "Reward the good move instantly",
    id: "rewards",
    sceneLabel: "Retention loop",
    theme: "dark"
  },
  {
    accent: "from-sage-400 via-sage-200 to-sand-100",
    audioSrc: "/audio/demo-preview/roles.wav?v=2026-04-24-l",
    description: "Consumer, brand, supplier, and admin views all work on the same source of truth.",
    dockIds: ["profile", "dashboard", "settings", "analytics"],
    durationInFrames: VIDEO_SCENE_DURATIONS.roles,
    eyebrow: "Roles",
    headline: "One platform for every role",
    id: "roles",
    sceneLabel: "Role-aware UI",
    theme: "light"
  }
];

const videoSceneStartFrames = videoScenes.reduce<Record<VideoSceneId, number>>((acc, scene, index) => {
  if (index === 0) {
    acc[scene.id] = 0;
    return acc;
  }

  const previous = videoScenes[index - 1];
  acc[scene.id] = (acc[previous.id] ?? 0) + previous.durationInFrames;
  return acc;
}, {} as Record<VideoSceneId, number>);

const totalVideoDurationInFrames = videoScenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);

const chapterViewOrder: ChapterViewId[] = ["overview", "features", "passport", "rewards", "analytics", "roles", "settings"];

const interactionCueMap: Record<VideoSceneId, InteractionCue[]> = {
  dashboard: [
    { frame: 86, label: "Open search", sound: "hover", x: 32, y: 16 },
    { frame: 226, label: "Focus analytics", sound: "click", x: 49, y: 40 },
    { frame: 438, label: "Open inbox", sound: "click", x: 86, y: 48 },
    { frame: 574, label: "Adjust settings", sound: "confirm", x: 88, y: 74 }
  ],
  scan: [
    { frame: 72, label: "Start scan", sound: "scan", x: 24, y: 38 },
    { frame: 212, label: "Match item", sound: "confirm", x: 26, y: 66 },
    { frame: 368, label: "Open passport", sound: "click", x: 75, y: 27 }
  ],
  passport: [
    { frame: 90, label: "Read materials", sound: "hover", x: 68, y: 33 },
    { frame: 258, label: "Check care", sound: "click", x: 73, y: 69 },
    { frame: 434, label: "Review recovery", sound: "confirm", x: 75, y: 84 }
  ],
  wardrobe: [
    { frame: 94, label: "Save item", sound: "confirm", x: 26, y: 30 },
    { frame: 260, label: "Track history", sound: "click", x: 72, y: 49 },
    { frame: 430, label: "Choose next step", sound: "hover", x: 71, y: 76 }
  ],
  marketplace: [
    { frame: 94, label: "Open listing", sound: "click", x: 31, y: 36 },
    { frame: 268, label: "Verify trust", sound: "confirm", x: 31, y: 78 },
    { frame: 416, label: "Review buyer detail", sound: "hover", x: 74, y: 37 }
  ],
  rewards: [
    { frame: 80, label: "Earn points", sound: "confirm", x: 28, y: 34 },
    { frame: 238, label: "Build streak", sound: "click", x: 68, y: 28 },
    { frame: 392, label: "Unlock badge", sound: "hover", x: 72, y: 80 }
  ],
  roles: [
    { frame: 117, label: "Consumer view", sound: "click", x: 64, y: 33 },
    { frame: 300, label: "Brand view", sound: "click", x: 84, y: 33 },
    { frame: 485, label: "Supplier view", sound: "click", x: 64, y: 74 },
    { frame: 663, label: "Admin view", sound: "confirm", x: 84, y: 74 }
  ]
};

const interactionSoundSources = {
  click: "/audio/demo-preview/ui-click.wav?v=2026-04-24-a",
  hover: "/audio/demo-preview/ui-hover.wav?v=2026-04-24-a",
  confirm: "/audio/demo-preview/ui-confirm.wav?v=2026-04-24-a",
  scan: "/audio/demo-preview/ui-scan.wav?v=2026-04-24-a"
} as const;

const dockFeatureMeta: Record<
  DockFeatureId,
  { icon: React.ComponentType<{ className?: string }>; label: string; shortLabel: string }
> = {
  analytics: { icon: BarChart3, label: "Analytics", shortLabel: "Analytics" },
  camera: { icon: Camera, label: "Camera scan", shortLabel: "Scan" },
  dashboard: { icon: LayoutDashboard, label: "Dashboard", shortLabel: "Dashboard" },
  messaging: { icon: MessageSquare, label: "Messaging", shortLabel: "Inbox" },
  notifications: { icon: Bell, label: "Notifications", shortLabel: "Alerts" },
  passport: { icon: ShieldCheck, label: "Passport", shortLabel: "Passport" },
  profile: { icon: UserCircle2, label: "Profile", shortLabel: "Profile" },
  rewards: { icon: Trophy, label: "Rewards", shortLabel: "Rewards" },
  search: { icon: Search, label: "Search", shortLabel: "Search" },
  settings: { icon: Settings2, label: "Settings", shortLabel: "Settings" }
};

export default function DemoPreviewRemotionPlayer({ onOpenRoles }: DemoPreviewRemotionPlayerProps) {
  const { bootstrap, impactPoints, rewards, streak, themeMode, soundEnabled } = usePlatform();
  const playerRef = React.useRef<PlayerRef | null>(null);
  const clipEndFrameRef = React.useRef<number | null>(null);
  const [playerMounted, setPlayerMounted] = React.useState(false);
  const [currentFrame, setCurrentFrame] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackMode, setPlaybackMode] = React.useState<PreviewPlaybackMode>("full-tour");
  const [activePlaybackLabel, setActivePlaybackLabel] = React.useState("Full platform tour");
  const [selectedChapterId, setSelectedChapterId] = React.useState<ChapterViewId>("overview");
  const [selectedRoleClipId, setSelectedRoleClipId] = React.useState<RoleClipId>("consumer");

  const previewData = React.useMemo<PreviewData>(() => {
    const featuredListing = bootstrap?.marketplace?.[0] ?? null;
    const wardrobeItem = bootstrap?.user?.wardrobe?.[0] ?? null;
    const passport = featuredListing?.passport ?? featuredListing?.product.passport ?? null;
    const product = featuredListing?.product ?? passport?.product ?? null;
    const unlockedRewards = rewards.filter((reward) => reward.unlocked);

    return {
      authenticity: passport?.passportStatus?.replaceAll("_", " ") ?? "Verified authentic",
      brandName: passport?.brand?.name ?? product?.brand.name ?? "Eterna Loom",
      careInstructions:
        passport?.careInstructions ??
        "Spot clean between wears, steam low, and wash only when needed to protect structure and finish.",
      circularityScore: passport?.circularityScore ?? 95,
      complianceReadiness: 92,
      enterpriseReadiness: 91,
      imageUrl: featuredListing?.imageUrl ?? product?.imageUrl ?? "/circular-finder/circular-finder/images/trench.svg",
      impactPoints,
      inventoryCount: bootstrap?.user?.insights?.inventoryCount ?? 3,
      listingPrice: featuredListing?.price ?? 280,
      materials:
        passport?.materialComposition?.length && passport.materialComposition.length > 0
          ? passport.materialComposition
          : ["Organic Cotton 78%", "TENCEL Lyocell 22%"],
      passportCoveragePercent: 96,
      passportId: passport?.passportId ?? "DPP-EL-TRN-001",
      productName: product?.name ?? "Sage Meridian Trench",
      qrCode: passport?.qrCode ?? "QR-EL-TRN-001",
      repairCount: wardrobeItem?.repairCount ?? 1,
      resaleValueEstimate: passport?.resaleValueEstimate ?? 210,
      sellerName: featuredListing?.seller.name ?? "Studio House 01",
      streakDays: streak.days,
      supplierRiskAverage: 18,
      takeBackProgram:
        passport?.takeBackProgram ??
        "Return through the brand take-back network for repair credit, authenticated resale, or material recovery.",
      themeMode,
      trustCenterScore: 94,
      unlockedRewardCount: unlockedRewards.length,
      soundEnabled
    };
  }, [bootstrap, impactPoints, rewards, soundEnabled, streak.days, themeMode]);

  const isDarkTheme = themeMode === "dark";
  const sectionClassName = isDarkTheme
    ? "overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,_rgba(24,30,34,0.98),_rgba(16,22,26,0.96))] text-white shadow-shell"
    : "overflow-hidden rounded-[2rem] border border-forest-200/80 bg-[linear-gradient(180deg,_rgba(248,252,248,0.98),_rgba(234,242,235,0.96))] text-stone-900 shadow-shell";
  const chromePanelClassName = isDarkTheme
    ? "border-white/10 bg-white/6"
    : "border-forest-200/75 bg-white/75";
  const mutedLabelClassName = isDarkTheme ? "text-white/48" : "text-stone-500";
  const bodyTextClassName = isDarkTheme ? "text-white/84" : "text-stone-700";
  const primaryActionClassName = isDarkTheme
    ? "inline-flex items-center gap-2 rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-stone-950 shadow-soft transition hover:bg-emerald-200"
    : "inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-soft transition hover:bg-forest-600";
  const secondaryActionClassName = isDarkTheme
    ? "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
    : "inline-flex items-center gap-2 rounded-full border border-forest-200/75 bg-white/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-stone-800 transition hover:bg-forest-50";
  const chapterPillBaseClassName = isDarkTheme
    ? "border-white/10 bg-white/6 text-white/72 hover:bg-white/10"
    : "border-forest-200/75 bg-white/80 text-stone-700 hover:bg-forest-50";
  const chapterPillActiveClassName = isDarkTheme
    ? "border-emerald-300/55 bg-emerald-300/16 text-white shadow-soft"
    : "border-forest-500/35 bg-forest-100 text-forest-900 shadow-soft";

  const chapterViewItems = React.useMemo<ChapterViewItem[]>(
    () => [
      {
        clipEndFrame: videoSceneStartFrames.dashboard + 210,
        description:
          "The video preview opens with the full command center so users immediately understand the platform at a glance.",
        icon: LayoutDashboard,
        id: "overview",
        linkedFrame: videoSceneStartFrames.dashboard,
        metrics: [
          { label: "Passport coverage", value: `${previewData.passportCoveragePercent}%` },
          { label: "Trust center", value: `${previewData.trustCenterScore}/100` },
          { label: "Unread signals", value: "19 live" }
        ],
        points: [
          "Dashboard cards, search, notifications, analytics, messaging, settings, and profile live in one premium view.",
          "The interface stays spacious and readable while still showing the depth of the product.",
          "This is the investor-ready first impression of the platform."
        ],
        title: "Overview"
      },
      {
        clipEndFrame: videoSceneStartFrames.scan + 360,
        description:
          "The features chapter covers the live ways people enter and navigate the system: camera scan, QR, search, notifications, and messaging.",
        icon: Camera,
        id: "features",
        linkedFrame: videoSceneStartFrames.scan,
        metrics: [
          { label: "Scan inputs", value: "4 methods" },
          { label: "Primary code", value: previewData.qrCode },
          { label: "Matched item", value: previewData.productName }
        ],
        points: [
          "Camera scan, QR, barcode, and search all lead to the same verified passport.",
          "Notifications and messaging keep people informed without cluttering the main product view.",
          "The UI stays visual, clear, and easy to recognize at a glance."
        ],
        title: "Features"
      },
      {
        clipEndFrame: videoSceneStartFrames.passport + 420,
        description:
          "The passport chapter shows how the app explains the full product story in one clear Digital Product Passport.",
        icon: ShieldCheck,
        id: "passport",
        linkedFrame: videoSceneStartFrames.passport,
        metrics: [
          { label: "Circularity", value: `${previewData.circularityScore}/100` },
          { label: "Authenticity", value: previewData.authenticity },
          { label: "Resale value", value: formatCurrency(previewData.resaleValueEstimate) }
        ],
        points: [
          "Brand, materials, care, repair, origin, trust, and take-back all stay on one screen.",
          "The passport is designed to feel premium enough for consumers and credible enough for business teams.",
          "Every line in the preview matches the UI that is shown in the video."
        ],
        title: "Passport"
      },
      {
        clipEndFrame: videoSceneStartFrames.rewards + 355,
        description:
          "Rewards turn transparency into retention with points, badges, streaks, and challenges that make circular actions feel satisfying.",
        icon: Trophy,
        id: "rewards",
        linkedFrame: videoSceneStartFrames.rewards,
        metrics: [
          { label: "Impact Points™", value: previewData.impactPoints.toLocaleString() },
          { label: "Current streak", value: `${previewData.streakDays} days` },
          { label: "Unlocked badges", value: String(previewData.unlockedRewardCount) }
        ],
        points: [
          "People earn visible progress for scanning, repairing, reusing, and reselling.",
          "Badges and streaks make sustainable behavior feel active, social, and worth repeating.",
          "The video shows rewards UI only when the narration is talking about rewards."
        ],
        title: "Rewards"
      },
      {
        clipEndFrame: videoSceneStartFrames.dashboard + 470,
        description:
          "Analytics gives brands, operators, and investors a live picture of performance, supplier risk, trust, and enterprise readiness.",
        icon: BarChart3,
        id: "analytics",
        linkedFrame: videoSceneStartFrames.dashboard + 260,
        metrics: [
          { label: "Compliance", value: `${previewData.complianceReadiness}/100` },
          { label: "Enterprise", value: `${previewData.enterpriseReadiness}/100` },
          { label: "Supplier risk", value: `${previewData.supplierRiskAverage} avg` }
        ],
        points: [
          "Analytics, trust, and compliance are shown as clean modern cards instead of dense enterprise screens.",
          "The chart area is readable, high-contrast, and synchronized to the dashboard part of the video.",
          "This keeps the app feeling premium while still showing business depth."
        ],
        title: "Analytics"
      },
      {
        clipEndFrame: videoSceneStartFrames.roles + 560,
        description:
          "Roles show how the same system supports consumer, brand, supplier, and admin workflows without losing the shared source of truth.",
        icon: UserCircle2,
        id: "roles",
        linkedFrame: videoSceneStartFrames.roles,
        metrics: [
          { label: "Consumer", value: "Scan + rewards" },
          { label: "Brand", value: "Governance + growth" },
          { label: "Admin", value: "Trust + control" }
        ],
        points: [
          "Consumer, brand, supplier, and admin are shown as sleek role surfaces in the same family of UI.",
          "The role system still feels unified because the same passport layer powers everything.",
          "This helps users understand the platform scale from one preview."
        ],
        title: "Roles"
      },
      {
        clipEndFrame: videoSceneStartFrames.dashboard + 790,
        description:
          "Settings keeps the platform operational with privacy, trust rules, governance, and responsive controls built right into the experience.",
        icon: Settings2,
        id: "settings",
        linkedFrame: videoSceneStartFrames.dashboard + 520,
        metrics: [
          { label: "Trust rules", value: "3 active" },
          { label: "Sync status", value: "Live" },
          { label: "Responsive", value: "Desktop + mobile" }
        ],
        points: [
          "Settings appears where the narration talks about controls, privacy, and system management.",
          "The UI keeps strong contrast and clean spacing so settings feel premium, not intimidating.",
          "It supports the product-commercial feel without sacrificing clarity."
        ],
        title: "Settings"
      }
    ],
    [previewData]
  );

  const featureDockItems = React.useMemo<FeatureDockItem[]>(
    () => [
      { chapterId: "overview", clipEndFrame: videoSceneStartFrames.dashboard + 174, clipLabel: "Dashboard overview clip", frame: videoSceneStartFrames.dashboard + 24, icon: LayoutDashboard, id: "dashboard", label: "Dashboard" },
      { chapterId: "features", clipEndFrame: videoSceneStartFrames.scan + 250, clipLabel: "Search clip", frame: videoSceneStartFrames.scan + 70, icon: Search, id: "search", label: "Search" },
      { chapterId: "features", clipEndFrame: videoSceneStartFrames.scan + 240, clipLabel: "Camera scan clip", frame: videoSceneStartFrames.scan + 90, icon: Camera, id: "camera", label: "Camera scan" },
      { chapterId: "passport", clipEndFrame: videoSceneStartFrames.passport + 250, clipLabel: "Passport clip", frame: videoSceneStartFrames.passport + 70, icon: ShieldCheck, id: "passport", label: "Passport" },
      { chapterId: "rewards", clipEndFrame: videoSceneStartFrames.rewards + 240, clipLabel: "Rewards clip", frame: videoSceneStartFrames.rewards + 60, icon: Trophy, id: "rewards", label: "Rewards" },
      { chapterId: "features", clipEndFrame: videoSceneStartFrames.dashboard + 650, clipLabel: "Notifications clip", frame: videoSceneStartFrames.dashboard + 500, icon: Bell, id: "notifications", label: "Notifications" },
      { chapterId: "analytics", clipEndFrame: videoSceneStartFrames.dashboard + 430, clipLabel: "Analytics clip", frame: videoSceneStartFrames.dashboard + 280, icon: BarChart3, id: "analytics", label: "Analytics" },
      { chapterId: "settings", clipEndFrame: videoSceneStartFrames.dashboard + 710, clipLabel: "Settings clip", frame: videoSceneStartFrames.dashboard + 560, icon: Settings2, id: "settings", label: "Settings" },
      { chapterId: "features", clipEndFrame: videoSceneStartFrames.dashboard + 620, clipLabel: "Messaging clip", frame: videoSceneStartFrames.dashboard + 470, icon: MessageSquare, id: "messaging", label: "Messaging" },
      { chapterId: "roles", clipEndFrame: videoSceneStartFrames.roles + 341, clipLabel: "Profile clip", frame: videoSceneStartFrames.roles + 146, icon: UserCircle2, id: "profile", label: "Profile" }
    ],
    []
  );

  const roleClipItems = React.useMemo<RoleClipItem[]>(
    () => [
      {
        clipEndFrame: videoSceneStartFrames.roles + 268,
        description: "Show how everyday users scan, verify, save items, and earn rewards without friction.",
        frame: videoSceneStartFrames.roles + 85,
        icon: UserCircle2,
        id: "consumer",
        statLabel: "Best for",
        statValue: "Scanning + rewards",
        title: "Consumer"
      },
      {
        clipEndFrame: videoSceneStartFrames.roles + 475,
        description: "Show the brand view for claims, performance, trusted listings, and product storytelling.",
        frame: videoSceneStartFrames.roles + 268,
        icon: LayoutDashboard,
        id: "brand",
        statLabel: "Best for",
        statValue: "Growth + governance",
        title: "Brand"
      },
      {
        clipEndFrame: videoSceneStartFrames.roles + 683,
        description: "Show supplier proof for origin, materials, and compliance details feeding the same passport layer.",
        frame: videoSceneStartFrames.roles + 463,
        icon: Store,
        id: "supplier",
        statLabel: "Best for",
        statValue: "Origin + compliance",
        title: "Supplier"
      },
      {
        clipEndFrame: videoSceneStartFrames.roles + 927,
        description: "Show the admin experience for trust rules, policy controls, and recovery workflows.",
        frame: videoSceneStartFrames.roles + 658,
        icon: Settings2,
        id: "admin",
        statLabel: "Best for",
        statValue: "Policy + recovery",
        title: "Admin"
      }
    ],
    []
  );

  const selectedChapter = chapterViewItems.find((item) => item.id === selectedChapterId) ?? chapterViewItems[0];
  const selectedRoleClip = roleClipItems.find((item) => item.id === selectedRoleClipId) ?? roleClipItems[0];
  const activeScene = getActiveSceneForFrame(currentFrame);
  const activeDockId = getActiveDockIdForFrame(currentFrame);

  const handlePlayerRef = React.useCallback((node: PlayerRef | null) => {
    playerRef.current = node;
    setPlayerMounted(Boolean(node));
  }, []);

  React.useEffect(() => {
    const player = playerRef.current;

    if (!playerMounted || !player) {
      return;
    }

    const onPlay = () => {
      setHasStarted(true);
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onEnded = () => {
      clipEndFrameRef.current = null;
      setHasStarted(false);
      setIsPlaying(false);
      setPlaybackMode("full-tour");
      setActivePlaybackLabel("Full platform tour");
      setCurrentFrame(0);
      player.pauseAndReturnToPlayStart();
    };

    const onFrameUpdate = (event: { detail: { frame: number } }) => {
      const nextFrame = event.detail.frame;
      setCurrentFrame(nextFrame);

      if (clipEndFrameRef.current !== null && nextFrame >= clipEndFrameRef.current) {
        const clipEndFrame = clipEndFrameRef.current;
        clipEndFrameRef.current = null;
        player.pause();
        player.seekTo(clipEndFrame);
        setCurrentFrame(clipEndFrame);
        setIsPlaying(false);
      }
    };

    const onFullscreenChange = (event: { detail: { isFullscreen: boolean } }) => {
      setIsFullscreen(event.detail.isFullscreen);
    };

    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);
    player.addEventListener("frameupdate", onFrameUpdate);
    player.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
      player.removeEventListener("frameupdate", onFrameUpdate);
      player.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [playerMounted]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);

      if (isTypingTarget || event.code !== "Space" || event.repeat) {
        return;
      }

      event.preventDefault();
      playerRef.current?.toggle();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handlePlayPause = React.useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    clipEndFrameRef.current = null;
    setPlaybackMode("full-tour");
    setActivePlaybackLabel("Full platform tour");
    setHasStarted(true);
    if (isPlaying) {
      player.pause();
      return;
    }

    if (currentFrame === 0) {
      player.seekTo(0);
    }

    player.play();
  }, [currentFrame, isPlaying]);

  const handleReplay = React.useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    clipEndFrameRef.current = null;
    setPlaybackMode("full-tour");
    setActivePlaybackLabel("Full platform tour");
    setHasStarted(true);
    player.seekTo(0);
    player.play();
  }, []);

  const handleClosePreview = React.useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    clipEndFrameRef.current = null;
    player.pauseAndReturnToPlayStart();
    setHasStarted(false);
    setPlaybackMode("full-tour");
    setActivePlaybackLabel("Full platform tour");
    setCurrentFrame(0);
  }, []);

  const handleMuteToggle = React.useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.isMuted()) {
      player.unmute();
      setIsMuted(false);
      return;
    }

    player.mute();
    setIsMuted(true);
  }, []);

  const handleFullscreenToggle = React.useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.isFullscreen()) {
      player.exitFullscreen();
      return;
    }

    player.requestFullscreen();
  }, []);

  const handlePlayClip = React.useCallback(
    (
      frame: number,
      clipEndFrame: number,
      options?: {
        chapterId?: ChapterViewId;
        label?: string;
        mode?: PreviewPlaybackMode;
        roleId?: RoleClipId;
      }
    ) => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      if (options?.chapterId) {
        setSelectedChapterId(options.chapterId);
      }

      if (options?.roleId) {
        setSelectedRoleClipId(options.roleId);
      }

      setPlaybackMode(options?.mode ?? "feature-clip");
      setActivePlaybackLabel(options?.label ?? "Feature clip");
      clipEndFrameRef.current = clipEndFrame;
      setHasStarted(true);
      player.pause();
      player.seekTo(frame);
      setCurrentFrame(frame);
      window.requestAnimationFrame(() => {
        playerRef.current?.play();
      });
    },
    []
  );

  const handleShowInVideoView = React.useCallback((frame: number, chapterId?: ChapterViewId) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (chapterId) {
      setSelectedChapterId(chapterId);
      const chapter = chapterViewItems.find((item) => item.id === chapterId);
      if (chapter) {
        setActivePlaybackLabel(`${chapter.title} feature clip`);
        setPlaybackMode("feature-clip");
      }
    }

    clipEndFrameRef.current = null;
    setHasStarted(true);
    player.pause();
    player.seekTo(frame);
    setCurrentFrame(frame);
  }, [chapterViewItems]);

  const handlePlayRoleClip = React.useCallback((clip: RoleClipItem) => {
    handlePlayClip(clip.frame, clip.clipEndFrame, {
      chapterId: "roles",
      label: `${clip.title} role clip`,
      mode: "role-clip",
      roleId: clip.id
    });
  }, [handlePlayClip]);

  const playbackModeLabel =
    playbackMode === "role-clip" ? "Role clip" : playbackMode === "feature-clip" ? "Feature clip" : "Full video";

  return (
    <section className={`${sectionClassName} demo-preview-shell demo-preview-shell-${themeMode}`}>
      <div className={["border-b px-4 py-4 sm:px-5", chromePanelClassName].join(" ")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={["text-[11px] uppercase tracking-[0.18em]", mutedLabelClassName].join(" ")}>Video view</p>
            <p className={["mt-1 text-sm leading-7", bodyTextClassName].join(" ")}>One clean video shows the full platform. The chapters below play one focused feature at a time.</p>
          </div>
          <span
            className={[
              "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isDarkTheme ? "bg-white/10 text-white/68" : "bg-forest-100 text-forest-900"
            ].join(" ")}
          >
            Remotion video player
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className={["rounded-[1.75rem] border p-3 shadow-soft backdrop-blur xl:p-4", chromePanelClassName].join(" ")}>
          <div
            className={[
              "relative overflow-hidden rounded-[1.45rem] border shadow-[0_32px_90px_rgba(0,0,0,0.18)]",
              isDarkTheme ? "border-white/10 bg-[#181f22]" : "border-forest-200/70 bg-white"
            ].join(" ")}
          >
            <div className="aspect-video">
              <Player
                ref={handlePlayerRef}
                component={DemoPreviewVideoComposition}
                inputProps={{ data: previewData }}
                durationInFrames={totalVideoDurationInFrames}
                compositionHeight={VIDEO_HEIGHT}
                compositionWidth={VIDEO_WIDTH}
                fps={VIDEO_FPS}
                controls={false}
                clickToPlay
                allowFullscreen
                spaceKeyToPlayOrPause={false}
                showPosterWhenEnded
                showPosterWhenUnplayed
                posterFillMode="player-size"
                numberOfSharedAudioTags={18}
                style={{ height: "100%", width: "100%" }}
                className="h-full w-full"
                acknowledgeRemotionLicense
                renderPoster={() => <DemoPreviewPoster data={previewData} />}
              />
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 sm:p-5">
              <div className="pointer-events-auto rounded-full border border-white/12 bg-black/42 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-soft backdrop-blur">
                {activeScene.eyebrow} • {activeScene.sceneLabel}
              </div>
              <div className="pointer-events-auto rounded-full border border-white/12 bg-black/42 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-soft backdrop-blur">
                {isPlaying ? "Playing" : hasStarted ? "Paused" : "Ready"}
              </div>
            </div>

            {hasStarted ? (
              <div className="absolute inset-x-4 bottom-4 z-10 flex justify-center sm:inset-x-5">
                <div className="max-w-full overflow-x-auto rounded-[1.2rem] border border-white/12 bg-black/48 px-2 py-2 shadow-soft backdrop-blur-xl">
                  <div className="flex min-w-max gap-2">
                    {featureDockItems.map((item) => {
                      const DockIcon = item.icon;
                      const isActive = item.id === activeDockId;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handlePlayClip(item.frame, item.clipEndFrame, {
                              chapterId: item.chapterId,
                              label: item.clipLabel,
                              mode: "feature-clip"
                            })
                          }
                          className={[
                            "inline-flex items-center gap-2 rounded-[1rem] border px-3 py-2.5 text-sm font-semibold transition",
                            isActive
                              ? isDarkTheme
                                ? "border-emerald-300/55 bg-emerald-300/18 text-white shadow-soft"
                                : "border-forest-500/35 bg-forest-100 text-forest-900 shadow-soft"
                              : isDarkTheme
                                ? "border-white/10 bg-white/6 text-white/72 hover:bg-white/10"
                                : "border-forest-200/75 bg-white/80 text-stone-700 hover:bg-forest-50"
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex h-8 w-8 items-center justify-center rounded-[0.85rem]",
                              isActive
                                ? isDarkTheme
                                  ? "bg-white text-stone-950"
                                  : "bg-forest-700 text-white"
                                : isDarkTheme
                                  ? "bg-white/10 text-white/78"
                                  : "bg-forest-50 text-forest-700"
                            ].join(" ")}
                          >
                            <DockIcon className="h-4 w-4" />
                          </span>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePlayPause}
              className={primaryActionClassName}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause video" : currentFrame > 0 && playbackMode === "full-tour" ? "Resume video" : "Play full tour"}
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className={secondaryActionClassName}
            >
              <Play className="h-4 w-4" />
              Replay
            </button>
            <button
              type="button"
              onClick={handleMuteToggle}
              className={secondaryActionClassName}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isMuted ? "Audio off" : "Audio on"}
            </button>
            <button
              type="button"
              onClick={handleFullscreenToggle}
              className={secondaryActionClassName}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </button>
            <button
              type="button"
              onClick={handleClosePreview}
              className={secondaryActionClassName}
            >
              Close preview
            </button>
            <button
              type="button"
              onClick={onOpenRoles}
              className={[
                "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition sm:ml-auto",
                isDarkTheme ? "bg-white text-stone-950 hover:bg-sand-50" : "bg-forest-900 text-white hover:bg-forest-800"
              ].join(" ")}
            >
              Open live app
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className={["mt-4 rounded-[1.25rem] border px-4 py-4 shadow-soft", isDarkTheme ? "border-white/10 bg-[linear-gradient(180deg,_rgba(20,28,31,0.92),_rgba(29,36,39,0.86))] text-white" : "border-forest-200/75 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(236,244,237,0.95))] text-stone-900"].join(" ")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={["text-[11px] uppercase tracking-[0.18em]", mutedLabelClassName].join(" ")}>Now showing</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className={["text-[1.4rem] font-semibold tracking-tight", isDarkTheme ? "text-white" : "text-stone-900"].join(" ")}>{activePlaybackLabel}</p>
                  <span className={["rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", isDarkTheme ? "bg-white/10 text-white/70" : "bg-forest-100 text-forest-900"].join(" ")}>{playbackModeLabel}</span>
                  <span className={["rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", isDarkTheme ? "bg-white/10 text-white/70" : "bg-forest-100 text-forest-900"].join(" ")}>{activeScene.eyebrow}</span>
                </div>
                <p className={["mt-2 text-sm leading-7", bodyTextClassName].join(" ")}>{activeScene.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Full tour", value: "Everything in one flow" },
                  { label: "Feature clips", value: "One tool at a time" },
                  { label: "Role clips", value: "Consumer to Admin" }
                ].map((item) => (
                  <div key={item.label} className={["rounded-full border px-3 py-2 text-xs font-semibold", chapterPillBaseClassName].join(" ")}>
                    <span className="uppercase tracking-[0.16em]">{item.label}</span>
                    <span className={["ml-2 font-medium normal-case tracking-normal", mutedLabelClassName].join(" ")}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={["mt-6 rounded-[1.75rem] border p-4 shadow-soft backdrop-blur xl:p-5", chromePanelClassName].join(" ")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={["text-[11px] uppercase tracking-[0.18em]", mutedLabelClassName].join(" ")}>Chapter view</p>
              <p className={["mt-2 max-w-3xl text-sm leading-7", bodyTextClassName].join(" ")}>Use role clips for audience-specific previews, then feature chapters for short videos that match the UI on screen.</p>
            </div>
            <span
              className={[
                "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                isDarkTheme ? "bg-white/8 text-white/65" : "bg-forest-100 text-forest-900"
              ].join(" ")}
            >
              One feature at a time
            </span>
          </div>

          <div
            className={[
              "mt-5 rounded-[1.35rem] border px-4 py-4 shadow-soft",
              isDarkTheme
                ? "border-white/10 bg-[linear-gradient(180deg,_rgba(26,34,37,0.94),_rgba(18,24,27,0.88))]"
                : "border-forest-200/75 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,240,0.95))]"
            ].join(" ")}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={["text-[11px] uppercase tracking-[0.18em]", mutedLabelClassName].join(" ")}>Role clips</p>
                <p className={["mt-2 max-w-3xl text-sm leading-7", bodyTextClassName].join(" ")}>Same animation style, but one role at a time.</p>
              </div>
              <div className={["rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", isDarkTheme ? "bg-white/8 text-white/65" : "bg-forest-100 text-forest-900"].join(" ")}>
                Role-by-role view
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              {roleClipItems.map((clip) => {
                const RoleIcon = clip.icon;
                const isActive = selectedRoleClip.id === clip.id;

                return (
                  <button
                    key={clip.id}
                    type="button"
                    onClick={() => handlePlayRoleClip(clip)}
                    className={[
                      "rounded-[1.2rem] border px-4 py-4 text-left transition",
                      isActive
                        ? isDarkTheme
                          ? "border-emerald-300/55 bg-emerald-300/12 shadow-soft"
                          : "border-forest-500/35 bg-forest-100 shadow-soft"
                        : isDarkTheme
                          ? "border-white/10 bg-black/18 hover:bg-white/8"
                          : "border-forest-200/75 bg-white/85 hover:bg-forest-50"
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-gradient-to-br from-forest-400 via-sage-300 to-sage-100 text-stone-950">
                        <RoleIcon className="h-4 w-4" />
                      </div>
                      <span className={["rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", isDarkTheme ? "bg-white/8 text-white/68" : "bg-forest-100 text-forest-900"].join(" ")}>
                        Clip
                      </span>
                    </div>
                    <p className={["mt-4 text-lg font-semibold tracking-tight", isDarkTheme ? "text-white" : "text-stone-900"].join(" ")}>{clip.title}</p>
                    <p className={["mt-2 text-sm leading-6", bodyTextClassName].join(" ")}>{clip.statValue}</p>
                    <p className={["mt-3 text-xs leading-6", mutedLabelClassName].join(" ")}>{clip.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {chapterViewOrder.map((chapterId) => {
              const chapter = chapterViewItems.find((item) => item.id === chapterId)!;
              const ChapterIcon = chapter.icon;
              const isSelected = selectedChapter.id === chapter.id;

              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() =>
                    handlePlayClip(chapter.linkedFrame, chapter.clipEndFrame, {
                      chapterId: chapter.id,
                      label: `${chapter.title} feature clip`,
                      mode: "feature-clip"
                    })
                  }
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                    isSelected ? chapterPillActiveClassName : chapterPillBaseClassName
                  ].join(" ")}
                >
                  <ChapterIcon className="h-4 w-4" />
                  {chapter.title}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
            <div
              className={[
                "rounded-[1.35rem] border px-4 py-4 shadow-soft",
                isDarkTheme
                  ? "border-white/10 bg-[linear-gradient(180deg,_rgba(27,34,38,0.92),_rgba(38,45,49,0.86))] text-white"
                  : "border-forest-200/75 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(236,244,237,0.95))] text-stone-900"
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-gradient-to-br from-forest-400 via-sage-300 to-sage-100 text-stone-950 shadow-soft">
                  <selectedChapter.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className={["text-[11px] uppercase tracking-[0.18em]", mutedLabelClassName].join(" ")}>Selected chapter</p>
                  <p className={["mt-1 text-xl font-semibold tracking-tight", isDarkTheme ? "text-white" : "text-stone-900"].join(" ")}>{selectedChapter.title}</p>
                </div>
              </div>

              <p className={["mt-4 text-sm leading-7", bodyTextClassName].join(" ")}>{selectedChapter.description}</p>

              <div className="mt-4 grid gap-2">
                {selectedChapter.points.map((point) => (
                  <div key={point} className={["flex items-start gap-3 rounded-[1rem] border px-4 py-3 text-sm leading-7", chromePanelClassName, isDarkTheme ? "text-white/88" : "text-stone-700"].join(" ")}>
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handlePlayClip(selectedChapter.linkedFrame, selectedChapter.clipEndFrame, {
                      chapterId: selectedChapter.id,
                      label: `${selectedChapter.title} feature clip`,
                      mode: "feature-clip"
                    })
                  }
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                    isDarkTheme ? "bg-white text-stone-950 hover:bg-sand-50" : "bg-forest-700 text-white hover:bg-forest-600"
                  ].join(" ")}
                >
                  Play this chapter
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleShowInVideoView(selectedChapter.linkedFrame, selectedChapter.id)}
                  className={secondaryActionClassName}
                >
                  Show in video view
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {selectedChapter.metrics.map((metric) => (
                  <div key={metric.label} className={["rounded-[1.2rem] border px-4 py-4", chromePanelClassName].join(" ")}>
                    <p className={["text-[11px] uppercase tracking-[0.18em]", mutedLabelClassName].join(" ")}>{metric.label}</p>
                    <p className={["mt-3 text-sm font-semibold leading-6", isDarkTheme ? "text-white" : "text-stone-900"].join(" ")}>{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {chapterViewItems.map((chapter) => {
                  const ChapterIcon = chapter.icon;
                  const isActive = chapter.id === selectedChapter.id;

                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() =>
                        handlePlayClip(chapter.linkedFrame, chapter.clipEndFrame, {
                          chapterId: chapter.id,
                          label: `${chapter.title} feature clip`,
                          mode: "feature-clip"
                        })
                      }
                      className={[
                        "rounded-[1.2rem] border px-4 py-4 text-left transition",
                        isActive
                          ? isDarkTheme
                            ? "border-emerald-300/55 bg-emerald-300/12 shadow-soft"
                            : "border-forest-500/35 bg-forest-100 shadow-soft"
                          : isDarkTheme
                            ? "border-white/10 bg-black/18 hover:bg-white/8"
                            : "border-forest-200/75 bg-white/80 hover:bg-forest-50"
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-gradient-to-br from-forest-400 via-sage-300 to-sage-100 text-stone-950">
                          <ChapterIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={["text-[11px] uppercase tracking-[0.18em]", mutedLabelClassName].join(" ")}>{chapter.title}</p>
                          <p className={["mt-1 text-sm leading-6", isDarkTheme ? "text-white" : "text-stone-900"].join(" ")}>{chapter.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const DemoPreviewVideoComposition: React.FC<{ data: PreviewData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const scene = getActiveSceneForFrame(frame);
  const localFrame = frame - videoSceneStartFrames[scene.id];
  const sceneProgress = localFrame / scene.durationInFrames;
  const palette = getPreviewPalette(data.themeMode);
  const sceneFeatureItems = scene.dockIds.slice(0, 4).map((id) => dockFeatureMeta[id]);
  const reveal = spring({
    fps: VIDEO_FPS,
    frame: localFrame,
    config: {
      damping: 18,
      mass: 0.9,
      stiffness: 120
    }
  });
  const introCardOpacity = interpolate(localFrame, [0, 12, 78, 112], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.9, 0.22, 1)
  });
  const lowerThirdOpacity = interpolate(localFrame, [78, 118, scene.durationInFrames - 36, scene.durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.9, 0.22, 1)
  });
  const camera = getSceneCameraStyle(scene.id, localFrame, scene.durationInFrames);

  return (
    <AbsoluteFill
      style={{
        background: palette.stageBackground
      }}
    >
      {videoScenes.map((videoScene) => (
        <Sequence key={videoScene.id} from={videoSceneStartFrames[videoScene.id]} durationInFrames={videoScene.durationInFrames}>
          <Audio src={videoScene.audioSrc} />
        </Sequence>
      ))}
      {data.soundEnabled
        ? interactionCueMap[scene.id].map((cue) => (
            <Sequence key={`${scene.id}-${cue.label}`} from={videoSceneStartFrames[scene.id] + cue.frame} durationInFrames={Math.round(VIDEO_FPS * 0.4)}>
              <Audio src={interactionSoundSources[cue.sound]} volume={cue.sound === "hover" ? 0.04 : cue.sound === "click" ? 0.065 : cue.sound === "scan" ? 0.09 : 0.08} />
            </Sequence>
          ))
        : null}

      <AbsoluteFill style={{ padding: 24 }}>
        <div
          style={{
            position: "relative",
            flex: 1,
            overflow: "hidden",
            borderRadius: 34,
            border: palette.chromeBorder,
            background: palette.stageSurface,
            boxShadow: "0 38px 120px rgba(15, 23, 42, 0.26)"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 18,
              opacity: interpolate(reveal, [0, 1], [0, 1]),
              transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
              transformOrigin: "center center"
            }}
          >
            <AppWindowFrame scene={scene} localFrame={localFrame} sceneProgress={sceneProgress} data={data} />
          </div>

          <div
            style={{
              position: "absolute",
              top: 18,
              left: "50%",
              display: "flex",
              gap: 18,
              alignItems: "center",
              width: "fit-content",
              padding: "10px 16px",
              borderRadius: 999,
              border: palette.chromeBorder,
              background: palette.chromeSurface,
              backdropFilter: "blur(24px)",
              transform: "translateX(-50%)",
              opacity: lowerThirdOpacity
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: palette.accentStrong
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: palette.mutedInk
              }}
            >
              {scene.eyebrow} • {scene.sceneLabel}
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              padding: 30,
              pointerEvents: "none",
              opacity: introCardOpacity
            }}
          >
            <div
              style={{
                width: "min(560px, 100%)",
                padding: "22px 24px",
                borderRadius: 28,
                border: palette.chromeBorder,
                background: palette.chromeSurface,
                backdropFilter: "blur(28px)",
                boxShadow: data.themeMode === "light" ? "0 24px 80px rgba(15,23,42,0.12)" : "0 24px 80px rgba(0,0,0,0.28)",
                transform: `translateY(${interpolate(reveal, [0, 1], [18, 0])}px) scale(${interpolate(reveal, [0, 1], [0.97, 1])})`
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 999,
                  padding: "8px 14px",
                  background: palette.chipSurface
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: palette.accentStrong
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: palette.mutedInk
                  }}
                >
                  {scene.eyebrow}
                </span>
              </div>
              <h2
                style={{
                  margin: "16px 0 0",
                  fontSize: 46,
                  lineHeight: 0.96,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  color: palette.ink
                }}
              >
                {scene.headline}
              </h2>
              <p
                style={{
                  marginTop: 14,
                  maxWidth: 460,
                  fontSize: 18,
                  lineHeight: 1.5,
                  color: palette.secondaryInk
                }}
              >
                {scene.description}
              </p>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 20,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 18,
              pointerEvents: "none",
              opacity: lowerThirdOpacity
            }}
          >
            <div
              style={{
                maxWidth: 480,
                padding: "14px 16px",
                borderRadius: 22,
                border: palette.chromeBorder,
                background: palette.chromeSurface,
                backdropFilter: "blur(24px)"
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: palette.mutedInk
                }}
              >
                Full demo view
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  lineHeight: 1.04,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: palette.ink
                }}
              >
                {scene.headline}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  lineHeight: 1.45,
                  color: palette.secondaryInk
                }}
              >
                {scene.description}
              </div>
            </div>

            <div
              style={{
                flexShrink: 0,
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 999,
                border: palette.chromeBorder,
                background: palette.chromeSurface,
                backdropFilter: "blur(20px)"
              }}
            >
              {sceneFeatureItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 999,
                      background: palette.chipSurface,
                      color: palette.ink
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase"
                      }}
                    >
                      {item.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

function DemoPreviewPoster({ data }: { data: PreviewData }) {
  const palette = getPreviewPalette(data.themeMode);

  return (
    <div
      className={`demo-preview-skin demo-preview-skin-${data.themeMode} h-full w-full`}
      style={{ padding: 34 }}
    >
      <div
        className="flex h-full flex-col gap-5 rounded-[2rem] p-5 backdrop-blur"
        style={{
          background: palette.stageBackground,
          border: palette.chromeBorder
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ background: palette.chipSurface, border: palette.chromeBorder, color: palette.ink }}
          >
            Demo preview
          </div>
          <div
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ background: palette.chipSurface, border: palette.chromeBorder, color: palette.mutedInk }}
          >
            Click to play
          </div>
        </div>

        <div className="grid flex-1 gap-4 xl:grid-cols-[0.18fr_0.82fr]">
          <div className="rounded-[1.5rem] p-4" style={{ background: palette.chromeSurface, border: palette.chromeBorder }}>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: palette.mutedInk }}>What’s inside</p>
            <div className="mt-4 grid gap-2">
              {["dashboard", "search", "camera", "passport", "rewards", "analytics"].map((itemId) => {
                const item = dockFeatureMeta[itemId as DockFeatureId];
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-[1rem] px-3 py-2 text-sm font-semibold"
                    style={{ background: palette.chipSurface, border: palette.chromeBorder, color: palette.ink }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.8rem] p-4 shadow-soft" style={{ background: palette.appShell, border: palette.chromeBorder }}>
            <div className="flex items-center justify-between">
              <div className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ background: palette.chipSurface, border: palette.chromeBorder, color: palette.mutedInk }}>
                Circular Finder command center
              </div>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: data.themeMode === "dark" ? "#d9fbe7" : "#428452" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: data.themeMode === "dark" ? "#bbf7d0" : "#62a56f" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: data.themeMode === "dark" ? "#86efac" : "#8fc297" }} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[0.18fr_0.82fr]">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/6 p-3">
                <div className="grid gap-2">
                  {[
                    { icon: LayoutDashboard, label: "Dashboard" },
                    { icon: Search, label: "Search" },
                    { icon: Camera, label: "Scan" },
                    { icon: ShieldCheck, label: "Passport" },
                    { icon: Trophy, label: "Rewards" }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={[
                          "flex items-center gap-2 rounded-[1rem] border px-3 py-2.5",
                          index === 0 ? "border-emerald-300/45 bg-emerald-300/12 text-white" : "border-white/10 bg-white/6 text-white/68"
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Passport coverage", value: `${data.passportCoveragePercent}%` },
                    { label: "Trust center", value: `${data.trustCenterScore}/100` },
                    { label: "Impact Points™", value: data.impactPoints.toLocaleString() }
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{metric.label}</p>
                      <p className="mt-3 text-sm font-semibold text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 xl:grid-cols-[1.08fr_0.92fr]">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Preview headline</p>
                    <p className="mt-3 text-[1.8rem] font-semibold tracking-tight text-white">See the full Circular Finder app in one clean preview</p>
                    <p className="mt-3 text-sm leading-7 text-white/78">
                      Click to watch the full tour, then use the chapters below for shorter feature clips.
                    </p>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
                    <img src={data.imageUrl} alt={data.productName} className="aspect-[4/4.6] w-full rounded-[1.2rem] object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppWindowFrame({
  scene,
  localFrame,
  sceneProgress,
  data
}: {
  data: PreviewData;
  localFrame: number;
  scene: VideoScene;
  sceneProgress: number;
}) {
  const activeSidebarIds = scene.dockIds;
  const palette = getPreviewPalette(data.themeMode);
  const topBarPulse = interpolate(sceneProgress, [0, 0.45, 1], [0.8, 1, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div
      className={`demo-preview-skin demo-preview-skin-${data.themeMode} relative h-full rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.24)]`}
      style={{ border: palette.chromeBorder, background: palette.appShell }}
    >
      <div className="grid h-full grid-cols-[5.4rem_minmax(0,1fr)]">
        <div className="px-3 py-4" style={{ borderRight: palette.chromeBorder, background: palette.sidebar }}>
          <div className="flex h-full flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] shadow-soft" style={{ background: palette.sidebarBadge, color: palette.sidebarBadgeInk }}>
              <Sparkles className="h-5 w-5" />
            </div>
            {[
              { id: "dashboard", icon: LayoutDashboard },
              { id: "search", icon: Search },
              { id: "camera", icon: Camera },
              { id: "passport", icon: ShieldCheck },
              { id: "rewards", icon: Trophy },
              { id: "notifications", icon: Bell },
              { id: "analytics", icon: BarChart3 },
              { id: "settings", icon: Settings2 },
              { id: "messaging", icon: MessageSquare },
              { id: "profile", icon: UserCircle2 }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarIds.includes(item.id as DockFeatureId);
              return (
                <div
                  key={item.id}
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-[1rem] border transition-all",
                    isActive ? "text-white shadow-soft" : "text-white/70"
                  ].join(" ")}
                  style={{
                    borderColor: isActive ? palette.accentBorder : "rgba(255,255,255,0.1)",
                    background: isActive ? palette.sidebarActive : "rgba(255,255,255,0.06)",
                    transform: `scale(${isActive ? 1.04 : 1})`,
                    boxShadow: isActive ? palette.accentGlow : "none"
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
              );
            })}
            <div className="mt-auto flex h-11 w-11 items-center justify-center rounded-[1rem] border text-white/72" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)" }}>
              <UserCircle2 className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="grid h-full grid-rows-[5rem_minmax(0,1fr)]">
          <div
            className="px-5 py-4 backdrop-blur"
            style={{ borderBottom: palette.chromeBorder, background: palette.topBar, transform: `scale(${topBarPulse})` }}
          >
            <div className="grid h-full items-center gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="flex items-center gap-3 rounded-full border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]" style={{ borderColor: palette.fieldBorder, background: palette.fieldBackground }}>
                <Search className="h-4 w-4" style={{ color: palette.secondaryInk }} />
                <span className="text-sm font-medium" style={{ color: palette.secondaryInk }}>Search products, passports, or roles</span>
              </div>
              <div className="rounded-full border px-4 py-3 text-sm font-semibold" style={{ borderColor: palette.fieldBorder, background: palette.fieldBackground, color: palette.ink }}>
                {data.brandName}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold" style={{ borderColor: palette.fieldBorder, background: palette.fieldBackground, color: palette.ink }}>
                  <Bell className="h-4 w-4" style={{ color: palette.secondaryInk }} />
                  19
                </div>
                <div className="flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold" style={{ borderColor: palette.fieldBorder, background: palette.fieldBackground, color: palette.ink }}>
                  <UserCircle2 className="h-4 w-4" style={{ color: palette.secondaryInk }} />
                  Demo
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-0 p-5" style={{ background: palette.workspace }}>
            {scene.id === "dashboard" ? <DashboardScene data={data} localFrame={localFrame} /> : null}
            {scene.id === "scan" ? <ScanScene data={data} localFrame={localFrame} /> : null}
            {scene.id === "passport" ? <PassportScene data={data} localFrame={localFrame} /> : null}
            {scene.id === "wardrobe" ? <WardrobeScene data={data} localFrame={localFrame} /> : null}
            {scene.id === "marketplace" ? <MarketplaceScene data={data} localFrame={localFrame} /> : null}
            {scene.id === "rewards" ? <RewardsScene data={data} localFrame={localFrame} /> : null}
            {scene.id === "roles" ? <RolesScene localFrame={localFrame} /> : null}
          </div>
        </div>
      </div>
      <PreviewInteractionOverlay sceneId={scene.id} localFrame={localFrame} themeMode={data.themeMode} />
    </div>
  );
}

function DashboardScene({ data, localFrame }: { data: PreviewData; localFrame: number }) {
  const chartBarHeights = [42, 56, 68, 61, 74, 80, 86, 92];
  const reveal = getRevealProgress(localFrame, 0);
  const secondary = getRevealProgress(localFrame, 18);
  const tertiary = getRevealProgress(localFrame, 36);

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[0.26fr_0.48fr_0.26fr]">
      <div className="grid gap-3">
        <Card className="bg-[linear-gradient(180deg,_#0c1726,_#132134)] text-white" reveal={reveal}>
          <Label>Navigation</Label>
          <div className="mt-4 grid gap-2">
            {["Overview", "Marketplace", "Passport", "Inbox", "Automation", "Settings"].map((item, index) => (
              <div
                key={item}
                className={[
                  "rounded-[1rem] border px-3 py-2.5 text-sm font-semibold",
                  index === 0 ? "border-emerald-300/35 bg-emerald-300/14 text-white" : "border-white/10 bg-white/6 text-white/68"
                ].join(" ")}
              >
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card reveal={secondary}>
          <Label>Search</Label>
          <div className="mt-4 rounded-[1rem] border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            Search: {data.brandName} trench passport
          </div>
          <div className="mt-3 grid gap-2">
            {["Passport found", "Scanner upload ready", "Trust center synced"].map((item) => (
              <div key={item} className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Passport coverage", value: `${data.passportCoveragePercent}%` },
            { label: "Trust center", value: `${data.trustCenterScore}/100` },
            { label: "Enterprise", value: `${data.enterpriseReadiness}/100` }
          ].map((item, index) => (
            <Card key={item.label} dense reveal={getRevealProgress(localFrame, index * 8)}>
              <Label>{item.label}</Label>
              <Value>{item.value}</Value>
            </Card>
          ))}
        </div>

        <Card className="bg-[linear-gradient(180deg,_#fdfefe,_#eef5fb)]" reveal={secondary}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label>Analytics</Label>
              <p className="mt-2 text-[1.35rem] font-semibold tracking-tight text-slate-900">Circular Finder platform performance</p>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Live
            </div>
          </div>
          <div className="mt-5 grid h-[11rem] grid-cols-8 items-end gap-2">
            {chartBarHeights.map((height, index) => {
              const barProgress = spring({
                fps: VIDEO_FPS,
                frame: localFrame - 20 - index * 2,
                config: { damping: 18, stiffness: 130 }
              });
              const animatedHeight = interpolate(barProgress, [0, 1], [20, height], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp"
              });

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className={[
                      "w-full rounded-t-[0.8rem] bg-gradient-to-t",
                      index >= 5 ? "from-forest-700 via-emerald-400 to-emerald-200" : "from-sage-200 via-emerald-300/70 to-forest-200"
                    ].join(" ")}
                    style={{ height: `${animatedHeight}%` }}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">W{index + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Card dense reveal={tertiary}>
              <Label>Compliance</Label>
              <Value>{data.complianceReadiness}/100</Value>
            </Card>
            <Card dense reveal={tertiary}>
              <Label>Supplier risk</Label>
              <Value>{data.supplierRiskAverage} avg</Value>
            </Card>
            <Card dense reveal={tertiary}>
              <Label>Orders</Label>
              <Value>184 active</Value>
            </Card>
          </div>
        </Card>

        <Card reveal={tertiary}>
          <Label>Workflow automation</Label>
          <div className="mt-4 grid gap-2">
            {[
              "If passport risk changes, alert compliance and freeze claim badges.",
              "If a scanner upload matches, attach the DPP and update trust flows.",
              "If repair is logged, update value, marketplace trust, and next actions."
            ].map((flow, index) => (
              <div
                key={flow}
                className={[
                  "rounded-[1rem] border px-3 py-3 text-sm leading-6",
                  index === 1 ? "border-indigo-200 bg-indigo-50 text-indigo-900" : "border-slate-200 bg-white text-slate-600"
                ].join(" ")}
              >
                {flow}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-3">
        <Card reveal={secondary}>
          <Label>Notifications</Label>
          <div className="mt-4 grid gap-2">
            {["Passport confidence rose to 98%", "Marketplace claim review completed", "Privacy center update shipped"].map((item) => (
              <div key={item} className="rounded-[1rem] border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card reveal={tertiary}>
          <Label>Messaging</Label>
          <div className="mt-4 grid gap-2">
            {[
              "Brand ops: Review passport coverage update",
              "Marketplace: Buyer asked about repair history",
              "Trust center: Privacy disclosure ready"
            ].map((message) => (
              <div key={message} className="rounded-[1rem] border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-600">
                {message}
              </div>
            ))}
          </div>
        </Card>

        <Card reveal={tertiary}>
          <Label>Settings + mobile</Label>
          <div className="mt-4 grid gap-2">
            {["Privacy center controls", "Automated rewards", "Marketplace trust rules"].map((setting, index) => (
              <div key={setting} className="flex items-center justify-between rounded-[1rem] border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                <span>{setting}</span>
                <span className={["h-5 w-9 rounded-full p-0.5", index < 2 ? "bg-emerald-400" : "bg-slate-200"].join(" ")}>
                  <span className={["block h-4 w-4 rounded-full bg-white transition", index < 2 ? "translate-x-4" : "translate-x-0"].join(" ")} />
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <div className="w-[10rem] rounded-[1.8rem] border border-slate-200 bg-slate-950 p-3 shadow-soft">
              <div className="mx-auto h-1 w-14 rounded-full bg-white/14" />
              <div className="mt-4 rounded-[1.2rem] bg-[linear-gradient(180deg,_rgba(56,189,248,0.32),_rgba(6,9,18,1))] p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/58">Mobile view</p>
                <div className="mt-3 grid gap-2">
                  {["Scan", "Wallet", "Inbox"].map((tab, index) => (
                    <div key={tab} className={["rounded-full px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]", index === 0 ? "bg-emerald-300 text-stone-950" : "bg-white/10 text-white/66"].join(" ")}>
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ScanScene({ data, localFrame }: { data: PreviewData; localFrame: number }) {
  const reveal = getRevealProgress(localFrame, 0);
  const secondary = getRevealProgress(localFrame, 18);
  const scanLine = interpolate((localFrame % 54) / 54, [0, 1], [24, 74]);

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[0.84fr_1.16fr]">
      <Card className="bg-[linear-gradient(180deg,_#07110f,_#0b1717)] text-white" reveal={reveal}>
        <div className="flex items-center justify-between gap-3">
          <Label dark>Smart scanner</Label>
          <div className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
            Match confidence 98%
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "QR code", icon: QrCode },
            { label: "Camera scan", icon: Camera },
            { label: "Search", icon: Search },
            { label: "Passport", icon: ShieldCheck }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                  index === 1 ? "border-emerald-300/45 bg-emerald-300/14 text-emerald-100" : "border-white/12 bg-white/6 text-white/68"
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
            );
          })}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30">
          <img src={data.imageUrl} alt={data.productName} className="aspect-[4/3] w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
          <div className="absolute inset-5 rounded-[1.25rem] border border-emerald-300/55" />
          <div
            className="absolute left-5 right-5 h-0.5 bg-emerald-300 shadow-[0_0_24px_rgba(110,231,183,0.82)]"
            style={{ top: `${scanLine}%` }}
          />
          <div className="absolute bottom-5 left-5 right-5 rounded-[1.2rem] border border-white/10 bg-black/52 p-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Matched product</p>
            <p className="mt-2 text-base font-semibold text-white">{data.productName}</p>
            <p className="mt-1 text-sm text-white/74">{data.brandName}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "QR code", value: data.qrCode },
            { label: "Camera result", value: "Passport ready" },
            { label: "Search shortcut", value: `${data.brandName} ${data.productName}` },
            { label: "Digital ID", value: data.passportId }
          ].map((item, index) => (
            <Card key={item.label} dense reveal={getRevealProgress(localFrame, index * 6)}>
              <Label>{item.label}</Label>
              <Value>{item.value}</Value>
            </Card>
          ))}
        </div>

        <Card reveal={secondary}>
          <Label>Why it matters</Label>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            One polished scan layer makes product transparency feel natural. Camera scan, QR, search, and live matching all move people into the same verified Digital Product Passport without friction.
          </p>
        </Card>

        <Card reveal={secondary}>
          <Label>Feature callouts</Label>
          <div className="mt-4 grid gap-2">
            {["Camera scan with live match", "Search handoff into the passport", "High-contrast scan UI with clear focus states"].map((item) => (
              <div key={item} className="rounded-[1rem] border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PassportScene({ data, localFrame }: { data: PreviewData; localFrame: number }) {
  const reveal = getRevealProgress(localFrame, 0);

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[0.86fr_1.14fr]">
      <Card className="bg-[linear-gradient(180deg,_#ffffff,_#edf4fb)]" reveal={reveal}>
        <Label>Digital Product Passport</Label>
        <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <img src={data.imageUrl} alt={data.productName} className="aspect-[4/4.8] w-full rounded-[1.35rem] object-cover" />
          <div className="grid gap-3">
            <div className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-500">{data.brandName}</p>
              <p className="mt-2 text-[1.35rem] font-semibold tracking-tight text-slate-900">{data.productName}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{data.authenticity}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card dense reveal={getRevealProgress(localFrame, 12)}>
                <Label>Materials</Label>
                <Value>{data.materials.join(" • ")}</Value>
              </Card>
              <Card dense reveal={getRevealProgress(localFrame, 18)}>
                <Label>Passport ID</Label>
                <Value>{data.passportId}</Value>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card dense reveal={getRevealProgress(localFrame, 10)}>
            <Label>Circularity</Label>
            <Value>{data.circularityScore}/100</Value>
          </Card>
          <Card dense reveal={getRevealProgress(localFrame, 14)}>
            <Label>Resale value</Label>
            <Value>{formatCurrency(data.resaleValueEstimate)}</Value>
          </Card>
          <Card dense reveal={getRevealProgress(localFrame, 18)}>
            <Label>Repair log</Label>
            <Value>{data.repairCount} service events</Value>
          </Card>
          <Card dense reveal={getRevealProgress(localFrame, 22)}>
            <Label>Take-back</Label>
            <Value>Verified recovery path</Value>
          </Card>
        </div>

        <Card reveal={getRevealProgress(localFrame, 20)}>
          <Label>Care instructions</Label>
          <p className="mt-4 text-sm leading-7 text-slate-600">{data.careInstructions}</p>
        </Card>

        <Card reveal={getRevealProgress(localFrame, 26)}>
          <Label>Recovery options</Label>
          <p className="mt-4 text-sm leading-7 text-slate-600">{data.takeBackProgram}</p>
        </Card>
      </div>
    </div>
  );
}

function WardrobeScene({ data, localFrame }: { data: PreviewData; localFrame: number }) {
  return (
    <div className="grid h-full gap-4 xl:grid-cols-[0.88fr_1.12fr]">
      <Card className="bg-[linear-gradient(180deg,_#081420,_#0f1825)] text-white" reveal={getRevealProgress(localFrame, 0)}>
        <Label dark>Saved wardrobe</Label>
        <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <img src={data.imageUrl} alt={data.productName} className="aspect-[4/4.8] w-full rounded-[1.35rem] object-cover" />
          <div className="grid gap-3">
            <div className="rounded-[1.1rem] border border-white/10 bg-white/6 px-4 py-4">
              <p className="text-sm font-semibold text-white/56">Wardrobe item</p>
              <p className="mt-2 text-[1.35rem] font-semibold tracking-tight text-white">{data.productName}</p>
              <p className="mt-2 text-sm leading-7 text-white/76">The scan becomes a living record with ownership data, value, and service history.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card dense dark reveal={getRevealProgress(localFrame, 12)}>
                <Label dark>Saved items</Label>
                <Value dark>{data.inventoryCount}</Value>
              </Card>
              <Card dense dark reveal={getRevealProgress(localFrame, 18)}>
                <Label dark>Repair count</Label>
                <Value dark>{data.repairCount}</Value>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <Card reveal={getRevealProgress(localFrame, 14)}>
          <Label>Wardrobe history</Label>
          <div className="mt-4 grid gap-2">
            {["Last scan saved to wardrobe", "Repair event logged to passport", "Next action: resale or take-back"].map((item) => (
              <div key={item} className="rounded-[1rem] border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card dense reveal={getRevealProgress(localFrame, 20)}>
            <Label>Resale value</Label>
            <Value>{formatCurrency(data.resaleValueEstimate)}</Value>
          </Card>
          <Card dense reveal={getRevealProgress(localFrame, 26)}>
            <Label>Take-back</Label>
            <Value>Ready</Value>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MarketplaceScene({ data, localFrame }: { data: PreviewData; localFrame: number }) {
  return (
    <div className="grid h-full gap-4 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="grid gap-4">
        <Card reveal={getRevealProgress(localFrame, 0)}>
          <Label>Marketplace listing</Label>
          <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <img src={data.imageUrl} alt={data.productName} className="aspect-[4/4.8] w-full rounded-[1.35rem] object-cover" />
            <div className="grid gap-3">
              <div className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-500">{data.sellerName}</p>
                <p className="mt-2 text-[1.35rem] font-semibold tracking-tight text-slate-900">{data.productName}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">Passport-backed resale listing with pricing, condition, and trust signals already attached.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card dense reveal={getRevealProgress(localFrame, 10)}>
                  <Label>Live ask</Label>
                  <Value>{formatCurrency(data.listingPrice)}</Value>
                </Card>
                <Card dense reveal={getRevealProgress(localFrame, 16)}>
                  <Label>Resale estimate</Label>
                  <Value>{formatCurrency(data.resaleValueEstimate)}</Value>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        <Card reveal={getRevealProgress(localFrame, 18)}>
          <Label>Marketplace trust</Label>
          <div className="mt-4 grid gap-2">
            {["Authenticity verified", "Repair history attached", "Passport story visible", "Brand-safe claims enabled"].map((item, index) => (
              <div
                key={item}
                className={[
                  "rounded-[1rem] border px-3 py-3 text-sm",
                  index === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"
                ].join(" ")}
              >
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card reveal={getRevealProgress(localFrame, 12)}>
          <Label>Buyer confidence</Label>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Card dense reveal={getRevealProgress(localFrame, 14)}>
              <Label>Condition</Label>
              <Value>Excellent</Value>
            </Card>
            <Card dense reveal={getRevealProgress(localFrame, 18)}>
              <Label>Passport</Label>
              <Value>Attached</Value>
            </Card>
            <Card dense reveal={getRevealProgress(localFrame, 22)}>
              <Label>Seller</Label>
              <Value>{data.sellerName}</Value>
            </Card>
          </div>
        </Card>

        <Card reveal={getRevealProgress(localFrame, 24)}>
          <Label>Why it converts</Label>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Provenance, pricing, condition, and proof stay visible together so the circular marketplace feels trusted and premium instead of secondary.
          </p>
        </Card>
      </div>
    </div>
  );
}

function RewardsScene({ data, localFrame }: { data: PreviewData; localFrame: number }) {
  return (
    <div className="grid h-full gap-4 xl:grid-cols-[0.88fr_1.12fr]">
      <Card className="bg-[linear-gradient(180deg,_#183724,_#245233)] text-white" reveal={getRevealProgress(localFrame, 0)}>
        <Label dark>Impact Points™</Label>
        <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/6 px-5 py-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">Points earned</p>
          <p className="mt-3 text-[3.5rem] font-semibold tracking-tight text-white">{data.impactPoints.toLocaleString()}</p>
          <p className="mt-3 text-sm leading-7 text-white/74">Every verified scan, repair, reuse, and resale moment turns into visible progress.</p>
        </div>
      </Card>

      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card dense reveal={getRevealProgress(localFrame, 10)}>
            <Label>Streak</Label>
            <Value>{data.streakDays} days</Value>
          </Card>
          <Card dense reveal={getRevealProgress(localFrame, 16)}>
            <Label>Badges</Label>
            <Value>{data.unlockedRewardCount}</Value>
          </Card>
          <Card dense reveal={getRevealProgress(localFrame, 22)}>
            <Label>Challenges</Label>
            <Value>3 active</Value>
          </Card>
        </div>

        <Card reveal={getRevealProgress(localFrame, 18)}>
          <Label>Streak + challenge loop</Label>
          <div className="mt-4 rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Repair Ready</p>
            <div className="mt-3 h-3 rounded-full bg-slate-200">
              <div className="h-3 rounded-full bg-gradient-to-r from-forest-500 via-emerald-400 to-sage-300" style={{ width: "72%" }} />
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">Make sustainable behavior feel motivating, visible, and worth returning for.</p>
          </div>
        </Card>

        <Card reveal={getRevealProgress(localFrame, 24)}>
          <Label>Badge shelf</Label>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["Digital Twin Finder", "Repair Ready", "Reuse Hero"].map((badge) => (
              <div key={badge} className="rounded-[1.1rem] border border-slate-200 bg-white px-3 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-forest-500 via-emerald-400 to-sage-300 text-white shadow-soft">
                  <Trophy className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{badge}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function RolesScene({ localFrame }: { localFrame: number }) {
  const roleCards = [
    {
      title: "Consumer",
      description: "Scan, verify, save, and earn rewards.",
      icon: UserCircle2,
      accent: "from-forest-400 via-sage-300 to-sage-100",
      detail: "Opens the passport, saves items, and turns circular actions into visible progress."
    },
    {
      title: "Brand",
      description: "See performance, claims, and trust signals together.",
      icon: LayoutDashboard,
      accent: "from-forest-500 via-emerald-300 to-sage-100",
      detail: "Keeps product storytelling, verified claims, and marketplace trust on the same dashboard."
    },
    {
      title: "Supplier",
      description: "Share origin, materials, and compliance proof.",
      icon: Store,
      accent: "from-emerald-400 via-green-300 to-sage-100",
      detail: "Feeds origin, certifications, and material proof upstream into the same verified passport."
    },
    {
      title: "Admin",
      description: "Control governance, settings, and recovery flows.",
      icon: Settings2,
      accent: "from-sage-500 via-sage-300 to-sand-100",
      detail: "Protects trust rules, recovery workflows, and policy controls without breaking the product story."
    }
  ];

  const focusFrames = [95, 283, 475, 668, 926];
  let activeIndex = 0;

  for (let index = 0; index < roleCards.length; index += 1) {
    if (localFrame >= focusFrames[index]) {
      activeIndex = index;
    }
  }

  const activeRole = roleCards[Math.min(activeIndex, roleCards.length - 1)];

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[0.78fr_1.22fr]">
      <Card className="bg-[linear-gradient(180deg,_#ffffff,_#edf4fb)]" reveal={getRevealProgress(localFrame, 0)}>
        <Label>Role-aware platform</Label>
        <p className="mt-4 text-[1.35rem] font-semibold tracking-tight text-slate-900">{activeRole.title} view</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">{activeRole.detail}</p>
        <div className="mt-4 grid gap-3">
          {roleCards.map((role, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={role.title}
                className={[
                  "rounded-[1rem] border px-3 py-3 text-sm font-semibold transition",
                  isActive ? "border-emerald-300 bg-emerald-50 text-slate-900 shadow-soft" : "border-slate-200 bg-white/82 text-slate-500"
                ].join(" ")}
              >
                {role.title}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {roleCards.map((role, index) => {
          const Icon = role.icon;
          const focusPulse = interpolate(localFrame, [focusFrames[index] - 24, focusFrames[index], focusFrames[index] + 110], [0, 1, 0.18], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.18, 0.82, 0.22, 1)
          });
          const isActive = index === activeIndex;

          return (
            <div
              key={role.title}
              style={{
                opacity: isActive ? 1 : 0.72,
                transform: `translateY(${interpolate(focusPulse, [0, 1], [0, -12])}px) scale(${interpolate(focusPulse, [0, 1], [1, 1.03])})`
              }}
            >
              <Card
                className={[
                  "bg-[linear-gradient(180deg,_#ffffff,_#eef5fb)] transition",
                  isActive ? "border-emerald-300 shadow-[0_28px_56px_rgba(47,104,64,0.16)]" : "border-slate-200"
                ].join(" ")}
                reveal={getRevealProgress(localFrame, index * 8)}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] bg-gradient-to-br ${role.accent} text-stone-950 shadow-soft`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[1.25rem] font-semibold tracking-tight text-slate-900">{role.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{role.description}</p>
                <div className={["mt-4 rounded-[1rem] border px-3 py-3 text-sm leading-6", isActive ? "border-emerald-200 bg-emerald-50 text-slate-700" : "border-slate-200 bg-white/82 text-slate-500"].join(" ")}>
                  {role.detail}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreviewInteractionOverlay({
  sceneId,
  localFrame,
  themeMode
}: {
  localFrame: number;
  sceneId: VideoSceneId;
  themeMode: "light" | "dark";
}) {
  const palette = getPreviewPalette(themeMode);
  const cues = interactionCueMap[sceneId];
  let currentIndex = 0;

  for (let index = 0; index < cues.length; index += 1) {
    if (localFrame >= cues[index].frame) {
      currentIndex = index;
    }
  }
  const currentCue = cues[currentIndex] ?? cues[0];
  const nextCue = cues[Math.min(currentIndex + 1, cues.length - 1)] ?? currentCue;
  const segmentProgress =
    currentCue === nextCue
      ? 1
      : interpolate(localFrame, [currentCue.frame, nextCue.frame], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.2, 0.8, 0.2, 1)
        });
  const x = currentCue.x + (nextCue.x - currentCue.x) * segmentProgress;
  const y = currentCue.y + (nextCue.y - currentCue.y) * segmentProgress;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
      {cues.map((cue) => {
        const pulse = interpolate(localFrame, [cue.frame - 4, cue.frame + 6, cue.frame + 20], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp"
        });

        if (pulse <= 0.01) {
          return null;
        }

        return (
          <React.Fragment key={`${sceneId}-${cue.label}`}>
            <div
              style={{
                position: "absolute",
                left: `${cue.x}%`,
                top: `${cue.y}%`,
                width: 74,
                height: 74,
                marginLeft: -37,
                marginTop: -37,
                borderRadius: 999,
                border: `1px solid ${palette.accentBorder}`,
                opacity: pulse * 0.72,
                transform: `scale(${0.78 + pulse * 0.52})`
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${cue.x}%`,
                top: `${cue.y}%`,
                width: 26,
                height: 26,
                marginLeft: -13,
                marginTop: -13,
                borderRadius: 999,
                background: palette.accentSoft,
                boxShadow: palette.accentGlow,
                opacity: pulse
              }}
            />
          </React.Fragment>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-18%, -18%)",
          color: palette.pointer
        }}
      >
        <MousePointer2
          style={{
            width: 28,
            height: 28,
            filter: `drop-shadow(0 10px 18px ${themeMode === "dark" ? "rgba(0,0,0,0.28)" : "rgba(47,104,64,0.18)"})`
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: `${Math.min(x + 4, 84)}%`,
          top: `${Math.min(y + 4, 86)}%`,
          transform: "translate(0, 0)",
          padding: "10px 14px",
          borderRadius: 999,
          border: palette.chromeBorder,
          background: palette.chromeSurface,
          backdropFilter: "blur(16px)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.mutedInk
        }}
      >
        {currentCue.label}
      </div>
    </div>
  );
}

function Card({
  children,
  className = "",
  dark = false,
  dense = false,
  reveal = 1
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  dense?: boolean;
  reveal?: number;
}) {
  return (
    <div
      className={[
        "rounded-[1.35rem] border shadow-[0_20px_40px_rgba(15,23,42,0.08)]",
        dense ? "px-4 py-4" : "px-4 py-4",
        dark ? "border-white/10 bg-white/6" : "border-slate-200 bg-white/92",
        className
      ].join(" ")}
      style={{
        opacity: interpolate(reveal, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(reveal, [0, 1], [18, 0])}px) scale(${interpolate(reveal, [0, 1], [0.96, 1])})`
      }}
    >
      {children}
    </div>
  );
}

function Label({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={["text-[11px] font-semibold uppercase tracking-[0.18em]", dark ? "text-white/48" : "text-slate-400"].join(" ")}>
      {children}
    </p>
  );
}

function Value({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <p className={["mt-3 text-sm font-semibold leading-6", dark ? "text-white" : "text-slate-900"].join(" ")}>{children}</p>;
}

function getRevealProgress(frame: number, delay: number) {
  return spring({
    fps: VIDEO_FPS,
    frame: frame - delay,
    config: {
      damping: 16,
      mass: 0.9,
      stiffness: 120
    }
  });
}

function getPreviewPalette(themeMode: "light" | "dark") {
  if (themeMode === "dark") {
    return {
      accentBorder: "rgba(187, 247, 208, 0.42)",
      accentGlow: "0 18px 38px rgba(134, 239, 172, 0.24)",
      accentSoft: "rgba(187, 247, 208, 0.18)",
      accentStrong: "#d9fbe7",
      appShell: "linear-gradient(180deg, rgba(229,235,231,0.98), rgba(213,220,216,0.95))",
      chipSurface: "rgba(217, 251, 231, 0.16)",
      chromeBorder: "1px solid rgba(217, 251, 231, 0.12)",
      chromeSurface: "rgba(42, 50, 54, 0.78)",
      fieldBackground: "rgba(246, 248, 247, 0.94)",
      fieldBorder: "rgba(133, 161, 145, 0.34)",
      ink: "#f7faf8",
      mutedInk: "rgba(227, 235, 231, 0.78)",
      pointer: "#f7faf8",
      secondaryInk: "rgba(232, 238, 234, 0.86)",
      sidebar: "linear-gradient(180deg, #2b3437, #20282b)",
      sidebarActive: "rgba(167, 243, 208, 0.22)",
      sidebarBadge: "#d9fbe7",
      sidebarBadgeInk: "#173223",
      stageBackground:
        "radial-gradient(circle at top, rgba(167,243,208,0.16), transparent 28%), linear-gradient(180deg, #202629 0%, #2b3235 48%, #1c2124 100%)",
      stageSurface: "rgba(30, 36, 39, 0.58)",
      topBar: "rgba(237, 241, 239, 0.9)",
      workspace: "linear-gradient(180deg, rgba(233,239,235,0.98), rgba(220,226,222,0.92))"
    };
  }

  return {
    accentBorder: "rgba(66, 132, 82, 0.34)",
    accentGlow: "0 18px 38px rgba(66, 132, 82, 0.18)",
    accentSoft: "rgba(98, 165, 111, 0.16)",
    accentStrong: "#2f6840",
    appShell: "linear-gradient(180deg, rgba(251,253,251,0.98), rgba(235,244,237,0.95))",
    chipSurface: "rgba(216, 235, 220, 0.68)",
    chromeBorder: "1px solid rgba(143, 194, 151, 0.34)",
    chromeSurface: "rgba(251, 253, 251, 0.82)",
    fieldBackground: "rgba(255, 255, 255, 0.94)",
    fieldBorder: "rgba(180, 215, 187, 0.8)",
    ink: "#183724",
    mutedInk: "#516754",
    pointer: "#245233",
    secondaryInk: "#425345",
    sidebar: "linear-gradient(180deg, #245233, #183724)",
    sidebarActive: "rgba(216, 235, 220, 0.22)",
    sidebarBadge: "#ffffff",
    sidebarBadgeInk: "#183724",
    stageBackground:
      "radial-gradient(circle at top, rgba(143,194,151,0.18), transparent 28%), linear-gradient(180deg, #f8fbf8 0%, #eef5ef 48%, #e2ebdf 100%)",
    stageSurface: "rgba(255, 255, 255, 0.58)",
    topBar: "rgba(255, 255, 255, 0.92)",
    workspace: "linear-gradient(180deg, rgba(248,251,248,0.98), rgba(239,245,239,0.94))"
  };
}

function getSceneCameraStyle(sceneId: VideoSceneId, frame: number, duration: number) {
  const beats = [0, Math.round(duration * 0.34), Math.round(duration * 0.72), duration];

  if (sceneId === "dashboard") {
    return {
      scale: interpolate(frame, beats, [1.01, 1.065, 1.035, 1.005], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      x: interpolate(frame, beats, [0, -26, 12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      y: interpolate(frame, beats, [0, 8, -4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    };
  }

  if (sceneId === "scan") {
    return {
      scale: interpolate(frame, beats, [1.015, 1.07, 1.04, 1.005], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      x: interpolate(frame, beats, [0, 30, -10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      y: interpolate(frame, beats, [0, 4, -2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    };
  }

  if (sceneId === "passport") {
    return {
      scale: interpolate(frame, beats, [1.015, 1.06, 1.035, 1.005], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      x: interpolate(frame, beats, [0, 18, -12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      y: interpolate(frame, beats, [0, 2, -3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    };
  }

  if (sceneId === "wardrobe") {
    return {
      scale: interpolate(frame, beats, [1.01, 1.055, 1.03, 1.005], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      x: interpolate(frame, beats, [0, 24, -8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      y: interpolate(frame, beats, [0, 8, 0, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    };
  }

  if (sceneId === "marketplace") {
    return {
      scale: interpolate(frame, beats, [1.01, 1.06, 1.035, 1.005], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      x: interpolate(frame, beats, [0, 14, -16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      y: interpolate(frame, beats, [0, 4, -3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    };
  }

  if (sceneId === "rewards") {
    return {
      scale: interpolate(frame, beats, [1.015, 1.07, 1.035, 1.005], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      x: interpolate(frame, beats, [0, 24, -10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      y: interpolate(frame, beats, [0, 4, -2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    };
  }

  return {
    scale: interpolate(frame, beats, [1.01, 1.055, 1.03, 1.005], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    x: interpolate(frame, beats, [0, 18, -8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    y: interpolate(frame, beats, [0, 4, -2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  };
}

function getActiveSceneForFrame(frame: number) {
  let currentScene = videoScenes[0];

  for (const scene of videoScenes) {
    if (frame >= videoSceneStartFrames[scene.id]) {
      currentScene = scene;
    }
  }

  return currentScene;
}

function getActiveDockIdForFrame(frame: number): DockFeatureId {
  const scene = getActiveSceneForFrame(frame);
  const localFrame = frame - videoSceneStartFrames[scene.id];

  if (scene.id === "dashboard") {
    if (localFrame < 260) {
      return "dashboard";
    }

    if (localFrame < 440) {
      return "analytics";
    }

    if (localFrame < 560) {
      return "messaging";
    }

    return "settings";
  }

  if (scene.id === "scan") {
    return localFrame < 180 ? "camera" : localFrame < 300 ? "search" : "passport";
  }

  if (scene.id === "passport") {
    return "passport";
  }

  if (scene.id === "wardrobe") {
    return "profile";
  }

  if (scene.id === "marketplace") {
    return "analytics";
  }

  if (scene.id === "rewards") {
    return "rewards";
  }

  return "profile";
}
