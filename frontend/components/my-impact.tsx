"use client";

import { Award, Sparkles, Trophy } from "lucide-react";
import { FeaturePage } from "@/components/feature-page";
import { usePlatform } from "@/components/platform-state";
import { LogoGlowCounter, StreakLogo } from "@/components/streak-logo";

export default function MyImpact() {
  const { selectedRole, impactMetrics, impactPoints, leaderboard, challenges, completeChallenge, rewards, streak } = usePlatform();
  const unlockedRewards = rewards.filter((reward) => reward.unlocked).length;
  const rewardPreviewDays = [1, 7, 14, 30, 60, 100];

  return (
    <FeaturePage
      eyebrow="My Impact"
      title="Gamified growth, trust, and sustainability outcomes"
      description="Track the signals that matter most for your selected role: audience growth, marketplace conversions, sustainability actions, trust score, rewards, and the branded Circular Finder streak."
      highlights={["Leaderboard", "Challenges", "Rewards"]}
      steps={[
        "Start with your points and streak summary.",
        "Complete one challenge to watch progress update.",
        "Use the rewards section to see what unlocks next."
      ]}
      actions={[
        { href: "/dashboard", label: "Go to Home Dashboard" },
        { href: "/sustainability", label: "Open Sustainability" }
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="grid gap-4">
          <div className="theme-shell rounded-shell border border-white/70 bg-gradient-to-r from-forest-900 via-stone-950 to-emerald-900 p-6 text-white shadow-shell">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-200">Impact Points™</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight">{impactPoints.toLocaleString()}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  Your selected role is building measurable audience momentum, commerce trust, and sustainability outcomes in one score.
                </p>
              </div>

              <div className="grid gap-3 lg:min-w-[25rem]">
                <LogoGlowCounter
                  days={streak.days}
                  state={streak.visualState}
                  impactPointsToNextLevel={streak.impactPointsToNextLevel}
                  compact
                  tone="dark"
                  className="border-white/10 bg-white/10 text-white shadow-none"
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricPanel label="Unlocked rewards" value={String(unlockedRewards)} />
                  <MetricPanel label="Reach pulse" value={`${impactMetrics.reach}/100`} />
                  <MetricPanel label="Sustainability" value={`${impactMetrics.sustainability}/100`} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Impact Points™" value={impactPoints.toLocaleString()} />
            <MetricCard label="Logo streak" value={`${streak.days} days`} />
            <MetricCard label="Followers gained" value={`+${impactMetrics.followers}`} />
            <MetricCard label="Sustainability" value={`${impactMetrics.sustainability}/100`} />
            <MetricCard label="Trust score" value={`${leaderboard[0]?.trustScore ?? 0}`} />
            <MetricCard label="Role reach" value={`${impactMetrics.reach}/100`} />
          </div>

          <div className="rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Leaderboard</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">{selectedRole?.label} Impact Points™ leaderboard</h2>
              </div>
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>

            <div className="mt-5 grid gap-3">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <article key={entry.id} className="grid gap-3 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4 md:grid-cols-[auto_minmax(0,1fr)_repeat(4,auto)] md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-stone-900 shadow-sm">
                      {index + 1}
                    </div>
                    <StreakLogo days={entry.streakDays} size="xs" showDayBadge muted={entry.id !== "lead-current"} />
                  </div>
                  <div>
                    <p className="text-base font-semibold tracking-tight text-stone-950">{entry.name}</p>
                    <p className="mt-1 text-sm text-stone-600">{entry.roleLabel}</p>
                  </div>
                  <Stat label="Points" value={Math.round(entry.impactPoints).toString()} />
                  <Stat label="Streak" value={`${entry.streakDays}d`} />
                  <Stat label="Followers" value={`+${entry.followersGained}`} />
                  <Stat label="Trust" value={`${entry.trustScore}`} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Challenges</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Progress ladder</h2>
              </div>
              <Sparkles className="h-6 w-6 text-fuchsia-500" />
            </div>

            <div className="mt-5 grid gap-3">
              {challenges.map((challenge) => {
                const complete = challenge.progress >= challenge.target;

                return (
                  <article key={challenge.id} className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <StreakLogo days={streak.days} state={complete ? streak.visualState : "active"} size="xs" muted={!complete} />
                        <div>
                          <p className="text-sm font-semibold text-stone-950">{challenge.title}</p>
                          <p className="mt-2 text-sm leading-6 text-stone-600">{challenge.description}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                        {challenge.category}
                      </span>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-white">
                      <div className="h-2 rounded-full bg-forest-800 transition-all" style={{ width: `${(challenge.progress / challenge.target) * 100}%` }} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-forest-800">
                        <StreakLogo days={complete ? streak.days : Math.max(1, Math.round(challenge.rewardPoints / 10))} size="xs" muted={!complete} />
                        Reward: {challenge.rewardPoints} Impact Points™ • {challenge.rewardBadge}
                      </span>
                      <button
                        type="button"
                        onClick={() => completeChallenge(challenge.id)}
                        className={[
                          "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                          complete ? "bg-emerald-50 text-emerald-800" : "bg-forest-900 text-white"
                        ].join(" ")}
                      >
                        {complete ? "Complete" : "Keep logo glowing"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Rewards</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Badge gallery</h2>
              </div>
              <Award className="h-6 w-6 text-amber-500" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {rewards.map((reward, index) => (
                <article
                  key={reward.id}
                  className={[
                    "rounded-[1.5rem] border p-4 transition",
                    reward.unlocked ? "border-emerald-200 bg-emerald-50" : "border-stone-200 bg-sand-50"
                  ].join(" ")}
                  title={reward.description}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-950">{reward.title}</p>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{reward.description}</p>
                    </div>
                    <StreakLogo
                      days={reward.unlocked ? streak.days : rewardPreviewDays[index % rewardPreviewDays.length]}
                      state={reward.unlocked ? streak.visualState : "active"}
                      size="sm"
                      muted={!reward.unlocked}
                      showDayBadge
                    />
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                    {reward.unlocked ? `Unlocked • ${reward.rarity}` : `Locked • ${reward.rarity}`}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </FeaturePage>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-shell rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">{value}</p>
    </div>
  );
}

function MetricPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">{value}</p>
    </div>
  );
}
