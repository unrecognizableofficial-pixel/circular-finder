"use client";

import clsx from "clsx";
import Image from "next/image";
import {
  getNextStreakTier,
  getStreakLevel,
  getStreakRank,
  getStreakStateMessage,
  getStreakTier,
  type StreakVisualState
} from "@/lib/streak";

type StreakLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

type StreakLogoProps = {
  days: number;
  state?: StreakVisualState;
  size?: StreakLogoSize;
  className?: string;
  showDayBadge?: boolean;
  muted?: boolean;
  priority?: boolean;
};

type LogoGlowCounterProps = {
  days: number;
  state?: StreakVisualState;
  impactPointsToNextLevel: number;
  className?: string;
  compact?: boolean;
  tone?: "light" | "dark";
};

type LogoMilestoneAnimationProps = {
  days: number;
  state?: StreakVisualState;
  className?: string;
  title?: string;
  body?: string;
};

type LogoFreezeStateProps = {
  days: number;
  state: StreakVisualState;
  className?: string;
};

const sizeClasses: Record<StreakLogoSize, string> = {
  xs: "h-10 w-10",
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-24 w-24",
  xl: "h-28 w-28"
};

const badgeClasses: Record<StreakLogoSize, string> = {
  xs: "px-1.5 py-0.5 text-[9px]",
  sm: "px-2 py-1 text-[9px]",
  md: "px-2 py-1 text-[10px]",
  lg: "px-2.5 py-1 text-[10px]",
  xl: "px-2.5 py-1 text-[10px]"
};

const particlePlacements = [
  { top: "10%", left: "50%", delay: "0s" },
  { top: "22%", left: "85%", delay: "0.2s" },
  { top: "52%", left: "92%", delay: "0.4s" },
  { top: "84%", left: "72%", delay: "0.6s" },
  { top: "90%", left: "34%", delay: "0.8s" },
  { top: "70%", left: "8%", delay: "1s" },
  { top: "32%", left: "10%", delay: "1.2s" },
  { top: "14%", left: "28%", delay: "1.4s" }
];

export function StreakLogo({
  days,
  state = "active",
  size = "md",
  className,
  showDayBadge = false,
  muted = false,
  priority = false
}: StreakLogoProps) {
  const tier = getStreakTier(days);
  const showParticles = ["particles", "halo", "orbit", "burst", "mythic"].includes(tier.id);
  const showHalo = ["halo", "orbit", "burst", "mythic"].includes(tier.id);
  const showOrbit = ["orbit", "burst", "mythic"].includes(tier.id);
  const showBurst = ["burst", "mythic"].includes(tier.id);
  const showCrown = tier.id === "mythic";

  return (
    <div className={clsx("cf-streak-shell relative isolate inline-flex items-center justify-center", sizeClasses[size], className)}>
      {tier.id === "pulse" ? <span className="cf-streak-soft-pulse absolute inset-[6%] rounded-[32%] bg-emerald-300/25" /> : null}
      {["aura", "particles", "halo", "orbit", "burst", "mythic"].includes(tier.id) ? (
        <span className="cf-streak-aura-ring absolute inset-[-8%] rounded-[2rem]" />
      ) : null}
      {showHalo ? <span className="cf-streak-golden-halo absolute inset-[-14%] rounded-[2.4rem]" /> : null}
      {showOrbit ? <span className="cf-streak-electric-orbit absolute inset-[-18%] rounded-[2.75rem]" /> : null}
      {showBurst ? <span className="cf-streak-radiant-burst absolute inset-[-22%] rounded-[3rem]" /> : null}
      {showParticles ? (
        <div className="pointer-events-none absolute inset-[-10%]">
          {particlePlacements.map((particle, index) => (
            <span
              key={`${particle.top}-${particle.left}-${index}`}
              className="cf-streak-particle absolute h-2 w-2 rounded-full bg-gradient-to-br from-amber-200 to-emerald-300"
              style={{ top: particle.top, left: particle.left, animationDelay: particle.delay }}
            />
          ))}
        </div>
      ) : null}
      {showCrown ? (
        <div className="cf-streak-mythic-crown pointer-events-none absolute -top-3 left-1/2 h-7 w-12 -translate-x-1/2">
          <span className="absolute left-0 top-4 h-3 w-3 rounded-full bg-amber-300" />
          <span className="absolute left-4 top-0 h-4 w-4 rounded-full bg-amber-200" />
          <span className="absolute right-4 top-0 h-4 w-4 rounded-full bg-amber-200" />
          <span className="absolute right-0 top-4 h-3 w-3 rounded-full bg-amber-300" />
          <span className="absolute inset-x-2 bottom-0 h-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300" />
        </div>
      ) : null}
      {state === "warning" ? <span className="cf-streak-warning-ring absolute inset-[-12%] rounded-[2.5rem]" /> : null}
      {state === "frozen" ? <span className="cf-streak-frozen-overlay absolute inset-[5%] rounded-[30%]" /> : null}
      {state === "recovered" ? <span className="cf-streak-reignite absolute inset-[-16%] rounded-[2.6rem]" /> : null}

      <div
        className={clsx(
          "relative h-full w-full overflow-hidden rounded-[28%] border border-white/70 bg-white/85 shadow-[0_18px_48px_rgba(22,36,31,0.16)]",
          muted && "grayscale opacity-55"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/28 via-transparent to-stone-950/10" />
        <Image
          src="/circular-finder/branding/circular-finder-streak-logo.svg"
          alt="Circular Finder logo used as the streak symbol"
          fill
          priority={priority}
          sizes="(max-width: 640px) 84px, 128px"
          className="object-cover"
        />
      </div>

      {showDayBadge ? (
        <span
          className={clsx(
            "absolute -bottom-1 -right-1 rounded-full border border-white/80 bg-white/95 font-semibold uppercase tracking-[0.18em] text-forest-800 shadow-sm",
            badgeClasses[size]
          )}
        >
          {days}d
        </span>
      ) : null}
    </div>
  );
}

export function LogoGlowCounter({
  days,
  state = "active",
  impactPointsToNextLevel,
  className,
  compact = false,
  tone = "light"
}: LogoGlowCounterProps) {
  const level = getStreakLevel(days);
  const rank = getStreakRank(days);
  const tier = getStreakTier(days);
  const nextTier = getNextStreakTier(days);
  const compactMeta = nextTier ? `Next ${nextTier.minDays}d` : "Top tier";

  return (
    <div
      className={clsx(
        "theme-shell flex items-center gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur-xl",
        compact ? "min-w-[16rem]" : "min-w-[22rem]",
        className
      )}
    >
      <StreakLogo days={days} state={state} size={compact ? "md" : "lg"} showDayBadge priority />
      <div className="min-w-0">
        <p className={clsx("text-[11px] font-semibold uppercase tracking-[0.22em]", tone === "dark" ? "text-emerald-200" : "text-forest-700")}>
          {compact ? `${days}d streak` : `${days} Day Streak`}
        </p>
        <h3 className={clsx("mt-2 truncate text-xl font-semibold tracking-tight", tone === "dark" ? "text-white" : "text-stone-950")}>
          Level {level} {rank}
        </h3>
        <p className={clsx("mt-2 text-sm", tone === "dark" ? "text-white/78" : "text-stone-600")}>
          {compact ? `${impactPointsToNextLevel} pts to next` : `${impactPointsToNextLevel} Impact Points™ to next level`}
        </p>
        <p className={clsx("mt-2 text-xs uppercase tracking-[0.18em]", tone === "dark" ? "text-white/55" : "text-stone-500")}>
          {compact
            ? compactMeta
            : `${tier.motionLabel}${nextTier ? ` • next at ${nextTier.minDays} days` : " • top tier unlocked"}`}
        </p>
        {!compact ? (
          <p className={clsx("mt-2 text-sm", tone === "dark" ? "text-white/75" : "text-stone-600")}>{getStreakStateMessage(state, days)}</p>
        ) : null}
      </div>
    </div>
  );
}

export function LogoMilestoneAnimation({
  days,
  state = "active",
  className,
  title,
  body
}: LogoMilestoneAnimationProps) {
  const tier = getStreakTier(days);
  const celebratoryTier = title ? null : tier;
  const addConfetti = tier.minDays === 7 || tier.minDays === 30 || tier.minDays === 100 || tier.minDays === 365;

  return (
    <div className={clsx("theme-shell relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur-xl", className)}>
      {addConfetti ? (
        <div className="pointer-events-none absolute inset-0">
          {[12, 24, 38, 52, 68, 82].map((left, index) => (
            <span
              key={left}
              className="cf-streak-confetti absolute top-4 h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-amber-300 via-emerald-300 to-cyan-300"
              style={{ left: `${left}%`, animationDelay: `${index * 0.18}s` }}
            />
          ))}
        </div>
      ) : null}

      <div className="relative flex items-center gap-4">
        <StreakLogo days={days} state={state} size="md" showDayBadge />
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-forest-700">Logo milestone</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-stone-950">
            {title ?? celebratoryTier?.celebrationTitle}
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {body ?? celebratoryTier?.celebrationBody}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LogoFreezeState({ days, state, className }: LogoFreezeStateProps) {
  const title =
    state === "frozen"
      ? "Logo freeze is active"
      : state === "recovered"
        ? "Logo reignited"
        : state === "warning"
          ? "Streak timer is active"
          : "Logo glow is healthy";

  const body =
    state === "frozen"
      ? "The Circular Finder logo now carries an icy crystal overlay while recovery and read-only mode are active."
      : state === "recovered"
        ? "The streak marker reignited with a glow burst after the recovery workflow completed."
        : state === "warning"
          ? "Your streak needs one action today to keep the logo glowing at full strength."
          : "Daily momentum is stable and the branded streak marker is glowing normally.";

  return (
    <div className={clsx("rounded-[1.5rem] border border-white/70 bg-stone-950 p-4 text-white shadow-soft", className)}>
      <div className="flex items-center gap-4">
        <StreakLogo days={days} state={state} size="sm" showDayBadge />
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">Streak state</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
        </div>
      </div>
    </div>
  );
}
