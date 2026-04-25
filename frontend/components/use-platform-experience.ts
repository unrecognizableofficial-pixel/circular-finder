"use client";

import * as React from "react";
import { fetchBootstrap, fetchOutfits, fetchWardrobe, login as loginRequest, register as registerRequest } from "@/lib/api";
import {
  batchFoldersSeed,
  discoveryProfiles,
  feedPostsSeed,
  feedSections,
  fieldLocksSeed,
  governancePresetsSeed,
  impactChallengesSeed,
  leaderboardSeed,
  notificationsSeed,
  onboardingSteps,
  rewardBadgesSeed,
  roleMetricBaseline,
  trainingModulesSeed,
  type BatchFolder,
  type DemoNotification,
  type DiscoveryProfile,
  type FeedPost,
  type FeedSection,
  type FieldLock,
  type GovernancePreset,
  type ImpactChallenge,
  type LeaderboardEntry,
  type RewardBadge,
  type TrainingModule
} from "@/lib/mock-data";
import { buildAuditEntry, evaluatePolicies, type EnforcementAction, type PolicyAuditEntry } from "@/lib/policy-engine";
import { getRoleById, roleHasCapability, roles, type DemoRole, type DemoRoleId } from "@/lib/roles";
import { getNextStreakTier, getStreakLevel, getStreakRank, getStreakTier, streakMilestones, type StreakVisualState } from "@/lib/streak";
import type { BodyProfile, BootstrapPayload, Passport } from "@/types/platform";

export type ImpactMetrics = {
  views: number;
  followers: number;
  conversions: number;
  sustainability: number;
  reach: number;
};

export type ScannerActivity = {
  lookups: number;
  scans: number;
  uploads: number;
  latestPassportId: string;
  latestLocation: string;
  latestTimestamp: string;
};

export type ThemeMode = "light" | "dark";

export type SustainabilityMetrics = {
  carbonSavedKg: number;
  waterSavedLiters: number;
  itemsReused: number;
  wasteDivertedKg: number;
  communityImpact: number;
};

export type StreakSummary = {
  days: number;
  level: number;
  rankLabel: string;
  tierLabel: string;
  visualState: StreakVisualState;
  impactPointsToNextLevel: number;
  nextMilestoneDays: number | null;
  statusMessage: string;
};

export type PlatformExperienceValue = {
  hydrated: boolean;
  token: string;
  bootstrap: BootstrapPayload | null;
  loading: boolean;
  error: string;
  userLabel: string;
  bodyProfiles: BodyProfile[];
  selectedProfileId: string;
  selectedProfile: BodyProfile | null;
  setSelectedProfileId: (id: string) => void;
  saveBodyProfile: (profile: Omit<BodyProfile, "id"> & { id?: string }) => void;
  removeBodyProfile: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshBootstrap: () => Promise<void>;
  refreshWardrobe: () => Promise<void>;
  refreshOutfits: () => Promise<void>;
  setBootstrap: React.Dispatch<React.SetStateAction<BootstrapPayload | null>>;
  roles: DemoRole[];
  selectedRoleId: DemoRoleId | "";
  selectedRole: DemoRole | null;
  selectRole: (roleId: DemoRoleId) => void;
  onboardingStepIds: string[];
  completeOnboardingStep: (stepId: string) => void;
  onboardingComplete: boolean;
  streak: StreakSummary;
  impactPoints: number;
  impactMetrics: ImpactMetrics;
  sustainabilityMetrics: SustainabilityMetrics;
  leaderboard: LeaderboardEntry[];
  challenges: ImpactChallenge[];
  completeChallenge: (challengeId: string) => void;
  rewards: RewardBadge[];
  activeFeedSection: FeedSection;
  setActiveFeedSection: (section: FeedSection) => void;
  feedSections: FeedSection[];
  feedPosts: FeedPost[];
  likedPosts: string[];
  savedPosts: string[];
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  followedProfileIds: string[];
  toggleFollowProfile: (profileId: string) => void;
  discoveryProfiles: DiscoveryProfile[];
  presets: GovernancePreset[];
  duplicatePreset: (presetId: string) => void;
  approveStyleCard: () => void;
  styleCardApproved: boolean;
  revertSubBrandTheme: () => void;
  masterResetTheme: () => void;
  fieldLocks: FieldLock[];
  toggleFieldLock: (fieldId: string) => void;
  trainingModules: TrainingModule[];
  trainingModalOpen: boolean;
  openTrainingModal: () => void;
  closeTrainingModal: () => void;
  updateTrainingModuleProgress: (moduleId: string, progress: number) => void;
  completeTrainingModule: () => void;
  notifications: DemoNotification[];
  auditTrail: PolicyAuditEntry[];
  policyActions: EnforcementAction[];
  complianceScore: number;
  incidentTriggered: boolean;
  accountFrozen: boolean;
  accessRestored: boolean;
  triggerOffBrandIncident: () => void;
  freezeAccount: () => void;
  restoreAccess: () => void;
  continueRecovery: () => void;
  scannerActivity: ScannerActivity;
  recordScannerLookup: (passport?: Passport | null) => void;
  recordScannerUpload: (passport?: Passport | null) => void;
  recordScannerScan: (passport?: Passport | null) => void;
  watermarkOpacity: number;
  setWatermarkOpacity: (value: number) => void;
  themeMode: ThemeMode;
  setThemeMode: (value: ThemeMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  accessibilityMode: boolean;
  setAccessibilityMode: (value: boolean) => void;
  batchFolders: BatchFolder[];
  selectedRoleCapabilities: DemoRole["capabilities"];
  canAccess: (capability: Parameters<typeof roleHasCapability>[1]) => boolean;
};

const TOKEN_STORAGE_KEY = "circular-finder-live-token";
const BODY_PROFILE_STORAGE_KEY = "circular-finder-body-profiles";
const SELECTED_PROFILE_STORAGE_KEY = "circular-finder-selected-profile";
const SELECTED_ROLE_STORAGE_KEY = "circular-finder-demo-role";
const THEME_STORAGE_KEY = "circular-finder-theme";
const SOUND_STORAGE_KEY = "circular-finder-sound-enabled";
const MOTION_STORAGE_KEY = "circular-finder-reduced-motion";
const ACCESSIBILITY_STORAGE_KEY = "circular-finder-accessibility-mode";

const defaultProfiles: BodyProfile[] = [
  {
    id: "demo-profile-core",
    name: "Core Fit",
    heightCm: 170,
    chestCm: 92,
    waistCm: 74,
    hipsCm: 99,
    inseamCm: 78,
    preferredFit: "regular",
    stylePreferences: ["minimal", "tailored"]
  },
  {
    id: "demo-profile-weekend",
    name: "Weekend Layers",
    heightCm: 176,
    chestCm: 98,
    waistCm: 80,
    hipsCm: 102,
    inseamCm: 80,
    preferredFit: "relaxed",
    stylePreferences: ["utility", "outdoor", "relaxed"]
  }
];
const CORE_PROFILE_IDS = new Set(defaultProfiles.map((profile) => profile.id));

const defaultScannerActivity: ScannerActivity = {
  lookups: 0,
  scans: 0,
  uploads: 0,
  latestPassportId: "",
  latestLocation: "Awaiting first scan",
  latestTimestamp: "Not yet captured"
};

function getStreakStateMessage(state: StreakVisualState, days: number) {
  if (state === "warning") {
    return "Your streak needs one action today.";
  }

  if (state === "frozen") {
    return "Logo freeze is protecting the streak while recovery is in progress.";
  }

  if (state === "recovered") {
    return `Your ${days}-day logo streak reignited after recovery.`;
  }

  return "Keep your logo glowing with one meaningful action today.";
}

function playDemoFanfare() {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const notes = [523.25, 659.25, 783.99];

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime + index * 0.08;
    const endAt = startAt + 0.14;

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.04, startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt);
  });

  window.setTimeout(() => {
    void context.close();
  }, 500);
}

export function usePlatformExperience(): PlatformExperienceValue {
  const [hydrated, setHydrated] = React.useState(false);
  const [token, setToken] = React.useState("");
  const [bootstrap, setBootstrap] = React.useState<BootstrapPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [bodyProfiles, setBodyProfiles] = React.useState<BodyProfile[]>(defaultProfiles);
  const [selectedProfileId, setSelectedProfileId] = React.useState(defaultProfiles[0]?.id ?? "");
  const [selectedRoleId, setSelectedRoleId] = React.useState<DemoRoleId | "">("");
  const [completedOnboarding, setCompletedOnboarding] = React.useState<string[]>([]);
  const [challenges, setChallenges] = React.useState<ImpactChallenge[]>(impactChallengesSeed);
  const [rewards, setRewards] = React.useState<RewardBadge[]>(rewardBadgesSeed);
  const [activeFeedSection, setActiveFeedSection] = React.useState<FeedSection>("Following");
  const [likedPosts, setLikedPosts] = React.useState<string[]>([]);
  const [savedPosts, setSavedPosts] = React.useState<string[]>([]);
  const [followedProfileIds, setFollowedProfileIds] = React.useState<string[]>(["profile-hinterland"]);
  const [presets, setPresets] = React.useState<GovernancePreset[]>(governancePresetsSeed);
  const [styleCardApproved, setStyleCardApproved] = React.useState(false);
  const [fieldLocks, setFieldLocks] = React.useState(fieldLocksSeed);
  const [trainingModules, setTrainingModules] = React.useState<TrainingModule[]>(trainingModulesSeed);
  const [trainingModalOpen, setTrainingModalOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<DemoNotification[]>(notificationsSeed);
  const [auditTrail, setAuditTrail] = React.useState<PolicyAuditEntry[]>([]);
  const [policyActions, setPolicyActions] = React.useState<EnforcementAction[]>([]);
  const [incidentTriggered, setIncidentTriggered] = React.useState(false);
  const [accountFrozen, setAccountFrozen] = React.useState(false);
  const [accessRestored, setAccessRestored] = React.useState(false);
  const [complianceScore, setComplianceScore] = React.useState(92);
  const [scannerActivity, setScannerActivity] = React.useState<ScannerActivity>(defaultScannerActivity);
  const [watermarkOpacity, setWatermarkOpacity] = React.useState(48);
  const [themeMode, setThemeMode] = React.useState<ThemeMode>("light");
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [accessibilityMode, setAccessibilityMode] = React.useState(false);
  const [batchFolders] = React.useState<BatchFolder[]>(batchFoldersSeed);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    const storedProfiles = window.localStorage.getItem(BODY_PROFILE_STORAGE_KEY);
    const storedSelectedProfile = window.localStorage.getItem(SELECTED_PROFILE_STORAGE_KEY) || "";
    const storedRoleId = window.localStorage.getItem(SELECTED_ROLE_STORAGE_KEY) as DemoRoleId | null;
    const storedThemeMode = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    const storedSoundEnabled = window.localStorage.getItem(SOUND_STORAGE_KEY);
    const storedReducedMotion = window.localStorage.getItem(MOTION_STORAGE_KEY);
    const storedAccessibilityMode = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);

    setToken(storedToken);
    if (storedProfiles) {
      try {
        const parsed = JSON.parse(storedProfiles) as BodyProfile[];
        setBodyProfiles(parsed.length ? parsed : defaultProfiles);
      } catch {
        setBodyProfiles(defaultProfiles);
      }
    }
    setSelectedProfileId(storedSelectedProfile || defaultProfiles[0]?.id || "");
    if (storedRoleId && getRoleById(storedRoleId)) {
      setSelectedRoleId(storedRoleId);
    }
    if (storedThemeMode === "light" || storedThemeMode === "dark") {
      setThemeMode(storedThemeMode);
    }
    if (storedSoundEnabled !== null) {
      setSoundEnabled(storedSoundEnabled === "true");
    }
    if (storedReducedMotion !== null) {
      setReducedMotion(storedReducedMotion === "true");
    }
    if (storedAccessibilityMode !== null) {
      setAccessibilityMode(storedAccessibilityMode === "true");
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!bodyProfiles.length) {
      return;
    }

    const selectedExists = bodyProfiles.some((profile) => profile.id === selectedProfileId);
    if (selectedExists) {
      return;
    }

    const fallbackId = bodyProfiles[0]?.id ?? "";
    setSelectedProfileId(fallbackId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_PROFILE_STORAGE_KEY, fallbackId);
    }
  }, [bodyProfiles, hydrated, selectedProfileId]);

  const refreshBootstrap = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchBootstrap(token || undefined);
      setBootstrap(payload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load platform data.");
      setBootstrap(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    void refreshBootstrap();
  }, [refreshBootstrap]);

  const persistProfiles = React.useCallback((nextProfiles: BodyProfile[], nextSelectedId?: string) => {
    setBodyProfiles(nextProfiles);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BODY_PROFILE_STORAGE_KEY, JSON.stringify(nextProfiles));
    }

    if (nextSelectedId !== undefined) {
      setSelectedProfileId(nextSelectedId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SELECTED_PROFILE_STORAGE_KEY, nextSelectedId);
      }
    }
  }, []);

  const saveBodyProfile = React.useCallback(
    (profile: Omit<BodyProfile, "id"> & { id?: string }) => {
      const nextId = profile.id ?? crypto.randomUUID();
      const nextProfile: BodyProfile = { ...profile, id: nextId };
      const nextProfiles = [...bodyProfiles.filter((item) => item.id !== nextId), nextProfile];
      persistProfiles(nextProfiles, nextId);
      setNotifications((current) => [
        {
          id: `notice-profile-${nextId}`,
          title: "Tailored profile saved",
          body: `${nextProfile.name} is now available inside the fitting and discovery flow.`,
          tone: "success",
          createdAt: "Now"
        },
        ...current
      ]);
    },
    [bodyProfiles, persistProfiles]
  );

  const removeBodyProfile = React.useCallback(
    (id: string) => {
      if (CORE_PROFILE_IDS.has(id)) {
        setNotifications((current) => [
          {
            id: `notice-core-profile-${id}-${Date.now()}`,
            title: "Core fitting profile locked",
            body: "Built-in fitting profiles stay available for demo coverage and cannot be deleted.",
            tone: "warning",
            createdAt: "Now"
          },
          ...current
        ]);
        return;
      }

      const nextProfiles = bodyProfiles.filter((item) => item.id !== id);
      const nextSelectedId = selectedProfileId === id ? nextProfiles[0]?.id ?? "" : selectedProfileId;
      persistProfiles(nextProfiles, nextSelectedId);
    },
    [bodyProfiles, persistProfiles, selectedProfileId]
  );

  const setSelectedProfile = React.useCallback((id: string) => {
    setSelectedProfileId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_PROFILE_STORAGE_KEY, id);
    }
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const payload = await loginRequest(email, password);
    setToken(payload.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    }
  }, []);

  const register = React.useCallback(async (fullName: string, email: string, password: string) => {
    const payload = await registerRequest(fullName, email, password);
    setToken(payload.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    }
  }, []);

  const logout = React.useCallback(() => {
    setToken("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
  }, [soundEnabled]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(MOTION_STORAGE_KEY, String(reducedMotion));
  }, [reducedMotion]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, String(accessibilityMode));
  }, [accessibilityMode]);

  const refreshWardrobe = React.useCallback(async () => {
    if (!token) {
      return;
    }
    const payload = await fetchWardrobe(token);
    setBootstrap((current) => {
      if (!current || !current.user) {
        return current;
      }
      return {
        ...current,
        user: {
          ...current.user,
          wardrobe: payload.items,
          insights: payload.insights,
          outfits: payload.outfits
        }
      };
    });
  }, [token]);

  const refreshOutfits = React.useCallback(async () => {
    if (!token) {
      return;
    }
    const payload = await fetchOutfits(token);
    setBootstrap((current) => {
      if (!current || !current.user) {
        return current;
      }
      return {
        ...current,
        user: {
          ...current.user,
          outfits: payload.items
        }
      };
    });
  }, [token]);

  const selectedProfile = bodyProfiles.find((item) => item.id === selectedProfileId) ?? bodyProfiles[0] ?? null;
  const selectedRole = getRoleById(selectedRoleId);
  const userLabel = bootstrap?.user?.profile?.email ?? "Demo session";

  const selectRole = React.useCallback((roleId: DemoRoleId) => {
    setSelectedRoleId(roleId);
    setIncidentTriggered(false);
    setAccountFrozen(false);
    setAccessRestored(false);
    setPolicyActions([]);
    setAuditTrail([]);
    setTrainingModalOpen(false);
    setTrainingModules(trainingModulesSeed);
    setComplianceScore(92);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_ROLE_STORAGE_KEY, roleId);
    }
  }, []);

  const updateChallengeProgress = React.useCallback((challengeId: string, nextProgress: number) => {
    setChallenges((current) =>
      current.map((challenge) =>
        challenge.id === challengeId ? { ...challenge, progress: Math.min(challenge.target, nextProgress) } : challenge
      )
    );
  }, []);

  const unlockReward = React.useCallback((title: string) => {
    setRewards((current) => current.map((badge) => (badge.title === title ? { ...badge, unlocked: true } : badge)));
  }, []);

  const completeOnboardingStep = React.useCallback(
    (stepId: string) => {
      if (completedOnboarding.includes(stepId)) {
        return;
      }

      const next = [...completedOnboarding, stepId];
      setCompletedOnboarding(next);

      if (stepId === "scan") updateChallengeProgress("challenge-scan", 1);
      if (stepId === "post-feed") updateChallengeProgress("challenge-post", 1);
      if (stepId === "batch-upload") updateChallengeProgress("challenge-product", 1);

      if (next.length === onboardingSteps.length) {
        unlockReward("Getting Started");
        if (soundEnabled) {
          playDemoFanfare();
        }
        setNotifications((existing) => [
          {
            id: `notice-onboarding-${Date.now()}`,
            title: "Getting Started badge awarded",
            body: "The guided walkthrough is complete and the demo account received a full investor-ready unlock.",
            tone: "success",
            createdAt: "Now"
          },
          ...existing
        ]);
      }
    },
    [completedOnboarding, soundEnabled, unlockReward, updateChallengeProgress]
  );

  const completeChallenge = React.useCallback(
    (challengeId: string) => {
      const target = challenges.find((challenge) => challenge.id === challengeId)?.target ?? 1;
      updateChallengeProgress(challengeId, target);
      const rewardTitle = challenges.find((challenge) => challenge.id === challengeId)?.rewardBadge;
      if (rewardTitle) {
        unlockReward(rewardTitle);
      }
    },
    [challenges, unlockReward, updateChallengeProgress]
  );

  const toggleLikePost = React.useCallback((postId: string) => {
    setLikedPosts((current) => (current.includes(postId) ? current.filter((item) => item !== postId) : [...current, postId]));
  }, []);

  const toggleSavePost = React.useCallback((postId: string) => {
    setSavedPosts((current) => (current.includes(postId) ? current.filter((item) => item !== postId) : [...current, postId]));
  }, []);

  const toggleFollowProfile = React.useCallback((profileId: string) => {
    setFollowedProfileIds((current) =>
      current.includes(profileId) ? current.filter((item) => item !== profileId) : [...current, profileId]
    );
  }, []);

  const duplicatePreset = React.useCallback((presetId: string) => {
    setPresets((current) => {
      const preset = current.find((item) => item.id === presetId);
      if (!preset) {
        return current;
      }
      const duplicate: GovernancePreset = {
        ...preset,
        id: crypto.randomUUID(),
        name: `${preset.name} Copy`,
        updatedAt: "Now"
      };
      return [duplicate, ...current];
    });
  }, []);

  const approveStyleCard = React.useCallback(() => {
    setStyleCardApproved(true);
    setNotifications((current) => [
      {
        id: `notice-style-${Date.now()}`,
        title: "Style card approved",
        body: "Approved colors, type, and component styling are now applied globally across the demo UI.",
        tone: "success",
        createdAt: "Now"
      },
      ...current
    ]);
  }, []);

  const revertSubBrandTheme = React.useCallback(() => {
    setPresets((current) =>
      current.map((preset) => (preset.subBrand === "Studio House 01" ? { ...preset, approved: false, updatedAt: "Now" } : preset))
    );
    setNotifications((current) => [
      {
        id: `notice-revert-${Date.now()}`,
        title: "Sub-brand theme reverted",
        body: "Studio House 01 has been restored to the global brand system with a correction summary.",
        tone: "warning",
        createdAt: "Now"
      },
      ...current
    ]);
  }, []);

  const masterResetTheme = React.useCallback(() => {
    setPresets(governancePresetsSeed);
    setStyleCardApproved(false);
    setNotifications((current) => [
      {
        id: `notice-master-reset-${Date.now()}`,
        title: "Master reset executed",
        body: "All overrides were cleared and the platform returned to the master brand defaults.",
        tone: "warning",
        createdAt: "Now"
      },
      ...current
    ]);
  }, []);

  const toggleFieldLock = React.useCallback((fieldId: string) => {
    setFieldLocks((current) =>
      current.map((field) => (field.id === fieldId ? { ...field, locked: !field.locked } : field))
    );
  }, []);

  const openTrainingModal = React.useCallback(() => setTrainingModalOpen(true), []);
  const closeTrainingModal = React.useCallback(() => setTrainingModalOpen(false), []);
  const updateTrainingModuleProgress = React.useCallback((moduleId: string, progress: number) => {
    const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));

    setTrainingModules((current) =>
      current.map((module) => (module.id === moduleId ? { ...module, progress: safeProgress } : module))
    );
  }, []);

  const completeTrainingModule = React.useCallback(() => {
    const trainingReady = trainingModules.every((module) => module.progress === 100);

    if (!trainingReady) {
      setTrainingModalOpen(true);
      setNotifications((current) => [
        {
          id: `notice-training-incomplete-${Date.now()}`,
          title: "Finish the certification first",
          body: "Watch all three training videos and answer the policy certification quiz correctly to complete recovery.",
          tone: "warning",
          createdAt: "Now"
        },
        ...current
      ]);
      return;
    }

    setTrainingModules((current) => current.map((module) => ({ ...module, progress: 100 })));
    setTrainingModalOpen(false);
    setComplianceScore((score) => Math.max(score, 76));
    unlockReward("Compliance Restored");
    updateChallengeProgress("challenge-training", 1);
    setNotifications((current) => [
      {
        id: `notice-training-${Date.now()}`,
        title: "Training completed",
        body: "The required guideline module is complete and the recovery path is unlocked.",
        tone: "success",
        createdAt: "Now"
      },
        ...current
      ]);
  }, [trainingModules, unlockReward, updateChallengeProgress]);

  const triggerOffBrandIncident = React.useCallback(() => {
    const actions = evaluatePolicies({
      actorRoleId: "sub-brand-manager",
      content: "off-brand campaign with unauthorized color system",
      containsUnauthorizedColor: true,
      containsWrongLogo: true,
      usesUnapprovedTemplate: true,
      repeatedViolations: 2
    });

    setIncidentTriggered(true);
    setAccessRestored(false);
    setAccountFrozen(false);
    setComplianceScore(63);
    setPolicyActions(actions);
    setNotifications((current) => [
      {
        id: `notice-incident-${Date.now()}`,
        title: "Brand policy incident detected",
        body: "A sub-brand campaign used the wrong logo, unauthorized colors, and an unapproved template.",
        tone: "warning",
        createdAt: "Now"
      },
      ...current
    ]);
    setAuditTrail((current) => [
      buildAuditEntry({
        actor: "Smart Brand Enforcement Engine",
        action: "Policy trigger",
        reason: "Off-brand post detected in the social feed.",
        policyRef: actions[0]?.policyRef ?? "MBP-101",
        outcome: "Compliance score dropped and review was opened."
      }),
      ...current
    ]);
  }, []);

  const freezeAccount = React.useCallback(() => {
    setAccountFrozen(true);
    setComplianceScore(48);
    setPolicyActions((current) => [
      ...current,
      {
        type: "freeze",
        message: "Publishing, listing edits, uploads, and campaign launch were frozen for review.",
        policyRef: "MBP-101",
        suggestedFix: "Complete the required training and resubmit with approved assets.",
        allowAppeal: true,
        severity: "critical"
      }
    ]);
    setNotifications((current) => [
      {
        id: `notice-freeze-${Date.now()}`,
        title: "Account moved to read-only",
        body: "The sub-brand received a branded notice with reason, duration, fix steps, and a training link.",
        tone: "warning",
        createdAt: "Now"
      },
      ...current
    ]);
    setAuditTrail((current) => [
      buildAuditEntry({
        actor: "Compliance Admin",
        action: "Freeze access",
        reason: "Off-brand content remained active after alert.",
        policyRef: "MBP-101",
        outcome: "Posting, listing edits, uploads, and campaigns were set to read-only."
      }),
      ...current
    ]);
    setTrainingModalOpen(true);
  }, []);

  const restoreAccess = React.useCallback(() => {
    const trainingReady = trainingModules.every((module) => module.progress === 100);

    if (!trainingReady) {
      setTrainingModalOpen(true);
      setNotifications((current) => [
        {
          id: `notice-restore-blocked-${Date.now()}`,
          title: "Recovery training still in progress",
          body: "Access can be restored after all three lessons and the policy certification quiz are completed correctly.",
          tone: "warning",
          createdAt: "Now"
        },
        ...current
      ]);
      return;
    }

    setAccountFrozen(false);
    setAccessRestored(true);
    setComplianceScore(84);
    setAuditTrail((current) => [
      buildAuditEntry({
        actor: "Master Brand Admin",
        action: "Restore access",
        reason: "Training and acknowledgment are complete.",
        policyRef: "SBP-118",
        outcome: "Permissions were restored and reputation recovery began."
      }),
      ...current
    ]);
    setNotifications((current) => [
      {
        id: `notice-restore-${Date.now()}`,
        title: "Access restored",
        body: "The sub-brand is back online and compliance recovery is now visible on the dashboard.",
        tone: "success",
        createdAt: "Now"
      },
        ...current
      ]);
  }, [trainingModules]);

  const continueRecovery = React.useCallback(() => {
    setComplianceScore((current) => Math.min(current + 4, 92));
  }, []);

  const updateScannerActivity = React.useCallback((kind: "lookups" | "uploads" | "scans", passport?: Passport | null) => {
    setScannerActivity((current) => ({
      ...current,
      [kind]: current[kind] + 1,
      latestPassportId: passport?.passportId ?? current.latestPassportId,
      latestLocation: passport?.factoryLocation ?? current.latestLocation,
      latestTimestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    }));
  }, []);

  const recordScannerLookup = React.useCallback((passport?: Passport | null) => {
    updateScannerActivity("lookups", passport);
    updateChallengeProgress("challenge-scan", 1);
  }, [updateChallengeProgress, updateScannerActivity]);

  const recordScannerUpload = React.useCallback((passport?: Passport | null) => {
    updateScannerActivity("uploads", passport);
  }, [updateScannerActivity]);

  const recordScannerScan = React.useCallback((passport?: Passport | null) => {
    updateScannerActivity("scans", passport);
  }, [updateScannerActivity]);

  const canAccess = React.useCallback(
    (capability: Parameters<typeof roleHasCapability>[1]) => roleHasCapability(selectedRole, capability),
    [selectedRole]
  );

  const completedChallengeCount = React.useMemo(
    () => challenges.filter((challenge) => challenge.progress >= challenge.target).length,
    [challenges]
  );

  const streakDays = React.useMemo(
    () =>
      Math.min(
        365,
        8 +
          completedChallengeCount * 3 +
          completedOnboarding.length * 2 +
          Math.min(scannerActivity.lookups, 2) +
          Math.min(scannerActivity.scans, 1) +
          Math.min(scannerActivity.uploads, 1) +
          Math.min(savedPosts.length, 1) +
          Math.min(followedProfileIds.length, 1)
      ),
    [
      completedChallengeCount,
      completedOnboarding.length,
      followedProfileIds.length,
      savedPosts.length,
      scannerActivity.lookups,
      scannerActivity.scans,
      scannerActivity.uploads
    ]
  );

  const streakLevel = React.useMemo(() => getStreakLevel(streakDays), [streakDays]);
  const streakRankLabel = React.useMemo(() => getStreakRank(streakDays), [streakDays]);
  const streakTier = React.useMemo(() => getStreakTier(streakDays), [streakDays]);
  const nextStreakTier = React.useMemo(() => getNextStreakTier(streakDays), [streakDays]);
  const streakVisualState: StreakVisualState = accountFrozen ? "frozen" : accessRestored ? "recovered" : incidentTriggered ? "warning" : "active";
  const streakImpactPointsToNextLevel = React.useMemo(
    () =>
      Math.max(
        12,
        91 -
          completedChallengeCount * 6 -
          followedProfileIds.length * 12 -
          completedOnboarding.length * 5 -
          scannerActivity.lookups * 4 -
          scannerActivity.uploads * 3 -
          scannerActivity.scans * 2
      ),
    [
      completedChallengeCount,
      completedOnboarding.length,
      followedProfileIds.length,
      scannerActivity.lookups,
      scannerActivity.scans,
      scannerActivity.uploads
    ]
  );

  const streak = React.useMemo<StreakSummary>(
    () => ({
      days: streakDays,
      level: streakLevel,
      rankLabel: streakRankLabel,
      tierLabel: streakTier.label,
      visualState: streakVisualState,
      impactPointsToNextLevel: streakImpactPointsToNextLevel,
      nextMilestoneDays: nextStreakTier?.minDays ?? null,
      statusMessage: getStreakStateMessage(streakVisualState, streakDays)
    }),
    [nextStreakTier?.minDays, streakDays, streakImpactPointsToNextLevel, streakLevel, streakRankLabel, streakTier.label, streakVisualState]
  );

  const previousStreakDays = React.useRef(0);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (previousStreakDays.current === 0) {
      previousStreakDays.current = streak.days;
      return;
    }

    const crossedMilestone = [...streakMilestones]
      .reverse()
      .find((milestone) => previousStreakDays.current < milestone && streak.days >= milestone);

    if (!crossedMilestone) {
      previousStreakDays.current = streak.days;
      return;
    }

    const tier = getStreakTier(crossedMilestone);
    setNotifications((current) => [
      {
        id: `notice-streak-${crossedMilestone}-${Date.now()}`,
        title: crossedMilestone === 7 ? "7-day streak unlocked! Your logo evolved." : tier.celebrationTitle,
        body: tier.celebrationBody,
        tone: "success",
        createdAt: "Now"
      },
      ...current
    ]);

    if (soundEnabled && crossedMilestone >= 7) {
      playDemoFanfare();
    }

    previousStreakDays.current = streak.days;
  }, [hydrated, soundEnabled, streak.days]);

  const impactMetrics = React.useMemo<ImpactMetrics>(() => {
    const baseline = roleMetricBaseline[selectedRoleId || "user"];
    const onboardingBonus = completedOnboarding.length * 18;

    return {
      views: baseline.views + onboardingBonus * 10 + likedPosts.length * 22,
      followers: baseline.followers + followedProfileIds.length * 3 + completedChallengeCount * 2,
      conversions: baseline.conversions + savedPosts.length * 4 + completedOnboarding.length * 5,
      sustainability: Math.min(100, baseline.sustainability + completedChallengeCount * 2 + (scannerActivity.lookups > 0 ? 2 : 0)),
      reach: Math.min(100, baseline.reach + completedOnboarding.length * 2 + likedPosts.length)
    };
  }, [selectedRoleId, completedChallengeCount, completedOnboarding, likedPosts.length, followedProfileIds.length, savedPosts.length, scannerActivity.lookups]);

  const impactPoints = React.useMemo(
    () => Math.round(impactMetrics.views / 10 + impactMetrics.conversions * 14 + impactMetrics.sustainability * 9),
    [impactMetrics]
  );

  const sustainabilityMetrics = React.useMemo<SustainabilityMetrics>(() => {
    const marketplaceCount = bootstrap?.marketplace.length ?? 0;

    return {
      carbonSavedKg: Math.round(scannerActivity.lookups * 3.4 + completedChallengeCount * 4.6 + marketplaceCount * 0.8),
      waterSavedLiters: Math.round(scannerActivity.uploads * 120 + completedChallengeCount * 240 + impactMetrics.sustainability * 12),
      itemsReused: Math.max(4, savedPosts.length + completedOnboarding.length + marketplaceCount),
      wasteDivertedKg: Math.round((savedPosts.length + challenges.length + completedOnboarding.length) * 1.8),
      communityImpact: Math.min(100, Math.round((impactMetrics.sustainability + impactMetrics.reach + complianceScore) / 3))
    };
  }, [bootstrap?.marketplace.length, challenges.length, completedChallengeCount, completedOnboarding.length, complianceScore, impactMetrics, savedPosts.length, scannerActivity.lookups, scannerActivity.uploads]);

  const leaderboard = React.useMemo<LeaderboardEntry[]>(() => {
    const currentRoleLabel = selectedRole?.label ?? "Demo role";
    const currentEntry: LeaderboardEntry = {
      id: "lead-current",
      name: "You",
      roleLabel: currentRoleLabel,
      impactPoints: impactMetrics.views / 10 + impactMetrics.conversions * 14 + impactMetrics.sustainability * 9,
      streakDays: streak.days,
      followersGained: impactMetrics.followers,
      sustainabilityActions: Math.round(impactMetrics.sustainability),
      trustScore: Math.max(72, complianceScore),
      referrals: Math.round(impactMetrics.conversions / 2),
      initials: "YO",
      tone: selectedRole?.accent ?? "from-forest-600 to-sand-300"
    };

    return [...leaderboardSeed, currentEntry].sort((left, right) => right.impactPoints - left.impactPoints);
  }, [complianceScore, impactMetrics, selectedRole, streak.days]);

  const feedPosts = React.useMemo(
    () =>
      feedPostsSeed
        .filter((post) => post.section === activeFeedSection)
        .map((post) => ({
          ...post,
          likes: post.likes + (likedPosts.includes(post.id) ? 1 : 0),
          shares: post.shares + (savedPosts.includes(post.id) ? 1 : 0)
        })),
    [activeFeedSection, likedPosts, savedPosts]
  );

  return React.useMemo(
    () => ({
      hydrated,
      token,
      bootstrap,
      loading,
      error,
      userLabel,
      bodyProfiles,
      selectedProfileId,
      selectedProfile,
      setSelectedProfileId: setSelectedProfile,
      saveBodyProfile,
      removeBodyProfile,
      login,
      register,
      logout,
      refreshBootstrap,
      refreshWardrobe,
      refreshOutfits,
      setBootstrap,
      roles,
      selectedRoleId,
      selectedRole,
      selectRole,
      onboardingStepIds: completedOnboarding,
      completeOnboardingStep,
      onboardingComplete: completedOnboarding.length === onboardingSteps.length,
      streak,
      impactPoints,
      impactMetrics,
      sustainabilityMetrics,
      leaderboard,
      challenges,
      completeChallenge,
      rewards,
      activeFeedSection,
      setActiveFeedSection,
      feedSections,
      feedPosts,
      likedPosts,
      savedPosts,
      toggleLikePost,
      toggleSavePost,
      followedProfileIds,
      toggleFollowProfile,
      discoveryProfiles,
      presets,
      duplicatePreset,
      approveStyleCard,
      styleCardApproved,
      revertSubBrandTheme,
      masterResetTheme,
      fieldLocks,
      toggleFieldLock,
      trainingModules,
      trainingModalOpen,
      openTrainingModal,
      closeTrainingModal,
      updateTrainingModuleProgress,
      completeTrainingModule,
      notifications,
      auditTrail,
      policyActions,
      complianceScore,
      incidentTriggered,
      accountFrozen,
      accessRestored,
      triggerOffBrandIncident,
      freezeAccount,
      restoreAccess,
      continueRecovery,
      scannerActivity,
      recordScannerLookup,
      recordScannerUpload,
      recordScannerScan,
      watermarkOpacity,
      setWatermarkOpacity,
      themeMode,
      setThemeMode,
      soundEnabled,
      setSoundEnabled,
      reducedMotion,
      setReducedMotion,
      accessibilityMode,
      setAccessibilityMode,
      batchFolders,
      selectedRoleCapabilities: selectedRole?.capabilities ?? [],
      canAccess
    }),
    [
      token,
      hydrated,
      bootstrap,
      loading,
      error,
      userLabel,
      bodyProfiles,
      selectedProfileId,
      selectedProfile,
      setSelectedProfile,
      saveBodyProfile,
      removeBodyProfile,
      login,
      register,
      logout,
      refreshBootstrap,
      refreshWardrobe,
      refreshOutfits,
      selectedRoleId,
      selectedRole,
      selectRole,
      completedOnboarding,
      completeOnboardingStep,
      streak,
      impactPoints,
      impactMetrics,
      sustainabilityMetrics,
      leaderboard,
      challenges,
      completeChallenge,
      rewards,
      activeFeedSection,
      feedPosts,
      likedPosts,
      savedPosts,
      toggleLikePost,
      toggleSavePost,
      followedProfileIds,
      toggleFollowProfile,
      presets,
      duplicatePreset,
      approveStyleCard,
      styleCardApproved,
      revertSubBrandTheme,
      masterResetTheme,
      fieldLocks,
      toggleFieldLock,
      trainingModules,
      trainingModalOpen,
      openTrainingModal,
      closeTrainingModal,
      updateTrainingModuleProgress,
      completeTrainingModule,
      notifications,
      auditTrail,
      policyActions,
      complianceScore,
      incidentTriggered,
      accountFrozen,
      accessRestored,
      triggerOffBrandIncident,
      freezeAccount,
      restoreAccess,
      continueRecovery,
      scannerActivity,
      recordScannerLookup,
      recordScannerUpload,
      recordScannerScan,
      watermarkOpacity,
      themeMode,
      soundEnabled,
      reducedMotion,
      accessibilityMode,
      batchFolders,
      canAccess
    ]
  );
}
