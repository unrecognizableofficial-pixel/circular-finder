"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, MoonStar, ShieldCheck, SunMedium, UserCog, Volume2, Waves } from "lucide-react";
import { FeaturePage } from "@/components/feature-page";
import { usePlatform } from "@/components/platform-state";
import { LogoGlowCounter, StreakLogo } from "@/components/streak-logo";

export default function SettingsDemo() {
  const {
    bootstrap,
    roles,
    selectedRoleId,
    selectRole,
    bodyProfiles,
    streak,
    themeMode,
    setThemeMode,
    soundEnabled,
    setSoundEnabled,
    reducedMotion,
    setReducedMotion,
    accessibilityMode,
    setAccessibilityMode
  } = usePlatform();

  const [status, setStatus] = React.useState("Your demo controls update the full Circular Finder experience in real time.");

  const handleThemeSwitch = React.useCallback(
    (target: "light" | "dark") => {
      const nextMode = themeMode === target ? (target === "light" ? "dark" : "light") : target;
      setThemeMode(nextMode);
      setStatus(nextMode === "dark" ? "Dark mode is active across the demo." : "Light mode is active across the demo.");
    },
    [setThemeMode, themeMode]
  );

  return (
    <FeaturePage
      eyebrow="Settings"
      title="Personalize the Circular Finder demo"
      description="Tune the experience, switch roles, and manage your presentation controls here. Trust, privacy, and policy tools now live in their own dedicated Trust Center."
      highlights={["Light mode", "Dark mode", "Trust Center"]}
      steps={[
        "Pick the theme and sound settings you want first.",
        "Turn on Accessibility mode if you want the easiest reading view.",
        "Change roles here if you want to test the app from another perspective."
      ]}
      actions={[
        { href: "/dashboard", label: "Go to Home Dashboard" },
        { href: "/trust", label: "Open Trust Center" }
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="grid gap-4">
          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Experience mode</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Theme, sound, and motion controls</h2>
              </div>
              <Waves className="h-5 w-5 text-forest-700" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <ToggleCard
                title="Light mode"
                description="Keep the soft editorial presentation for demos and screenshots."
                active={themeMode === "light"}
                icon={<SunMedium className="h-5 w-5" />}
                onClick={() => handleThemeSwitch("light")}
              />
              <ToggleCard
                title="Dark mode"
                description="Switch to a darker command-center feel while keeping the same data and flows."
                active={themeMode === "dark"}
                icon={<MoonStar className="h-5 w-5" />}
                onClick={() => handleThemeSwitch("dark")}
              />
              <ToggleCard
                title="Sound"
                description="Keep subtle reward and onboarding fanfare enabled."
                active={soundEnabled}
                icon={<Volume2 className="h-5 w-5" />}
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  setStatus(soundEnabled ? "Demo sound is muted." : "Demo sound is enabled.");
                }}
              />
              <ToggleCard
                title="Disable animations"
                description="Convert motion-heavy surfaces into a steadier, accessibility-friendly presentation."
                active={reducedMotion}
                icon={<ShieldCheck className="h-5 w-5" />}
                onClick={() => {
                  setReducedMotion(!reducedMotion);
                  setStatus(!reducedMotion ? "Reduced motion is active." : "Full motion is active.");
                }}
              />
            </div>

            <div className="mt-4 rounded-[1.75rem] bg-stone-950 p-5 text-stone-50">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">Accessibility mode</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-7 text-stone-200">
                  Increase readability and keep the interface easier to scan during presentations or walkthroughs.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAccessibilityMode(!accessibilityMode);
                    setStatus(!accessibilityMode ? "Accessibility mode is enabled." : "Accessibility mode is disabled.");
                  }}
                  className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-stone-950"
                >
                  {accessibilityMode ? "Turn off" : "Turn on"}
                </button>
              </div>
            </div>
          </article>

          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Role switcher</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Change perspective without resetting the demo</h2>
              </div>
              <UserCog className="h-5 w-5 text-forest-700" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    selectRole(role.id);
                    setStatus(`${role.label} is now active across the demo.`);
                  }}
                  className={[
                    "rounded-[1.5rem] border p-4 text-left transition",
                    selectedRoleId === role.id ? "border-forest-900 bg-forest-900 text-white shadow-soft" : "border-stone-200 bg-sand-50 text-stone-700 hover:bg-white"
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold">{role.label}</p>
                  <p className={["mt-2 text-sm leading-6", selectedRoleId === role.id ? "text-white/80" : "text-stone-600"].join(" ")}>{role.accessLevel}</p>
                </button>
              ))}
            </div>
          </article>

          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Trust Center</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Trust, privacy, and policy tools</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Trust, privacy, and policy tools are now visible across the Circular Finder demo in their own dedicated page, so Settings can stay focused on personalization.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <TrustShortcut
                title="Open Trust Center"
                description="Privacy Center, Legal Hub, Billing, AI Transparency, Security, and Account Management all live here now."
                href="/trust"
              />
              <TrustShortcut
                title="Open Account"
                description="Sign in, review session details, and manage account-facing controls from the account page."
                href="/profile"
              />
            </div>
          </article>
        </section>

        <section className="grid gap-4">
          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Streak identity</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Widget and push preview</h2>

            <LogoGlowCounter
              days={streak.days}
              state={streak.visualState}
              impactPointsToNextLevel={streak.impactPointsToNextLevel}
              compact
              className="mt-5"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-stone-200 bg-stone-950 p-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">Push preview</p>
                <div className="mt-4 flex items-center gap-3">
                  <StreakLogo days={streak.days} state={streak.visualState} size="sm" showDayBadge />
                  <div>
                    <p className="text-sm font-semibold">Keep your logo glowing — complete one action.</p>
                    <p className="mt-2 text-sm text-white/70">Your Circular Finder streak is ready today.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-stone-200 bg-sand-50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-forest-700">Widget preview</p>
                <div className="mt-4 flex items-center gap-3">
                  <StreakLogo days={streak.days} state={streak.visualState} size="sm" showDayBadge />
                  <div>
                    <p className="text-sm font-semibold text-stone-950">{streak.days} Day Logo Streak</p>
                    <p className="mt-2 text-sm text-stone-600">{streak.statusMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Saved fitting profiles</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Fit-ready profiles in this session</h2>
            <div className="mt-5 grid gap-3">
              {bodyProfiles.map((profile) => (
                <div key={profile.id} className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
                  <p className="text-sm font-semibold text-stone-950">{profile.name}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {profile.heightCm} cm • {profile.preferredFit} fit • {profile.stylePreferences.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Connected session</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Account snapshot</h2>
            <div className="mt-5 grid gap-3">
              <SessionStat label="Current user" value={bootstrap?.user?.profile.fullName ?? "Demo session"} />
              <SessionStat label="Email" value={bootstrap?.user?.profile.email ?? "local demo only"} />
              <SessionStat label="Wardrobe items" value={String(bootstrap?.user?.wardrobe.length ?? 0)} />
              <SessionStat label="Outfit suggestions" value={String(bootstrap?.user?.outfits.length ?? 0)} />
            </div>
          </article>

          <article className="theme-shell rounded-shell border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Demo status</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">What changed</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">{status}</p>
          </article>
        </section>
      </div>
    </FeaturePage>
  );
}

function ToggleCard({
  title,
  description,
  active,
  icon,
  onClick
}: {
  title: string;
  description: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[1.75rem] border p-5 text-left transition",
        active ? "border-forest-900 bg-forest-900 text-white shadow-soft" : "border-stone-200 bg-sand-50 text-stone-700 hover:bg-white"
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={["flex h-11 w-11 items-center justify-center rounded-2xl", active ? "bg-white/10" : "bg-white"].join(" ")}>{icon}</span>
        <span className={["rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", active ? "bg-white/10 text-white" : "bg-white text-stone-600"].join(" ")}>
          {active ? "On" : "Off"}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className={["mt-2 text-sm leading-6", active ? "text-white/80" : "text-stone-600"].join(" ")}>{description}</p>
    </button>
  );
}

function TrustShortcut({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href} className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4 transition hover:bg-white">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-stone-950">{title}</h3>
        <ArrowUpRight className="h-4 w-4 text-stone-500" />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
    </Link>
  );
}

function SessionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-950">{label}</p>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">{value}</span>
      </div>
    </div>
  );
}
