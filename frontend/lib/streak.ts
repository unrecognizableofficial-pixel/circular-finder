export type StreakTierId = "glow" | "pulse" | "aura" | "particles" | "halo" | "orbit" | "burst" | "mythic";

export type StreakVisualState = "active" | "warning" | "frozen" | "recovered";

export type StreakTier = {
  id: StreakTierId;
  minDays: number;
  label: string;
  motionLabel: string;
  celebrationTitle: string;
  celebrationBody: string;
};

export const streakTiers: StreakTier[] = [
  {
    id: "glow",
    minDays: 1,
    label: "Static logo glow",
    motionLabel: "Static glow",
    celebrationTitle: "Logo glow activated",
    celebrationBody: "Your Circular Finder logo is now the daily progress marker for every momentum action."
  },
  {
    id: "pulse",
    minDays: 3,
    label: "Soft pulse animation",
    motionLabel: "Soft pulse",
    celebrationTitle: "3-day pulse unlocked",
    celebrationBody: "Your logo now has a soft motion pulse to signal steady daily progress."
  },
  {
    id: "aura",
    minDays: 7,
    label: "Warm aura ring",
    motionLabel: "Warm aura",
    celebrationTitle: "7-day streak unlocked",
    celebrationBody: "Your logo evolved into a warm aura ring after a full week of Circular Finder actions."
  },
  {
    id: "particles",
    minDays: 14,
    label: "Energy particles",
    motionLabel: "Energy particles",
    celebrationTitle: "14-day energy unlocked",
    celebrationBody: "The streak marker now emits energy particles to spotlight your consistency."
  },
  {
    id: "halo",
    minDays: 30,
    label: "Golden animated halo",
    motionLabel: "Golden halo",
    celebrationTitle: "30-day halo unlocked",
    celebrationBody: "A golden halo now surrounds the Circular Finder logo for a month of momentum."
  },
  {
    id: "orbit",
    minDays: 60,
    label: "Electric orbit ring",
    motionLabel: "Electric orbit",
    celebrationTitle: "60-day orbit unlocked",
    celebrationBody: "The streak system has evolved into an electric orbit that signals durable habit formation."
  },
  {
    id: "burst",
    minDays: 100,
    label: "Legendary radiant logo burst",
    motionLabel: "Radiant burst",
    celebrationTitle: "100-day legendary burst",
    celebrationBody: "Your Circular Finder logo now carries a radiant burst that feels cinematic and rare."
  },
  {
    id: "mythic",
    minDays: 365,
    label: "Mythic animated crown + light beam",
    motionLabel: "Mythic crown",
    celebrationTitle: "365-day mythic crown",
    celebrationBody: "A crown and light beam now mark a full year of sustainable progress and brand loyalty."
  }
];

export const streakMilestones = streakTiers.map((tier) => tier.minDays);

export function getStreakTier(days: number): StreakTier {
  return [...streakTiers].reverse().find((tier) => days >= tier.minDays) ?? streakTiers[0];
}

export function getNextStreakTier(days: number): StreakTier | null {
  return streakTiers.find((tier) => tier.minDays > days) ?? null;
}

export function getStreakLevel(days: number) {
  return Math.max(1, Math.ceil(days / 3));
}

export function getStreakRank(days: number) {
  const level = getStreakLevel(days);

  if (level >= 16) return "Mythic Finder";
  if (level >= 12) return "Legendary Steward";
  if (level >= 8) return "Reuse Vanguard";
  if (level >= 5) return "Repair Ranger";
  if (level >= 3) return "Circular Explorer";
  return "Circular Starter";
}

export function getStreakStateMessage(state: StreakVisualState, days: number) {
  if (state === "warning") {
    return "Your streak needs one action today.";
  }

  if (state === "frozen") {
    return "Logo freeze is active while the account is in read-only recovery.";
  }

  if (state === "recovered") {
    return `Your ${days}-day logo streak reignited with a glow burst.`;
  }

  return "Keep your logo glowing with one meaningful action each day.";
}
